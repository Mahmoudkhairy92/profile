import { Component, OnInit, ChangeDetectionStrategy, inject, computed, afterRenderEffect } from '@angular/core';
import { DOCUMENT, ViewportScroller } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs/operators';
import { ConfigDataService, FileDownloadService } from '../../core/services';
import { CaseStudySource } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components';
import { CaseStudySectionComponent } from './components/case-study-section/case-study-section.component';
import { EvidenceTagComponent } from './components/evidence-tag/evidence-tag.component';
import { caseStudyEvidenceTypes } from './case-study-claims';

/** Fragment of the generated "Relevant Links and References" section. */
export const REFERENCES_SECTION_ID = 'references';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** '2026-10-18' -> '18 Oct 2026' (avoids pulling Angular's date formatting into the initial bundle). */
export function formatSourceDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return MONTHS[month - 1] ? `${day} ${MONTHS[month - 1]} ${year}` : isoDate;
}

@Component({
  selector: 'app-case-study-detail',
  standalone: true,
  imports: [PageHeaderComponent, RouterLink, CaseStudySectionComponent, EvidenceTagComponent],
  templateUrl: './case-study-detail.component.html',
  styleUrls: ['./case-study-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CaseStudyDetailComponent implements OnInit {
  private readonly configService = inject(ConfigDataService);
  private readonly fileDownloadService = inject(FileDownloadService);
  private readonly document = inject(DOCUMENT);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly route = inject(ActivatedRoute);
  private readonly slug = toSignal(this.route.paramMap.pipe(map(params => params.get('slug'))), { initialValue: null });
  private readonly fragment = toSignal(this.route.fragment, { initialValue: null });
  private initialFragmentHandled = false;

  readonly referencesId = REFERENCES_SECTION_ID;
  readonly formatSourceDate = formatSourceDate;
  readonly caseStudyData = this.configService.caseStudies;

  readonly caseStudy = computed(
    () => this.caseStudyData()?.caseStudies.find(study => study.slug === this.slug()) ?? null
  );

  /** Legend of the evidence types this case study actually uses. */
  readonly evidenceKey = computed(() => {
    const data = this.caseStudyData();
    const study = this.caseStudy();
    if (!data || !study) {
      return [];
    }
    return caseStudyEvidenceTypes(study).map(type => ({ type, ...data.evidenceTypes[type] }));
  });

  /** Sources listed in "Relevant Links and References", grouped by type. */
  readonly references = computed(() => {
    const sources = new Map((this.caseStudyData()?.sources ?? []).map(source => [source.id, source]));
    const listed = (this.caseStudy()?.sourceIds ?? [])
      .map(id => sources.get(id))
      .filter((source): source is CaseStudySource => !!source);
    return {
      cv: listed.filter(source => source.type === 'cv'),
      portfolio: listed.filter(source => source.type === 'portfolio'),
      publicProduct: listed.filter(source => source.type === 'public-product')
    };
  });

  readonly neighbours = computed(() => {
    const studies = this.caseStudyData()?.caseStudies ?? [];
    const index = studies.findIndex(study => study.slug === this.slug());
    return {
      previous: index > 0 ? studies[index - 1] : null,
      next: index >= 0 && index < studies.length - 1 ? studies[index + 1] : null
    };
  });

  constructor() {
    // Sections render only after the data loads, so on a direct link such as
    // /case-studies/<slug>#results the router's anchor scrolling can run before the target
    // exists. Scroll once it has rendered, after web fonts settle (as on the Projects page).
    // Later table-of-contents clicks are handled by the app's navigation scrolling (AppComponent).
    afterRenderEffect(() => {
      if (this.initialFragmentHandled || !this.caseStudy()) {
        return;
      }
      this.initialFragmentHandled = true;
      const fragment = this.fragment();
      if (fragment && this.document.getElementById(fragment)) {
        const fontsReady = this.document.fonts?.ready ?? Promise.resolve();
        fontsReady.then(() => this.viewportScroller.scrollToAnchor(fragment, { behavior: 'instant' }));
      }
    });
  }

  ngOnInit(): void {
    this.configService.loadCaseStudies();
  }

  /**
   * The router ignores a link to the fragment that is already in the URL, so re-scroll in that
   * case (e.g. clicking the same table-of-contents entry again after scrolling away).
   */
  scrollToSection(id: string): void {
    if (this.fragment() === id) {
      this.viewportScroller.scrollToAnchor(id, { behavior: 'instant' });
    }
  }

  downloadCV(): void {
    this.fileDownloadService.downloadCV();
  }
}
