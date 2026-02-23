import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-timeline-item',
  standalone: true,
  templateUrl: './timeline-item.component.html',
  styleUrls: ['./timeline-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineItemComponent {
  @Input({ required: true }) date!: string;
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
  @Input() icon?: string;
  @Input() type: 'work' | 'education' | 'achievement' | 'project' | 'certification' = 'work';
}

