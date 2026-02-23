export interface Course {
  id: string;
  title: string;
  provider: string;
  completionDate: string;
  certificateUrl?: string;
  courseUrl?: string;
  level?: string;
  instructor?: string;
  skills: string[];
  duration?: string;
  description?: string;
}

export interface CourseData {
  courses: Course[];
}

