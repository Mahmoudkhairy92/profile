import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { VenturesComponent } from './ventures.component';
import { VentureData } from '../../core/models';

const VENTURES: VentureData = {
  ventures: [
    {
      id: 'sample',
      name: 'Sample Product',
      type: 'Product',
      role: 'Founder',
      startDate: 'May 2026',
      affiliation: 'Independent, not affiliated with an employer',
      summary: 'A sample product.',
      team: 'Built by the Sample Team.',
      myContributions: ['Product direction'],
      links: [{ label: 'Website', url: 'https://example.com/' }]
    }
  ]
};

describe('VenturesComponent', () => {
  let fixture: ComponentFixture<VenturesComponent>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenturesComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(VenturesComponent);
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render role, team credit, affiliation and external links', () => {
    http.expectOne('assets/data/ventures.json').flush(VENTURES);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.venture-name')?.textContent).toContain('Sample Product');
    expect(element.querySelector('.venture-meta')?.textContent).toContain('Founder');
    expect(element.querySelector('.venture-team')?.textContent).toContain('Built by the Sample Team.');
    expect(element.querySelector('.venture-affiliation')?.textContent).toContain('Independent');
    const link = element.querySelector<HTMLAnchorElement>('.venture-links a');
    expect(link?.getAttribute('href')).toBe('https://example.com/');
    expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
  });
});
