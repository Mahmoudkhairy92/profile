import type { AskConcept, AskEntry, AskKnowledgeBase, AskLanguage } from '../../core/models';

/**
 * Local question matching for "Ask About Mahmoud": Arabic/English normalization, concept
 * (synonym) detection and ranking against curated question variants. Low-confidence or close
 * matches ask the visitor to choose instead of answering, to avoid confident wrong answers.
 */

const ARABIC_LETTER = /[؀-ۿ]/;
const ARABIC_MARKS = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;
const ARABIC_PREFIXES = ['وال', 'بال', 'فال', 'كال', 'لل', 'ال'];

/** Score thresholds, tuned with the matcher specs. */
export const MATCH_THRESHOLDS = {
  /** Below this, nothing is close enough: fall back. */
  minimum: 1,
  /** At or above this (with a clear lead), answer directly. */
  confident: 1.6,
  /** A runner-up within this share of the best score makes the match ambiguous. */
  ambiguityRatio: 0.75
};

export type MatchOutcome =
  | { type: 'answer'; entry: AskEntry; related: AskEntry[] }
  | { type: 'clarify'; options: AskEntry[] }
  | { type: 'fallback'; suggestions: AskEntry[] };

export interface ScoredEntry {
  entry: AskEntry;
  score: number;
}

export function detectLanguage(text: string): AskLanguage {
  return ARABIC_LETTER.test(text) ? 'ar' : 'en';
}

/** Lower-cases, unifies Arabic letter forms and digits, and replaces punctuation with spaces. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(ARABIC_MARKS, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

/**
 * Light stemming: Arabic article/preposition prefixes and the possessive "his" on words ending in
 * ة or ات (مسيرته → مسيرة, شهاداته → شهادات; ة is normalized to ه), and English plurals.
 */
function stem(token: string): string {
  if (ARABIC_LETTER.test(token)) {
    const prefix = ARABIC_PREFIXES.find(candidate => token.startsWith(candidate) && token.length - candidate.length >= 2);
    const word = prefix ? token.slice(prefix.length) : token;
    if (word.length >= 6 && word.endsWith('اته')) {
      return word.slice(0, -1);
    }
    if (word.length >= 5 && word.endsWith('ته')) {
      return word.slice(0, -2) + 'ه';
    }
    return word;
  }
  if (token.length > 4 && token.endsWith('ies')) {
    return token.slice(0, -3) + 'y';
  }
  if (token.length > 4 && token.endsWith('s') && !token.endsWith('ss')) {
    return token.slice(0, -1);
  }
  return token;
}

export function tokenize(text: string): string[] {
  return normalize(text).split(' ').filter(Boolean).map(stem);
}

/** Edit distance of at most one (for small typos in longer words). */
function withinOneEdit(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) {
    return false;
  }
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) {
      return false;
    }
    if (a.length > b.length) {
      i++;
    } else if (a.length < b.length) {
      j++;
    } else {
      i++;
      j++;
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

interface CompiledTerm {
  tokens: string[];
  prefix: boolean;
}

interface CompiledConcept {
  id: string;
  terms: CompiledTerm[];
}

interface Signature {
  concepts: Set<string>;
  features: Set<string>;
}

interface CompiledEntry {
  entry: AskEntry;
  variants: Signature[];
}

function tokenMatches(queryToken: string, term: CompiledTerm, termToken: string, single: boolean): boolean {
  if (queryToken === termToken) {
    return true;
  }
  if (term.prefix && single) {
    return queryToken.startsWith(termToken);
  }
  // Tolerate one typo in longer single-word terms (e.g. "certifcation")
  return single && termToken.length >= 6 && withinOneEdit(queryToken, termToken);
}

/** Positions of the question's tokens covered by occurrences of a term. */
function termPositions(tokens: string[], term: CompiledTerm): number[] {
  const single = term.tokens.length === 1;
  const positions: number[] = [];
  for (let start = 0; start + term.tokens.length <= tokens.length; start++) {
    if (term.tokens.every((termToken, offset) => tokenMatches(tokens[start + offset], term, termToken, single))) {
      term.tokens.forEach((_, offset) => positions.push(start + offset));
    }
  }
  return positions;
}

/** Compiles the knowledge base once; returns a matcher for visitor questions. */
export function createMatcher(knowledgeBase: AskKnowledgeBase, extraConcepts: AskConcept[] = []) {
  const concepts: CompiledConcept[] = [...knowledgeBase.concepts, ...extraConcepts].map(concept => ({
    id: concept.id,
    terms: concept.terms
      .map(term => ({ tokens: tokenize(term.replace(/\*$/, '')), prefix: term.endsWith('*') }))
      .filter(term => term.tokens.length > 0)
  }));
  const stopwords = new Set([...knowledgeBase.stopwords.en, ...knowledgeBase.stopwords.ar].flatMap(tokenize));

  // A question's features are the concepts it mentions plus its remaining content words; words
  // that matched a concept count only as that concept, so synonyms compare as equal.
  const signature = (text: string): Signature => {
    const tokens = tokenize(text);
    const found = new Set<string>();
    const covered = new Set<number>();
    for (const concept of concepts) {
      const positions = concept.terms.flatMap(term => termPositions(tokens, term));
      if (positions.length) {
        found.add(concept.id);
        positions.forEach(position => covered.add(position));
      }
    }
    const words = tokens.filter((token, index) => !covered.has(index) && !stopwords.has(token));
    return { concepts: found, features: new Set([...[...found].map(id => `concept:${id}`), ...words]) };
  };

  const compiled: CompiledEntry[] = knowledgeBase.entries.map(entry => ({
    entry,
    variants: [entry.question.en, entry.question.ar, ...entry.variants.en, ...entry.variants.ar].map(signature)
  }));

  const similarity = (a: Set<string>, b: Set<string>): number => {
    if (!a.size || !b.size) {
      return 0;
    }
    let shared = 0;
    a.forEach(feature => b.has(feature) && shared++);
    return (2 * shared) / (a.size + b.size);
  };

  /** Entries ranked by relevance (only those whose required concepts are present). */
  const rank = (question: string): ScoredEntry[] => {
    const query = signature(question);
    return compiled
      .map(({ entry, variants }) => {
        const { required, concepts: related, exclude = [] } = entry.match;
        const eligible = required.every(group => group.some(id => query.concepts.has(id)))
          && !exclude.some(id => query.concepts.has(id));
        if (!eligible) {
          return { entry, score: 0 };
        }
        const hits = related.filter(id => query.concepts.has(id)).length;
        const best = Math.max(...variants.map(variant => similarity(query.features, variant.features)));
        return { entry, score: hits + 2 * best };
      })
      .filter(scored => scored.score > 0)
      .sort((a, b) => b.score - a.score);
  };

  const match = (question: string): MatchOutcome => {
    const ranked = rank(question);
    const [best, second] = ranked;
    const factual = ranked.filter(scored => scored.entry.kind === 'answer');
    if (!best || best.score < MATCH_THRESHOLDS.minimum) {
      return { type: 'fallback', suggestions: factual.slice(0, 3).map(scored => scored.entry) };
    }
    const close = ranked.filter(scored => scored.score >= Math.max(MATCH_THRESHOLDS.minimum, best.score * MATCH_THRESHOLDS.ambiguityRatio));
    if (best.score >= MATCH_THRESHOLDS.confident && (!second || close.length === 1)) {
      const related = factual.filter(scored => scored.entry !== best.entry).slice(0, 2).map(scored => scored.entry);
      return { type: 'answer', entry: best.entry, related };
    }
    return { type: 'clarify', options: close.slice(0, 3).map(scored => scored.entry) };
  };

  return { rank, match, signature };
}

export type AskMatcher = ReturnType<typeof createMatcher>;
