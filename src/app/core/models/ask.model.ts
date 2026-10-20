import { CaseStudySource } from './case-study.model';

/**
 * "Ask About Mahmoud": a client-side portfolio guide. Visitor questions are matched locally to
 * curated, approved answers; nothing is generated and nothing leaves the browser.
 */
export type AskLanguage = 'en' | 'ar';

export interface AskText {
  en: string;
  ar: string;
}

/** Terms (English and Arabic) that signal one idea, e.g. "contact". A trailing * matches a word prefix. */
export interface AskConcept {
  id: string;
  terms: string[];
}

export type AskContactChannel = 'riyadh' | 'egypt' | 'whatsapp' | 'email' | 'linkedin';

/** Answer parts rendered from the existing portfolio data instead of repeating it here. */
export type AskBlock =
  | { type: 'career' }
  | { type: 'contact'; channels: AskContactChannel[] }
  | { type: 'case-studies' }
  | { type: 'ventures'; ids: string[] }
  | { type: 'certifications' }
  | { type: 'achievements'; ids: string[] }
  | { type: 'skills' };

export interface AskLink {
  label: AskText;
  route?: string;
  fragment?: string;
  url?: string;
  action?: 'download-cv';
}

export interface AskEntry {
  id: string;
  /** 'answer': factual answer; 'not-covered': a topic the portfolio deliberately doesn't cover; 'system': greeting/thanks. */
  kind: 'answer' | 'not-covered' | 'system';
  question: AskText;
  variants: { en: string[]; ar: string[] };
  match: {
    /** Every group needs at least one of its concepts in the question. */
    required: string[][];
    /** Concepts that make this entry more relevant. */
    concepts: string[];
    /** Concepts that rule this entry out. */
    exclude?: string[];
  };
  /** Approved answer text; lines starting with "- " are list items. */
  answer: AskText;
  blocks?: AskBlock[];
  caveat?: AskText;
  sourceIds: string[];
  links: AskLink[];
  /** Offered as a suggested question. */
  suggested?: boolean;
}

export interface AskKnowledgeBase {
  lastReviewed: string;
  /** Sources not already defined in case-studies.json (both registries are used together). */
  sources: CaseStudySource[];
  stopwords: { en: string[]; ar: string[] };
  concepts: AskConcept[];
  entries: AskEntry[];
  ui: {
    fallback: AskText;
    clarify: AskText;
    fallbackLinks: AskLink[];
  };
}
