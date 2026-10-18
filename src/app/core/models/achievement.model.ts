export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  category: 'award' | 'certification' | 'recognition' | 'milestone';
  organization?: string;
  icon?: string;
  articleUrl?: string;
  /** Shown in Recognition & Certifications on the home page. */
  featured?: boolean;
}

export interface AchievementData {
  achievements: Achievement[];
}

