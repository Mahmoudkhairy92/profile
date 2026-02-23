export interface Experience {
  id: string;
  company: string;
  companyFullName?: string;
  companyLogo?: string;
  companyWebsite?: string;
  companyDescription?: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  description: string;
  responsibilities: string[];
  technologies: string[];
  achievements: string[];
}

export interface ExperienceData {
  experiences: Experience[];
}

