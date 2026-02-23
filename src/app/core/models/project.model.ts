export interface Project {
  id: string;
  name: string;
  description: string;
  role: string;
  startDate: string;
  endDate: string | null;
  technologies: string[];
  highlights: string[];
  imageUrl?: string;
  githubUrl?: string;
  liveUrl?: string;
  isStrategicInitiative?: boolean;
}

export interface ProjectData {
  projects: Project[];
}

