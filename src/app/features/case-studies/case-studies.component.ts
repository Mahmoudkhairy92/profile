import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConfigDataService } from '../../core/services';
import { PageHeaderComponent } from '../../shared/components';

@Component({
  selector: 'app-case-studies',
  standalone: true,
  imports: [PageHeaderComponent, RouterLink],
  templateUrl: './case-studies.component.html',
  styleUrls: ['./case-studies.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CaseStudiesComponent implements OnInit {
  private readonly configService = inject(ConfigDataService);

  readonly caseStudies = this.configService.caseStudies;

  ngOnInit(): void {
    this.configService.loadCaseStudies();
  }
}
