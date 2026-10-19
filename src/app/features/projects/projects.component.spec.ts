import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectsComponent } from './projects.component';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { ViewportScroller } from '@angular/common';
import { Project, ProjectData } from '../../core/models';

const project = (overrides: Partial<Project>): Project => ({
  id: 'p',
  name: 'Project',
  description: 'Description',
  role: 'Role',
  startDate: '2024',
  endDate: 'Jun 2026',
  technologies: [],
  highlights: [],
  ...overrides
});

const PROJECTS: ProjectData = {
  projects: [
    project({ id: 'a', name: 'Initiative', category: 'thiqah-initiative', company: 'THIQAH' }),
    project({ id: 'b', name: 'Hackathon', category: 'hackathon', startDate: 'Dec 2025', endDate: 'Dec 2025' }),
    project({
      id: 'c', name: 'Framework', category: 'quality-engineering', startDate: 'Sep 2022', endDate: 'Jan 2024',
      caseStudy: { slug: 'framework-study', title: 'Framework Study' }
    }),
    project({ id: 'd', name: 'Uncategorized', endDate: null })
  ]
};

describe('ProjectsComponent', () => {
  let component: ProjectsComponent;
  let fixture: ComponentFixture<ProjectsComponent>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectsComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should group projects by category and keep uncategorized projects', () => {
    http.expectOne('assets/data/projects.json').flush(PROJECTS);

    expect(component.projectGroups().map(group => group.title)).toEqual([
      'THIQAH Professional Initiatives',
      'Quality Engineering Projects',
      'Hackathons',
      'Other Projects'
    ]);
  });

  it('should label THIQAH dates as the contribution period', () => {
    http.expectOne('assets/data/projects.json').flush(PROJECTS);
    fixture.detectChanges();
    const card = (fixture.nativeElement as HTMLElement).querySelector('#project-a');

    expect(card?.querySelector('.project-meta')?.textContent?.trim()).toBe('My contribution: 2024 - Jun 2026');
    expect(card?.querySelector('.project-role')?.textContent).toContain('THIQAH');
  });

  it('should show single-date events and open-ended periods', () => {
    http.expectOne('assets/data/projects.json').flush(PROJECTS);

    expect(component.formatPeriod(PROJECTS.projects[1])).toBe('Dec 2025');
    expect(component.formatPeriod(PROJECTS.projects[3])).toBe('2024 - Present');
  });

  it('should link a project to its case study', () => {
    http.expectOne('assets/data/projects.json').flush(PROJECTS);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    const link = element.querySelector('#project-c .project-links a');
    expect(link?.getAttribute('href')).toBe('/case-studies/framework-study');
    expect(link?.textContent).toContain('Case study: Framework Study');
    expect(element.querySelector('#project-a .project-links')).toBeNull();
  });
});

describe('ProjectsComponent anchor navigation', () => {
  let scrollToAnchor: ReturnType<typeof vi.fn>;

  async function openProjects(url: string): Promise<RouterTestingHarness> {
    scrollToAnchor = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'projects', component: ProjectsComponent }]),
        {
          provide: ViewportScroller,
          useValue: { scrollToAnchor, setOffset: vi.fn(), scrollToPosition: vi.fn(), getScrollPosition: () => [0, 0], setHistoryScrollRestoration: vi.fn() }
        }
      ]
    });
    return RouterTestingHarness.create(url);
  }

  async function loadProjects(): Promise<void> {
    TestBed.inject(HttpTestingController).expectOne('assets/data/projects.json').flush(PROJECTS);
    TestBed.tick();
    // The scroll waits for web fonts (a resolved promise in the test environment).
    await new Promise(resolve => setTimeout(resolve));
  }

  it('should scroll to the card once it renders after the data loads, keeping the query string', async () => {
    await openProjects('/projects?utm_source=linkedin#project-c');
    expect(scrollToAnchor).not.toHaveBeenCalled();

    await loadProjects();

    expect(scrollToAnchor).toHaveBeenCalledTimes(1);
    expect(scrollToAnchor).toHaveBeenCalledWith('project-c', { behavior: 'instant' });
    expect(TestBed.inject(Router).url).toBe('/projects?utm_source=linkedin#project-c');
  });

  it('should not scroll again when the view re-renders', async () => {
    const harness = await openProjects('/projects#project-a');
    await loadProjects();

    harness.detectChanges();
    TestBed.tick();
    await new Promise(resolve => setTimeout(resolve));

    expect(scrollToAnchor).toHaveBeenCalledTimes(1);
  });

  it('should not scroll without a fragment or for an unknown card', async () => {
    await openProjects('/projects?utm_source=linkedin');
    await loadProjects();
    expect(scrollToAnchor).not.toHaveBeenCalled();

    TestBed.resetTestingModule();
    await openProjects('/projects#project-missing');
    await loadProjects();
    expect(scrollToAnchor).not.toHaveBeenCalled();
  });
});
