import { CaseStudy, CaseStudyEvidenceType, CaseStudySection, CaseStudySectionId } from '../../core/models';

/** Display order of evidence types: verified facts first, then methodology and illustrations. */
export const EVIDENCE_TYPE_ORDER: CaseStudyEvidenceType[] = ['cv', 'portfolio', 'public-product', 'methodology', 'synthetic'];

/** Evidence types that must name the sources backing the claim. */
export const SOURCED_EVIDENCE_TYPES: CaseStudyEvidenceType[] = ['cv', 'portfolio', 'public-product'];

/** One published statement of a case study, with the evidence behind it. */
export interface CaseStudyClaim {
  sectionId: CaseStudySectionId;
  text: string;
  evidence: CaseStudyEvidenceType;
  sourceIds: string[];
}

/** Flattens every published statement of a case study (paragraphs, items, metrics, tool lists, examples). */
export function caseStudyClaims(study: CaseStudy): CaseStudyClaim[] {
  return study.sections.flatMap(section => sectionClaims(section));
}

/** Every published statement of one section. */
export function sectionClaims(section: CaseStudySection): CaseStudyClaim[] {
  const claims: CaseStudyClaim[] = [];
  const add = (text: string, evidence: CaseStudyEvidenceType, sourceIds: string[] = []) =>
    claims.push({ sectionId: section.id, text, evidence, sourceIds });

  for (const item of [...(section.paragraphs ?? []), ...(section.items ?? [])]) {
    add(item.text, item.evidence, item.sourceIds);
  }
  for (const metric of section.metrics ?? []) {
    add(`${metric.value} ${metric.label}: ${metric.scope}`, metric.evidence, metric.sourceIds);
  }
  for (const group of section.groups ?? []) {
    for (const item of group.items ?? []) {
      add(item.text, item.evidence, item.sourceIds);
    }
    if (group.chips?.length && group.evidence) {
      add(`${group.title}: ${group.chips.join(', ')}`, group.evidence, group.sourceIds);
    }
  }
  for (const example of section.examples ?? []) {
    add(`${example.title}: ${example.fields.map(field => `${field.name}: ${field.value}`).join('; ')}`, example.evidence, example.sourceIds);
  }
  return claims;
}

/**
 * The evidence type shared by every statement of a list of two or more, if there is one. Pages
 * label such a list once, next to its heading, instead of repeating the same tag on each line.
 */
export function sharedEvidence(statements: { evidence: CaseStudyEvidenceType }[]): CaseStudyEvidenceType | null {
  if (statements.length < 2) {
    return null;
  }
  const [first] = statements;
  return statements.every(statement => statement.evidence === first.evidence) ? first.evidence : null;
}

/** Evidence types used by a case study, in display order. */
export function caseStudyEvidenceTypes(study: CaseStudy): CaseStudyEvidenceType[] {
  const used = new Set(caseStudyClaims(study).map(claim => claim.evidence));
  return EVIDENCE_TYPE_ORDER.filter(type => used.has(type));
}
