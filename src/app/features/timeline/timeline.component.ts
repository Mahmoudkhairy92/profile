import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { ConfigDataService } from '../../core/services';
import { SectionHeaderComponent, TimelineItemComponent } from '../../shared/components';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [SectionHeaderComponent, TimelineItemComponent],
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineComponent implements OnInit {
  private readonly configService = inject(ConfigDataService);
  
  readonly timeline = this.configService.timeline;

  ngOnInit(): void {
    this.configService.loadTimeline();
  }
}

