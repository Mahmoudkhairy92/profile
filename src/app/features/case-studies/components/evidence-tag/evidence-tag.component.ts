import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CaseStudyEvidenceType } from '../../../../core/models';

const SCOPE_PREFIX = {
  statement: 'Evidence: ',
  group: 'Evidence for every statement in this group: ',
  section: 'Evidence for every statement in this section: '
};

/**
 * Small label naming the evidence behind a statement, e.g. "CV" or "Synthetic example". Placed
 * next to a heading, it covers every statement of that section or group.
 */
@Component({
  selector: 'app-evidence-tag',
  standalone: true,
  template: `<span [class]="'evidence-tag evidence-' + type"><span class="visually-hidden">{{ prefix }}</span>{{ label }}</span>`,
  styleUrls: ['./evidence-tag.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EvidenceTagComponent {
  @Input({ required: true }) type!: CaseStudyEvidenceType;
  @Input({ required: true }) label!: string;
  @Input() scope: keyof typeof SCOPE_PREFIX = 'statement';

  get prefix(): string {
    return SCOPE_PREFIX[this.scope];
  }
}
