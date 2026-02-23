import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { ConfigDataService } from '../../core/services';
import { PageHeaderComponent } from '../../shared/components';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [PageHeaderComponent],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectsComponent implements OnInit {
  private readonly configService = inject(ConfigDataService);
  
  readonly projects = this.configService.projects;

  ngOnInit(): void {
    this.configService.loadProjects();
  }
}

