import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { ConfigDataService } from '../../core/services';
import { CASE_STUDY_FALLBACK_TITLE, caseStudyTitleResolver } from './case-study-title.resolver';
import { CASE_STUDY_DATA } from './case-study.fixtures';

@Component({ template: '' })
class BlankComponent {}

describe('caseStudyTitleResolver', () => {
  let harness: RouterTestingHarness;
  let http: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'case-studies/:slug', component: BlankComponent, title: caseStudyTitleResolver }])
      ]
    });
    harness = await RouterTestingHarness.create();
    http = TestBed.inject(HttpTestingController);
  });

  it('should title the page after the case study once the data has loaded', async () => {
    const navigation = harness.navigateByUrl('/case-studies/first-study');
    await new Promise(resolve => setTimeout(resolve));
    http.expectOne('assets/data/case-studies.json').flush(CASE_STUDY_DATA);
    await navigation;

    expect(TestBed.inject(Title).getTitle()).toBe('First Study | Case Study | Mahmoud Khairy');
  });

  it('should reuse loaded data and keep the title for in-page fragment links', async () => {
    TestBed.inject(ConfigDataService).loadCaseStudies();
    http.expectOne('assets/data/case-studies.json').flush(CASE_STUDY_DATA);

    await harness.navigateByUrl('/case-studies/second-study');
    await harness.navigateByUrl('/case-studies/second-study#executive-summary');

    expect(TestBed.inject(Title).getTitle()).toBe('Second Study | Case Study | Mahmoud Khairy');
    http.expectNone('assets/data/case-studies.json');
  });

  it('should fall back to a generic title for an unknown case study', async () => {
    TestBed.inject(ConfigDataService).loadCaseStudies();
    http.expectOne('assets/data/case-studies.json').flush(CASE_STUDY_DATA);

    await harness.navigateByUrl('/case-studies/missing');

    expect(TestBed.inject(Title).getTitle()).toBe(CASE_STUDY_FALLBACK_TITLE);
  });
});
