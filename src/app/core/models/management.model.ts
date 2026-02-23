export interface ManagementResponsibility {
  id: string;
  level: 'high' | 'low';
  title: string;
  organization: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  teamSize?: number;
  description: string;
  keyResponsibilities: string[];
  achievements: string[];
}

export interface ManagementData {
  responsibilities: ManagementResponsibility[];
}

