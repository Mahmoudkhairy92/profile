/**
 * Evidence-based case studies. Every published claim carries the type of evidence behind it and
 * the sources that back it, so pages (and a future portfolio assistant) can show or retrieve only
 * approved facts. Unconfirmed material is not published here.
 */
export type CaseStudyEvidenceType = 'cv' | 'portfolio' | 'public-product' | 'synthetic' | 'methodology';

/** Separates individual work from team work, product capabilities and illustrative demo results. */
export type CaseStudyAttribution = 'individual' | 'team' | 'product-capability' | 'illustrative-demo';

export type CaseStudySectionId =
  | 'executive-summary'
  | 'context'
  | 'role'
  | 'approach'
  | 'decisions'
  | 'tools'
  | 'results'
  | 'challenges'
  | 'lessons';

export interface CaseStudyEvidenceTypeInfo {
  label: string;
  description: string;
}

export interface CaseStudySource {
  id: string;
  type: 'cv' | 'portfolio' | 'public-product';
  title: string;
  /** Internal route, e.g. '/projects', with an optional fragment. */
  route?: string;
  fragment?: string;
  /** External URL. CV sources have neither; pages offer the CV download instead. */
  url?: string;
  verifiedOn?: string;
}

export interface CaseStudyItem {
  label?: string;
  text: string;
  evidence: CaseStudyEvidenceType;
  sourceIds?: string[];
}

export interface CaseStudyMetric {
  value: string;
  label: string;
  /** What the figure covers and who it is attributed to. */
  scope: string;
  evidence: CaseStudyEvidenceType;
  sourceIds: string[];
}

export interface CaseStudyGroup {
  title: string;
  attribution?: CaseStudyAttribution;
  items?: CaseStudyItem[];
  /** Short lists such as tools; evidence applies to the whole group. */
  chips?: string[];
  evidence?: CaseStudyEvidenceType;
  sourceIds?: string[];
  note?: string;
}

export interface CaseStudyExampleField {
  name: string;
  value: string;
}

/** A worked example, always shown with a visible label and disclaimer. */
export interface CaseStudyExample {
  title: string;
  label: string;
  evidence: 'synthetic' | 'public-product';
  attribution?: CaseStudyAttribution;
  sourceIds?: string[];
  fields: CaseStudyExampleField[];
  disclaimer: string;
}

export interface CaseStudySection {
  id: CaseStudySectionId;
  title: string;
  paragraphs?: CaseStudyItem[];
  items?: CaseStudyItem[];
  metrics?: CaseStudyMetric[];
  groups?: CaseStudyGroup[];
  examples?: CaseStudyExample[];
  notes?: string[];
}

/** A section left out because no verified source supports it yet. Kept in the data, not rendered. */
export interface CaseStudyOmission {
  section: CaseStudySectionId;
  reason: string;
}

export interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  summary: string;
  organization: string;
  role: string;
  period: string;
  tags: string[];
  /** Sections in display order; sections without supported evidence are omitted. */
  sections: CaseStudySection[];
  omittedSections?: CaseStudyOmission[];
  /** Sources listed under "Relevant Links and References". */
  sourceIds: string[];
}

export interface CaseStudyData {
  lastUpdated: string;
  evidenceTypes: Record<CaseStudyEvidenceType, CaseStudyEvidenceTypeInfo>;
  sources: CaseStudySource[];
  caseStudies: CaseStudy[];
}

/** Link from another page (experience, projects, ventures, home) to a case study. */
export interface CaseStudyRef {
  slug: string;
  title: string;
}
