import caseStudiesJson from '../../../../public/assets/data/case-studies.json';
import experienceJson from '../../../../public/assets/data/experience.json';
import profileJson from '../../../../public/assets/data/profile.json';
import projectsJson from '../../../../public/assets/data/projects.json';
import venturesJson from '../../../../public/assets/data/ventures.json';
import { routes } from '../../app.routes';
import { CaseStudyData, CaseStudyRef, CaseStudySectionId } from '../../core/models';
import { SOURCED_EVIDENCE_TYPES, caseStudyClaims } from './case-study-claims';

/**
 * Evidence-integrity checks on the published case-study data: every factual statement names
 * sources that exist and are listed as references, methodology and synthetic material is kept
 * apart from claims about my work, and links from other pages point to real case studies.
 */
const data = caseStudiesJson as unknown as CaseStudyData;
const SECTION_ORDER: CaseStudySectionId[] = [
  'executive-summary', 'context', 'role', 'approach', 'decisions', 'tools', 'results', 'challenges', 'lessons'
];
const sources = new Map(data.sources.map(source => [source.id, source]));

describe('case-studies.json', () => {
  it('should have unique ids and slugs, and sections in the standard order', () => {
    expect(new Set(data.caseStudies.map(study => study.slug)).size).toBe(data.caseStudies.length);
    expect(new Set(data.caseStudies.map(study => study.id)).size).toBe(data.caseStudies.length);
    expect(new Set(data.sources.map(source => source.id)).size).toBe(data.sources.length);
    for (const study of data.caseStudies) {
      expect(study.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      const order = study.sections.map(section => SECTION_ORDER.indexOf(section.id));
      expect(order.every(index => index >= 0)).toBe(true);
      expect([...order].sort((a, b) => a - b)).toEqual(order);
      const omitted = (study.omittedSections ?? []).map(omission => omission.section);
      expect(study.sections.some(section => omitted.includes(section.id))).toBe(false);
    }
  });

  it('should back every career and product statement with listed, existing sources', () => {
    for (const study of data.caseStudies) {
      for (const claim of caseStudyClaims(study)) {
        expect(Object.keys(data.evidenceTypes)).toContain(claim.evidence);
        if (SOURCED_EVIDENCE_TYPES.includes(claim.evidence)) {
          expect(claim.sourceIds.length, `${study.slug}: ${claim.text}`).toBeGreaterThan(0);
        }
        for (const id of claim.sourceIds) {
          expect(sources.has(id), `${study.slug}: unknown source ${id}`).toBe(true);
          expect(study.sourceIds, `${study.slug}: ${id} missing from references`).toContain(id);
        }
      }
      for (const id of study.sourceIds) {
        expect(sources.has(id), `${study.slug}: unknown reference ${id}`).toBe(true);
      }
    }
  });

  it('should keep general methodology free of sources and tag every tool list', () => {
    for (const study of data.caseStudies) {
      for (const claim of caseStudyClaims(study).filter(item => item.evidence === 'methodology')) {
        expect(claim.sourceIds, `${study.slug}: ${claim.text}`).toEqual([]);
      }
      for (const group of study.sections.flatMap(section => section.groups ?? [])) {
        if (group.chips?.length) {
          expect(group.evidence, `${study.slug}: ${group.title}`).toBeDefined();
        }
      }
    }
  });

  it('should label every worked example and give it a disclaimer', () => {
    const examples = data.caseStudies.flatMap(study => study.sections.flatMap(section => section.examples ?? []));
    expect(examples.length).toBeGreaterThan(0);
    for (const example of examples) {
      expect(example.disclaimer.length).toBeGreaterThan(0);
      if (example.evidence === 'synthetic') {
        expect(example.label).toMatch(/synthetic/i);
      } else {
        expect(example.label).toMatch(/illustrative/i);
      }
    }
  });

  it('should only link to existing portfolio routes and dated public pages', () => {
    const paths = new Set(routes.map(route => `/${route.path}`));
    for (const source of data.sources) {
      if (source.type === 'portfolio') {
        expect(paths, source.id).toContain(source.route);
      }
      if (source.type === 'public-product') {
        expect(source.url).toMatch(/^https:\/\//);
        expect(source.verifiedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
      if (source.type === 'cv') {
        expect(source.route ?? source.url).toBeUndefined();
      }
    }
  });

  it('should credit the QCVerse Team, keep QCVerse separate from THIQAH and frame the demo as one run', () => {
    const qcverse = data.caseStudies.find(study => study.slug === 'qcverse-product-development')!;
    const text = JSON.stringify(qcverse);

    expect(qcverse.organization).toContain('not a THIQAH initiative');
    expect(text).toContain('QCVerse Team');
    const demo = qcverse.sections.flatMap(section => section.examples ?? [])[0];
    expect(demo.attribution).toBe('illustrative-demo');
    expect(demo.disclaimer).toContain('One run on a synthetic requirement');
    expect(demo.disclaimer).toContain('capped at 99%');
    // Marketing figures from the QCVerse website are not used as evidence
    expect(text).not.toMatch(/80%|50K\+|15\+|24\/7|100% cloud/i);
  });
});

describe('case-study links from other pages', () => {
  const slugTitles = new Map(data.caseStudies.map(study => [study.slug, study.title]));
  const refs: CaseStudyRef[] = [
    ...profileJson.focusAreas.map(area => (area as { caseStudy?: CaseStudyRef }).caseStudy),
    ...experienceJson.experiences.map(item => (item as { caseStudy?: CaseStudyRef }).caseStudy),
    ...projectsJson.projects.map(item => (item as { caseStudy?: CaseStudyRef }).caseStudy),
    ...venturesJson.ventures.map(item => (item as { caseStudy?: CaseStudyRef }).caseStudy)
  ].filter((ref): ref is CaseStudyRef => !!ref);

  it('should point to existing case studies with their current titles', () => {
    expect(refs.length).toBeGreaterThan(0);
    for (const ref of refs) {
      expect(slugTitles.get(ref.slug), ref.slug).toBe(ref.title);
    }
  });

  it('should link every case study from at least one other page', () => {
    const linked = new Set(refs.map(ref => ref.slug));
    expect([...slugTitles.keys()].every(slug => linked.has(slug))).toBe(true);
  });
});
