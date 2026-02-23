import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { ConfigDataService } from '../../core/services';
import { ManagementResponsibility } from '../../core/models';
import { SectionHeaderComponent } from '../../shared/components';

@Component({
  selector: 'app-management',
  standalone: true,
  imports: [SectionHeaderComponent],
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManagementComponent implements OnInit {
  private readonly configService = inject(ConfigDataService);
  
  readonly management = this.configService.management;

  ngOnInit(): void {
    this.configService.loadManagement();
  }

  getHighLevelResponsibilities(): ManagementResponsibility[] {
    const mgmt = this.management();
    return mgmt ? mgmt.responsibilities.filter(r => r.level === 'high') : [];
  }

  getLowLevelResponsibilities(): ManagementResponsibility[] {
    const mgmt = this.management();
    return mgmt ? mgmt.responsibilities.filter(r => r.level === 'low') : [];
  }
}

