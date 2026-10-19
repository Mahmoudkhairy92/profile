import { CaseStudyRef } from './case-study.model';

/** A headline fact for the home page, e.g. { value: "10+", label: "Years in ..." }. */
export interface ProfileHighlight {
  value: string;
  label: string;
}

/** A professional focus area with supporting evidence and a link to detailed content. */
export interface FocusArea {
  title: string;
  tag: string;
  description: string;
  evidence: string[];
  link: string;
  linkLabel: string;
  /** Secondary to the primary Quality Engineering identity. */
  secondary?: boolean;
  caseStudy?: CaseStudyRef;
}

export interface Profile {
  name: string;
  title: string;
  summary: string;
  location: string;
  yearsOfExperience: number;
  avatar: string;
  tagline: string;
  linkedin?: string;
  highlights?: ProfileHighlight[];
  focusAreas?: FocusArea[];
}

