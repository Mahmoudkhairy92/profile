import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { map } from 'rxjs/operators';
import { ConfigDataService } from '../../core/services';

export const CASE_STUDY_FALLBACK_TITLE = 'Case Study | Mahmoud Khairy';

/**
 * Page title for /case-studies/:slug. Resolved through the router (rather than set by the
 * component) so the title survives in-page fragment navigation from the table of contents.
 */
export const caseStudyTitleResolver: ResolveFn<string> = route => {
  const slug = route.paramMap.get('slug');
  return inject(ConfigDataService).getCaseStudies().pipe(
    map(data => {
      const study = data?.caseStudies.find(item => item.slug === slug);
      return study ? `${study.title} | Case Study | Mahmoud Khairy` : CASE_STUDY_FALLBACK_TITLE;
    })
  );
};
