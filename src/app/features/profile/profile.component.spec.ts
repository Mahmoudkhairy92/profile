import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AchievementData, ExperienceData, Profile, ProjectData, SkillData, VentureData } from '../../core/models';

const PROFILE: Profile = {
  name: 'Mahmoud Khairy',
  title: 'Quality Engineering & Test Automation | AI Enablement & LLM Evaluation',
  summary: 'Summary.',
  location: 'Riyadh, Saudi Arabia',
  yearsOfExperience: 10,
  avatar: '/assets/images/profile-image.jpg',
  tagline: 'Tagline',
  highlights: [{ value: '10+', label: 'Years in software testing' }],
  focusAreas: [
    { title: 'Quality Engineering & Test Automation', tag: 'Primary focus', description: 'QE.', evidence: ['Led a team'], link: '/experience', linkLabel: 'Experience' },
    { title: 'AI Product Management', tag: 'Current role', secondary: true, description: 'PM.', evidence: ['AI Product Manager'], link: '/ventures', linkLabel: 'Products & Ventures' }
  ]
};

const PROJECTS: ProjectData = {
  projects: [
    { id: 'p1', name: 'Featured Project', description: 'D', role: 'Creator', company: 'THIQAH', startDate: '2024', endDate: 'Jun 2026', technologies: [], highlights: [], featured: true },
    { id: 'p2', name: 'Other Project', description: 'D', role: 'Role', startDate: '2019', endDate: '2022', technologies: [], highlights: [] }
  ]
};

const VENTURES: VentureData = {
  ventures: [
    { id: 'v1', name: 'Featured Venture', featured: true, type: 'Product', role: 'Founder', startDate: 'May 2026', affiliation: 'Independent', summary: 'S', team: 'Built by the Team.', myContributions: [] },
    { id: 'v2', name: 'Concept Venture', type: 'Concept', role: 'Creator', startDate: 'Aug 2026', affiliation: 'Independent', summary: 'S', myContributions: [] }
  ]
};

const ACHIEVEMENTS: AchievementData = {
  achievements: [
    { id: 'a1', title: 'Featured Award', description: 'D', date: '2024', category: 'award', organization: 'Org', featured: true },
    { id: 'a2', title: 'Other Recognition', description: 'D', date: '2025', category: 'recognition' }
  ]
};

const SKILLS: SkillData = {
  categories: [{ category: 'Test Automation', skills: [{ name: 'Playwright', category: 'Test Automation' }] }]
};

const EXPERIENCE: ExperienceData = {
  experiences: [
    { id: 'e1', company: 'THIQAH', position: 'AI Product Manager', location: 'Riyadh', startDate: 'Jun 2026', endDate: null, isCurrent: true, description: '', responsibilities: [], technologies: [], achievements: [] },
    { id: 'e2', company: 'THIQAH', position: 'Staff Engineer, Quality Control Automation', location: 'Riyadh', startDate: 'Jan 2024', endDate: 'Jun 2026', isCurrent: false, description: '', responsibilities: [], technologies: [], achievements: [] }
  ]
};

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function loadHomeData(): HTMLElement {
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('assets/data/profile.json').flush(PROFILE);
    http.expectOne('assets/data/projects.json').flush(PROJECTS);
    http.expectOne('assets/data/ventures.json').flush(VENTURES);
    http.expectOne('assets/data/achievements.json').flush(ACHIEVEMENTS);
    http.expectOne('assets/data/skills.json').flush(SKILLS);
    http.expectOne('assets/data/experience.json').flush(EXPERIENCE);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show highlights and focus areas with AI Product Management as the current role', () => {
    const element = loadHomeData();

    expect(element.querySelector('.highlight-value')?.textContent).toContain('10+');
    const focusCards = element.querySelectorAll('.focus-card');
    expect(focusCards[0].querySelector('.focus-title')?.textContent).toContain('Quality Engineering & Test Automation');
    expect(focusCards[1].classList).toContain('focus-secondary');
    expect(focusCards[1].querySelector('.focus-tag')?.textContent).toContain('Current role');
  });

  it('should feature only flagged projects, ventures and achievements', () => {
    const element = loadHomeData();
    const featured = Array.from(element.querySelectorAll('.featured-title')).map(title => title.textContent?.trim());
    const recognition = Array.from(element.querySelectorAll('.recognition-title')).map(title => title.textContent?.trim());

    expect(featured).toEqual(['Featured Project', 'Featured Venture']);
    expect(element.querySelector('.featured-team')?.textContent).toContain('Built by the Team.');
    expect(recognition).toEqual(['Featured Award']);
  });

  it('should list skills without self-assessed levels and mark the current role', () => {
    const element = loadHomeData();

    expect(element.querySelector('.skill-chip')?.textContent?.trim()).toBe('Playwright');
    expect(element.querySelector('.skill-groups')?.textContent).not.toMatch(/%|Expert|Beginner|Intermediate/);
    expect(element.querySelector('.career-step-current .career-role')?.textContent).toContain('AI Product Manager');
    expect(element.querySelectorAll('.career-step').length).toBe(2);
  });
});
