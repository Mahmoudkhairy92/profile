import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ExperienceCardComponent } from './experience-card.component';

describe('ExperienceCardComponent', () => {
  let component: ExperienceCardComponent;
  let fixture: ComponentFixture<ExperienceCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExperienceCardComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ExperienceCardComponent);
    component = fixture.componentInstance;
    component.experience = {
      id: '1',
      company: 'Company',
      position: 'Position',
      location: 'Location',
      startDate: '2020',
      endDate: null,
      isCurrent: true,
      description: 'Description',
      responsibilities: [],
      technologies: [],
      achievements: []
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should link to a case study only when the role has one', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('a[href^="/case-studies"]')).toBeNull();

    fixture.componentRef.setInput('experience', { ...component.experience, caseStudy: { slug: 'role-study', title: 'Role Study' } });
    fixture.detectChanges();

    const link = element.querySelector('a[href^="/case-studies"]');
    expect(link?.getAttribute('href')).toBe('/case-studies/role-study');
    expect(link?.textContent).toContain('Case study: Role Study');
  });
});

