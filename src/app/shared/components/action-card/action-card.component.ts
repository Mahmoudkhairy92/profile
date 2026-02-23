import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { NgClass } from '@angular/common';

export type ActionCardVariant = 'download' | 'email' | 'whatsapp' | 'linkedin' | 'default';

@Component({
  selector: 'app-action-card',
  standalone: true,
  imports: [NgClass],
  templateUrl: './action-card.component.html',
  styleUrls: ['./action-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionCardComponent {
  @Input() icon!: string;
  @Input() title!: string;
  @Input() description?: string;
  @Input() variant: ActionCardVariant = 'default';
  @Input() href?: string;
  @Input() target?: string;
  @Input() type: 'button' | 'link' = 'button';
  
  @Output() clicked = new EventEmitter<void>();

  onClick(): void {
    if (this.type === 'button') {
      this.clicked.emit();
    }
  }
}
