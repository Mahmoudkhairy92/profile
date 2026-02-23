import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { 
  Profile, 
  ExperienceData, 
  ProjectData, 
  AchievementData, 
  CourseData, 
  ManagementData, 
  SkillData, 
  TimelineData, 
  Contact 
} from '../models';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigDataService {
  private readonly baseUrl = 'assets/data';

  // Signals for each data type
  private profileSignal = signal<Profile | null>(null);
  private experienceSignal = signal<ExperienceData | null>(null);
  private projectsSignal = signal<ProjectData | null>(null);
  private achievementsSignal = signal<AchievementData | null>(null);
  private coursesSignal = signal<CourseData | null>(null);
  private managementSignal = signal<ManagementData | null>(null);
  private skillsSignal = signal<SkillData | null>(null);
  private timelineSignal = signal<TimelineData | null>(null);
  private contactSignal = signal<Contact | null>(null);

  // Readonly computed signals
  readonly profile = computed(() => this.profileSignal());
  readonly experience = computed(() => this.experienceSignal());
  readonly projects = computed(() => this.projectsSignal());
  readonly achievements = computed(() => this.achievementsSignal());
  readonly courses = computed(() => this.coursesSignal());
  readonly management = computed(() => this.managementSignal());
  readonly skills = computed(() => this.skillsSignal());
  readonly timeline = computed(() => this.timelineSignal());
  readonly contact = computed(() => this.contactSignal());

  // Loading states
  private loadingSignal = signal<boolean>(false);
  readonly isLoading = computed(() => this.loadingSignal());

  constructor(private http: HttpClient) {}

  loadProfile(): void {
    this.loadingSignal.set(true);
    this.http.get<Profile>(`${this.baseUrl}/profile.json`)
      .pipe(
        tap(data => {
          this.profileSignal.set(data);
          this.loadingSignal.set(false);
        }),
        catchError(error => {
          console.error('Error loading profile:', error);
          this.loadingSignal.set(false);
          return of(null);
        })
      )
      .subscribe();
  }

  loadExperience(): void {
    this.http.get<ExperienceData>(`${this.baseUrl}/experience.json`)
      .pipe(
        tap(data => this.experienceSignal.set(data)),
        catchError(error => {
          console.error('Error loading experience:', error);
          return of(null);
        })
      )
      .subscribe();
  }

  loadProjects(): void {
    this.http.get<ProjectData>(`${this.baseUrl}/projects.json`)
      .pipe(
        tap(data => this.projectsSignal.set(data)),
        catchError(error => {
          console.error('Error loading projects:', error);
          return of(null);
        })
      )
      .subscribe();
  }

  loadAchievements(): void {
    this.http.get<AchievementData>(`${this.baseUrl}/achievements.json`)
      .pipe(
        tap(data => this.achievementsSignal.set(data)),
        catchError(error => {
          console.error('Error loading achievements:', error);
          return of(null);
        })
      )
      .subscribe();
  }

  loadCourses(): void {
    this.http.get<CourseData>(`${this.baseUrl}/courses.json`)
      .pipe(
        tap(data => this.coursesSignal.set(data)),
        catchError(error => {
          console.error('Error loading courses:', error);
          return of(null);
        })
      )
      .subscribe();
  }

  loadManagement(): void {
    this.http.get<ManagementData>(`${this.baseUrl}/management.json`)
      .pipe(
        tap(data => this.managementSignal.set(data)),
        catchError(error => {
          console.error('Error loading management:', error);
          return of(null);
        })
      )
      .subscribe();
  }

  loadSkills(): void {
    this.http.get<SkillData>(`${this.baseUrl}/skills.json`)
      .pipe(
        tap(data => this.skillsSignal.set(data)),
        catchError(error => {
          console.error('Error loading skills:', error);
          return of(null);
        })
      )
      .subscribe();
  }

  loadTimeline(): void {
    this.http.get<TimelineData>(`${this.baseUrl}/timeline.json`)
      .pipe(
        tap(data => this.timelineSignal.set(data)),
        catchError(error => {
          console.error('Error loading timeline:', error);
          return of(null);
        })
      )
      .subscribe();
  }

  loadContact(): void {
    this.http.get<Contact>(`${this.baseUrl}/contact.json`)
      .pipe(
        tap(data => this.contactSignal.set(data)),
        catchError(error => {
          console.error('Error loading contact:', error);
          return of(null);
        })
      )
      .subscribe();
  }

  // Load all data at once
  loadAllData(): void {
    this.loadProfile();
    this.loadExperience();
    this.loadProjects();
    this.loadAchievements();
    this.loadCourses();
    this.loadManagement();
    this.loadSkills();
    this.loadTimeline();
    this.loadContact();
  }
}

