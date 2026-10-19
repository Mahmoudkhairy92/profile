import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ViewportScroller } from '@angular/common';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { CaseStudyDetailComponent } from './case-study-detail.component';
import { CASE_STUDY_DATA } from './case-study.fixtures';

describe('CaseStudyDetailComponent', () => {
  let scrollToAnchor: ReturnType<typeof vi.fn>;

  async function openCaseStudy(url: string): Promise<HTMLElement> {
    scrollToAnchor = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'case-studies/:slug', component: CaseStudyDetailComponent }]),
        {
          provide: ViewportScroller,
          useValue: { scrollToAnchor, setOffset: vi.fn(), scrollToPosition: vi.fn(), getScrollPosition: () => [0, 0], setHistoryScrollRestoration: vi.fn() }
        }
      ]
    });
    const harness = await RouterTestingHarness.create(url);
    TestBed.inject(HttpTestingController).expectOne('assets/data/case-studies.json').flush(CASE_STUDY_DATA);
    harness.detectChanges();
    return harness.routeNativeElement as HTMLElement;
  }

  const texts = (element: ParentNode, selector: string) =>
    Array.from(element.querySelectorAll(selector)).map(node => node.textContent?.replace(/\s+/g, ' ').trim());

  it('should render the case study facts, sections and table of contents', async () => {
    const element = await openCaseStudy('/case-studies/first-study');

    expect(element.querySelector('h1')?.textContent).toContain('First Study');
    expect(texts(element, '.case-fact dd')).toEqual(['Org', 'Lead', '2024']);
    expect(texts(element, '.case-section-title')).toEqual(['Executive Summary', 'Approach and Methodology', 'Results and Evidence']);
    expect(texts(element, '.case-toc-list a')).toEqual([
      'Executive Summary', 'Approach and Methodology', 'Results and Evidence', 'Relevant Links and References'
    ]);
    expect(element.querySelector('.case-toc-list a')?.getAttribute('href')).toBe('/case-studies/first-study#executive-summary');
  });

  it('should tag every statement with its evidence and explain only the evidence types used', async () => {
    const element = await openCaseStudy('/case-studies/first-study');

    expect(element.querySelector('.case-paragraph .evidence-tag')?.textContent).toContain('CV');
    const workflow = texts(element, '.case-item');
    expect(workflow[0]).toContain('Scenario design');
    expect(workflow[0]).toMatch(/Evidence: CV$/);
    expect(workflow[1]).toMatch(/Evidence: General methodology$/);
    expect(texts(element, '.evidence-key-list .evidence-tag')).toEqual([
      'Evidence: CV', 'Evidence: General methodology', 'Evidence: Synthetic example'
    ]);
    expect(texts(element, '.case-metric-scope')).toEqual(['Across 10+ projects.']);
  });

  it('should label synthetic examples and show their disclaimer', async () => {
    const element = await openCaseStudy('/case-studies/first-study');
    const example = element.querySelector('.case-example')!;

    expect(example.classList).toContain('case-example-synthetic');
    expect(example.querySelector('.case-example-label')?.textContent).toContain('Synthetic example');
    expect(example.querySelector('.case-example-disclaimer')?.textContent).toContain('Written for this page.');
  });

  it('should list only the referenced sources, grouped by type, with working links', async () => {
    const element = await openCaseStudy('/case-studies/first-study');
    const references = element.querySelector('#references')!;

    expect(texts(references, '.reference-group-title')).toEqual(['CV', 'On this portfolio', 'Public product information']);
    expect(references.textContent).toContain('CV: Sample role');
    expect(references.textContent).not.toContain('CV: Not referenced');
    expect(references.querySelector('button.reference-action')?.textContent).toContain('Download CV');
    const [portfolioLink, publicLink] = Array.from(references.querySelectorAll<HTMLAnchorElement>('.reference-list a'));
    expect(portfolioLink.getAttribute('href')).toBe('/projects#project-p1');
    expect(publicLink.getAttribute('href')).toBe('https://example.com/');
    expect(publicLink.getAttribute('rel')).toBe('noopener noreferrer');
    expect(references.querySelector('.reference-checked')?.textContent).toContain('Checked 18 Oct 2026');
  });

  it('should link to the neighbouring case studies', async () => {
    const element = await openCaseStudy('/case-studies/first-study');

    expect(element.querySelector('.case-pager-previous')).toBeNull();
    expect(element.querySelector('.case-pager-next')?.getAttribute('href')).toBe('/case-studies/second-study');
    expect(element.querySelector('.case-pager-all')?.getAttribute('href')).toBe('/case-studies');
  });

  it('should show a not-found message for an unknown case study', async () => {
    const element = await openCaseStudy('/case-studies/missing');

    expect(element.querySelector('.case-not-found-title')?.textContent).toContain('Case study not found');
    expect(element.querySelector('.case-section')).toBeNull();
  });

  it('should scroll to the section of a direct link once it renders, only once', async () => {
    await openCaseStudy('/case-studies/first-study#results');
    TestBed.tick();
    // The scroll waits for web fonts (a resolved promise in the test environment).
    await new Promise(resolve => setTimeout(resolve));

    expect(scrollToAnchor).toHaveBeenCalledTimes(1);
    expect(scrollToAnchor).toHaveBeenCalledWith('results', { behavior: 'instant' });
  });

  it('should re-scroll when the current section is selected again in the table of contents', async () => {
    const element = await openCaseStudy('/case-studies/first-study#results');
    TestBed.tick();
    await new Promise(resolve => setTimeout(resolve));
    scrollToAnchor.mockClear();

    const resultsLink = Array.from(element.querySelectorAll<HTMLAnchorElement>('.case-toc-list a'))
      .find(link => link.textContent?.includes('Results'))!;
    resultsLink.click();

    expect(scrollToAnchor).toHaveBeenCalledWith('results', { behavior: 'instant' });
  });
});
