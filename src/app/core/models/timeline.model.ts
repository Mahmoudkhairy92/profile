export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  subtitle: string;
  description: string;
  type: 'work' | 'education' | 'achievement' | 'project' | 'certification';
  icon?: string;
}

export interface TimelineData {
  events: TimelineEvent[];
}

