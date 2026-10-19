import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { CaseStudiesComponent } from './case-studies.component';
import { CASE_STUDY_DATA } from './case-study.fixtures';

describe('CaseStudiesComponent', () => {
  let fixture: ComponentFixture<CaseStudiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaseStudiesComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(CaseStudiesComponent);
    fixture.detectChanges();
  });

  it('should show a loading state until the case studies load', () => {
    expect((fixture.nativeElement as HTMLElement).querySelector('.spinner-border')).not.toBeNull();
  });

  it('should list every case study with its context and a link to its page', () => {
    TestBed.inject(HttpTestingController).expectOne('assets/data/case-studies.json').flush(CASE_STUDY_DATA);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    const cards = element.querySelectorAll('.case-study-card');
    expect(cards.length).toBe(2);
    expect(cards[0].querySelector('.case-study-kind')?.textContent).toContain('Org');
    expect(cards[0].querySelector('.case-study-meta')?.textContent).toContain('Lead');
    expect(cards[0].querySelector('.case-study-summary')?.textContent).toContain('First summary.');
    expect(cards[0].querySelector('.case-study-title a')?.getAttribute('href')).toBe('/case-studies/first-study');
    const readLink = cards[1].querySelector('.case-study-link');
    expect(readLink?.getAttribute('href')).toBe('/case-studies/second-study');
    expect(readLink?.getAttribute('aria-label')).toBe('Read the case study: Second Study');
  });
});
