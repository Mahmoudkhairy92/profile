import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { ConfigDataService } from '../../core/services';
import { PageHeaderComponent } from '../../shared/components';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [PageHeaderComponent],
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoursesComponent implements OnInit {
  private readonly configService = inject(ConfigDataService);
  
  readonly courses = this.configService.courses;

  ngOnInit(): void {
    this.configService.loadCourses();
  }
}

