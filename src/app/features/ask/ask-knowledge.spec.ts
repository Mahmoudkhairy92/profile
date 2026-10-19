import knowledgeBaseJson from '../../../../public/assets/data/ask-mahmoud.json';
import achievementsJson from '../../../../public/assets/data/achievements.json';
import caseStudiesJson from '../../../../public/assets/data/case-studies.json';
import contactJson from '../../../../public/assets/data/contact.json';
import coursesJson from '../../../../public/assets/data/courses.json';
import experienceJson from '../../../../public/assets/data/experience.json';
import profileJson from '../../../../public/assets/data/profile.json';
import projectsJson from '../../../../public/assets/data/projects.json';
import skillsJson from '../../../../public/assets/data/skills.json';
import venturesJson from '../../../../public/assets/data/ventures.json';
import { routes } from '../../app.routes';
import { AskKnowledgeBase, AskLink, CaseStudyData } from '../../core/models';

/**
 * Integrity checks on the "Ask About Mahmoud" knowledge base: complete bilingual entries, valid
 * concepts, sources and links, no figures that the approved portfolio data doesn't contain, and
 * accurate QCVerse Team attribution.
 */
const kb = knowledgeBaseJson as unknown as AskKnowledgeBase;
const caseStudies = caseStudiesJson as unknown as CaseStudyData;
const ARABIC = /[؀-ۿ]/;
const answers = kb.entries.filter(entry => entry.kind === 'answer');

/** All approved portfolio data except the guide itself. */
const approvedText = JSON.stringify([
  profileJson, experienceJson, projectsJson, venturesJson, achievementsJson, coursesJson, skillsJson, contactJson, caseStudiesJson
]);

describe('ask-mahmoud.json entries', () => {
  it('should have 15–30 factual answers with unique ids and 6–10 suggested questions', () => {
    expect(new Set(kb.entries.map(entry => entry.id)).size).toBe(kb.entries.length);
    expect(answers.length).toBeGreaterThanOrEqual(15);
    expect(answers.length).toBeLessThanOrEqual(30);
    const suggested = kb.entries.filter(entry => entry.suggested);
    expect(suggested.length).toBeGreaterThanOrEqual(6);
    expect(suggested.length).toBeLessThanOrEqual(10);
    expect(suggested.every(entry => entry.kind === 'answer')).toBe(true);
  });

  it('should provide every question and answer in English and Arabic', () => {
    for (const entry of kb.entries) {
      expect(entry.question.en, entry.id).toBeTruthy();
      expect(ARABIC.test(entry.question.ar), entry.id).toBe(true);
      expect(entry.answer.en.length, entry.id).toBeGreaterThan(20);
      expect(ARABIC.test(entry.answer.ar), entry.id).toBe(true);
      expect(ARABIC.test(entry.answer.en), entry.id).toBe(false);
      expect(entry.variants.en.length + entry.variants.ar.length, entry.id).toBeGreaterThanOrEqual(3);
      if (entry.caveat) {
        expect(ARABIC.test(entry.caveat.ar), entry.id).toBe(true);
      }
    }
  });

  it('should only use defined concepts', () => {
    const concepts = new Set([...kb.concepts.map(concept => concept.id), 'tool']);
    for (const entry of kb.entries) {
      const used = [...entry.match.required.flat(), ...entry.match.concepts, ...(entry.match.exclude ?? [])];
      expect(entry.match.required.length, entry.id).toBeGreaterThan(0);
      for (const id of used) {
        expect(concepts.has(id), `${entry.id}: ${id}`).toBe(true);
      }
    }
  });
});

describe('ask-mahmoud.json evidence and links', () => {
  const sources = new Map([...caseStudies.sources, ...kb.sources].map(source => [source.id, source]));
  const paths = new Set(routes.map(route => `/${route.path}`));
  const slugs = new Set(caseStudies.caseStudies.map(study => study.slug));
  const projectAnchors = new Set(projectsJson.projects.map(project => `project-${project.id}`));
  const sectionAnchors = new Set([...caseStudies.caseStudies.flatMap(study => study.sections.map(section => section.id)), 'references']);

  const routeExists = (route: string) =>
    paths.has(route) || (route.startsWith('/case-studies/') && slugs.has(route.slice('/case-studies/'.length)));

  const checkLink = (link: AskLink, context: string) => {
    expect(link.label.en && ARABIC.test(link.label.ar) || link.label.ar === link.label.en, context).toBeTruthy();
    expect([link.route, link.url, link.action].filter(Boolean).length, context).toBe(1);
    if (link.route) {
      expect(routeExists(link.route), `${context}: ${link.route}`).toBe(true);
    }
    if (link.fragment) {
      const anchors = link.route === '/projects' ? projectAnchors : sectionAnchors;
      expect(anchors.has(link.fragment), `${context}: #${link.fragment}`).toBe(true);
    }
    if (link.url) {
      expect(link.url, context).toMatch(/^https:\/\//);
    }
  };

  it('should back every factual answer with known sources, and claim none for guardrail replies', () => {
    for (const entry of kb.entries) {
      for (const id of entry.sourceIds) {
        expect(sources.has(id), `${entry.id}: ${id}`).toBe(true);
      }
      expect(entry.sourceIds.length > 0, entry.id).toBe(entry.kind === 'answer');
    }
    for (const source of kb.sources) {
      expect(['cv', 'portfolio', 'public-product'], source.id).toContain(source.type);
      if (source.route) {
        expect(routeExists(source.route), source.id).toBe(true);
      }
    }
  });

  it('should only link to existing pages, anchors and https sites', () => {
    for (const entry of kb.entries) {
      entry.links.forEach((link, index) => checkLink(link, `${entry.id}[${index}]`));
      if (entry.kind !== 'system') {
        expect(entry.links.length, entry.id).toBeGreaterThan(0);
      }
    }
    kb.ui.fallbackLinks.forEach((link, index) => checkLink(link, `fallback[${index}]`));
  });

  it('should reference existing ventures and achievements in derived blocks', () => {
    const ventureIds = new Set(venturesJson.ventures.map(venture => venture.id));
    const achievementIds = new Set(achievementsJson.achievements.map(achievement => achievement.id));
    for (const block of kb.entries.flatMap(entry => entry.blocks ?? [])) {
      if (block.type === 'ventures') {
        block.ids.forEach(id => expect(ventureIds.has(id), id).toBe(true));
      }
      if (block.type === 'achievements') {
        block.ids.forEach(id => expect(achievementIds.has(id), id).toBe(true));
      }
    }
  });
});

describe('ask-mahmoud.json content accuracy', () => {
  it('should not contain any figure that the approved portfolio data does not contain', () => {
    for (const entry of kb.entries) {
      const texts = [entry.answer.en, entry.answer.ar, entry.caveat?.en ?? '', entry.caveat?.ar ?? ''];
      const figures = texts.join(' ').match(/~?\d+(?:,\d{3})*(?:\.\d+)?[+%]?/g) ?? [];
      for (const figure of figures) {
        expect(approvedText.includes(figure), `${entry.id}: ${figure}`).toBe(true);
      }
    }
  });

  it('should credit the QCVerse Team and never present QCVerse as built by Mahmoud alone', () => {
    for (const id of ['qcverse', 'qcverse-team', 'internal-platform-vs-qcverse']) {
      const entry = kb.entries.find(item => item.id === id)!;
      expect(entry.answer.en, id).toContain('QCVerse Team');
      expect(entry.answer.ar, id).toContain('فريق QCVerse');
      expect(entry.answer.en, id).not.toMatch(/(?:he|Mahmoud) (?:built|developed|created) QCVerse/i);
    }
    expect(kb.entries.find(item => item.id === 'qcverse-team')!.answer.en).toMatch(/^No\./);
  });

  it('should keep leadership scoped and avoid hiring guarantees or unapproved claims', () => {
    const allText = JSON.stringify(kb.entries.map(entry => [entry.answer, entry.caveat]));
    expect(allText).not.toMatch(/managed (?:a team of )?~?70|manages ~?70|70 direct reports/i);
    expect(allText).not.toMatch(/guarantee|perfect fit|best candidate/i);
    expect(allText).not.toMatch(/80%|50K\+|LEAP|Certificate of Appreciation|Leadership Program|deep admiration/i);
    const leadership = kb.entries.find(item => item.id === 'leadership')!;
    expect(leadership.caveat?.en).toContain('not a team he managed');
  });

  it('should describe the internal THIQAH platform generically, without its internal name, and keep it apart from QCVerse', () => {
    // The internal initiative's name is not approved for public disclosure (anywhere in the guide's data,
    // including keywords and ids); its verified, scoped results stay.
    expect(JSON.stringify(kb)).not.toMatch(/quality[\s_-]*mate|كواليتي|كوالتي/i);
    const platform = kb.entries.find(item => item.id === 'ai-enablement')!;
    expect(platform.answer.en).toContain('internal AI-enabled Quality Engineering platform at THIQAH');
    expect(platform.answer.en).toContain('5 teams (~20 QC engineers)');
    expect(platform.answer.en).toContain('40%');
    const comparison = kb.entries.find(item => item.id === 'internal-platform-vs-qcverse')!;
    expect(comparison.answer.en).toContain('not affiliated with THIQAH');
    expect(comparison.answer.en).toContain('internal AI-enabled Quality Engineering platform');
  });

  it('should present LLM evaluation methodology separately from what he did', () => {
    const methods = kb.entries.find(item => item.id === 'llm-methods')!;
    expect(methods.answer.en).toContain('general methodology');
    expect(methods.answer.en).toContain('hands-on exploration');
    expect(methods.answer.en).toMatch(/not as tools used in that evaluation/);
  });
});
