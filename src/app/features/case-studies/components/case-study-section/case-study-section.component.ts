import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { CaseStudyData, CaseStudyEvidenceType, CaseStudyExample, CaseStudyGroup, CaseStudySection } from '../../../../core/models';
import { EvidenceTagComponent } from '../evidence-tag/evidence-tag.component';
import { sectionClaims, sharedEvidence } from '../../case-study-claims';

/**
 * Renders one case-study section: paragraphs, scoped metrics, items, groups, worked examples and
 * notes. Every statement shows its evidence: on the statement itself, or once next to the section
 * or group heading when all of its statements share the same evidence. Examples always show
 * their label and disclaimer.
 */
@Component({
  selector: 'app-case-study-section',
  standalone: true,
  imports: [NgTemplateOutlet, EvidenceTagComponent],
  templateUrl: './case-study-section.component.html',
  styleUrls: ['./case-study-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CaseStudySectionComponent {
  @Input({ required: true }) section!: CaseStudySection;
  @Input({ required: true }) evidenceTypes!: CaseStudyData['evidenceTypes'];

  evidenceLabel(type: CaseStudyEvidenceType): string {
    return this.evidenceTypes[type]?.label ?? type;
  }

  /** Evidence shared by every statement of the section (labelled once, next to the title). */
  sectionEvidence(): CaseStudyEvidenceType | null {
    return sharedEvidence(sectionClaims(this.section));
  }

  /** Evidence shared by every statement of a group (labelled once, next to the group title). */
  groupEvidence(group: CaseStudyGroup): CaseStudyEvidenceType | null {
    return group.chips?.length ? group.evidence ?? null : sharedEvidence(group.items ?? []);
  }

  /** Whether an example's own label already names its evidence, e.g. "Synthetic example". */
  exampleNamesEvidence(example: CaseStudyExample): boolean {
    return example.label.toLowerCase().includes(this.evidenceLabel(example.evidence).toLowerCase());
  }
}
