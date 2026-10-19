import { CaseStudyRef } from './case-study.model';

/** Groups projects on the Projects page; dates of employment projects are the contribution period. */
export type ProjectCategory = 'thiqah-initiative' | 'quality-engineering' | 'hackathon';

export interface Project {
  id: string;
  name: string;
  description: string;
  role: string;
  category?: ProjectCategory;
  company?: string;
  startDate: string;
  endDate: string | null;
  technologies: string[];
  highlights: string[];
  imageUrl?: string;
  githubUrl?: string;
  liveUrl?: string;
  isStrategicInitiative?: boolean;
  /** Shown in Featured Work on the home page. */
  featured?: boolean;
  caseStudy?: CaseStudyRef;
}

export interface ProjectData {
  projects: Project[];
}

