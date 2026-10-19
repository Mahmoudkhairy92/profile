export interface Course {
  id: string;
  title: string;
  provider: string;
  /** Shown when known; omitted where the date is not verified. */
  completionDate?: string;
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

