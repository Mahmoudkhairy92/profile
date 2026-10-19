import { CaseStudyRef } from './case-study.model';

export interface VentureLink {
  label: string;
  url: string;
}

export interface VentureProduct {
  name: string;
  description: string;
  links?: VentureLink[];
}

/**
 * An independent product or venture (separate from employment). Fields separate the owner's
 * own contributions from team credit and keep qualifications next to the claims they qualify.
 */
export interface Venture {
  id: string;
  name: string;
  /** Shown in Featured Work on the home page. */
  featured?: boolean;
  type: string;
  role: string;
  startDate: string;
  status?: string;
  affiliation: string;
  engagement?: string;
  summary: string;
  team?: string;
  myContributions: string[];
  capabilities?: string[];
  products?: VentureProduct[];
  notes?: string[];
  links?: VentureLink[];
  caseStudy?: CaseStudyRef;
}

export interface VentureData {
  ventures: Venture[];
}
