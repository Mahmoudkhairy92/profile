export interface Skill {
  name: string;
  /** Optional proficiency level (1-9); skills are listed without self-assessed levels. */
  level?: number;
  proficiency?: 'Expert' | 'Intermediate' | 'Beginner';
  category: string;
  /** Font Awesome icon class (e.g. 'fab fa-angular'). When set, used instead of lookup. */
  icon?: string;
  yearsOfExperience?: number;
  endorsements?: number;
  since?: number;
}

export interface SkillCategory {
  category: string;
  skills: Skill[];
}

export interface SkillData {
  categories: SkillCategory[];
}

