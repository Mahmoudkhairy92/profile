import { Component, OnInit, ChangeDetectionStrategy, inject, computed, afterRenderEffect } from '@angular/core';
import { DOCUMENT, ViewportScroller } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ConfigDataService } from '../../core/services';
import { Project } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components';

export interface ProjectGroup {
  title: string;
  description: string;
  /** Label for the date range, e.g. the owner's contribution period rather than a project lifecycle. */
  dateLabel: string;
  projects: Project[];
}

const PROJECT_GROUPS: (Omit<ProjectGroup, 'projects'> & { category: Project['category'] })[] = [
  {
    category: 'thiqah-initiative',
    title: 'THIQAH Professional Initiatives',
    description: 'Initiatives I built or led at THIQAH. Dates show my contribution period, not the lifecycle of the initiative.',
    dateLabel: 'My contribution'
  },
  {
    category: 'quality-engineering',
    title: 'Quality Engineering Projects',
    description: 'Hands-on test automation and quality assurance work across my roles.',
    dateLabel: 'My contribution'
  },
  {
    category: 'hackathon',
    title: 'Hackathons',
    description: 'Hackathon participation and co-organization.',
    dateLabel: 'Event'
  }
];

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [PageHeaderComponent, RouterLink],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectsComponent implements OnInit {
  private readonly configService = inject(ConfigDataService);
  private readonly document = inject(DOCUMENT);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly fragment = toSignal(inject(ActivatedRoute).fragment, { initialValue: null });
  private scrolledToFragment: string | null = null;

  readonly projects = this.configService.projects;

  /** Projects grouped by category; uncategorized projects are kept in a final group. */
  readonly projectGroups = computed<ProjectGroup[]>(() => {
    const projects = this.projects()?.projects ?? [];
    const groups: ProjectGroup[] = PROJECT_GROUPS.map(({ category, ...group }) => ({
      ...group,
      projects: projects.filter(project => project.category === category)
    }));
    const uncategorized = projects.filter(
      project => !PROJECT_GROUPS.some(group => group.category === project.category)
    );
    if (uncategorized.length) {
      groups.push({ title: 'Other Projects', description: '', dateLabel: 'Period', projects: uncategorized });
    }
    return groups.filter(group => group.projects.length > 0);
  });

  constructor() {
    // Project cards render only after the data loads, so the router's anchor scrolling can run
    // before the target exists. Scroll once the requested card has rendered (deep links and
    // "See more" links from Home); the scroller offset keeps it clear of the fixed header.
    // On a fresh page load the icon web font is still loading and reflows the cards, so wait
    // for fonts and jump instantly to the final position rather than smooth-scrolling.
    afterRenderEffect(() => {
      const fragment = this.fragment();
      if (!fragment || fragment === this.scrolledToFragment || !this.projectGroups().length) {
        return;
      }
      if (this.document.getElementById(fragment)) {
        this.scrolledToFragment = fragment;
        const fontsReady = this.document.fonts?.ready ?? Promise.resolve();
        fontsReady.then(() => this.viewportScroller.scrollToAnchor(fragment, { behavior: 'instant' }));
      }
    });
  }

  ngOnInit(): void {
    this.configService.loadProjects();
  }

  formatPeriod(project: Project): string {
    const end = project.endDate ?? 'Present';
    return project.startDate === end ? project.startDate : `${project.startDate} - ${end}`;
  }
}
