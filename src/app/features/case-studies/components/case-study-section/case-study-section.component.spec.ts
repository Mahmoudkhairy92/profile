import { TestBed } from '@angular/core/testing';
import { CaseStudySection } from '../../../../core/models';
import { CASE_STUDY_DATA } from '../../case-study.fixtures';
import { CaseStudySectionComponent } from './case-study-section.component';

describe('CaseStudySectionComponent', () => {
  function render(section: CaseStudySection): HTMLElement {
    const fixture = TestBed.createComponent(CaseStudySectionComponent);
    fixture.componentRef.setInput('section', section);
    fixture.componentRef.setInput('evidenceTypes', CASE_STUDY_DATA.evidenceTypes);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  const tags = (element: Element, selector: string) =>
    Array.from(element.querySelectorAll(`${selector} .evidence-tag`)).map(tag => tag.textContent?.trim());

  it('should label a section once when every statement shares the same evidence', () => {
    const element = render({
      id: 'context',
      title: 'Context',
      paragraphs: [{ text: 'Paragraph.', evidence: 'cv', sourceIds: ['cv-role'] }],
      items: [
        { text: 'First.', evidence: 'cv', sourceIds: ['cv-role'] },
        { text: 'Second.', evidence: 'cv', sourceIds: ['cv-role'] }
      ]
    });

    expect(tags(element, '.case-section-header')).toEqual(['Evidence for every statement in this section: CV']);
    expect(tags(element, '.case-paragraph')).toEqual([]);
    expect(tags(element, '.case-item')).toEqual([]);
  });

  it('should label a uniform group once and keep per-statement tags in mixed groups', () => {
    const element = render({
      id: 'approach',
      title: 'Approach',
      groups: [
        {
          title: 'What I did',
          items: [
            { text: 'Designed scenarios.', evidence: 'cv', sourceIds: ['cv-role'] },
            { text: 'Used human review.', evidence: 'cv', sourceIds: ['cv-role'] }
          ]
        },
        {
          title: 'Mixed',
          items: [
            { text: 'Executed scenarios.', evidence: 'cv', sourceIds: ['cv-role'] },
            { text: 'Define rubrics.', evidence: 'methodology' }
          ]
        }
      ]
    });
    const [uniform, mixed] = Array.from(element.querySelectorAll('.case-group'));

    expect(tags(element, '.case-section-header')).toEqual([]);
    expect(tags(uniform, '.case-group-header')).toEqual(['Evidence for every statement in this group: CV']);
    expect(tags(uniform, '.case-item')).toEqual([]);
    expect(tags(mixed, '.case-group-header')).toEqual([]);
    expect(tags(mixed, '.case-item')).toEqual(['Evidence: CV', 'Evidence: General methodology']);
  });

  it('should keep the tag on a single statement', () => {
    const element = render({
      id: 'results',
      title: 'Results',
      items: [{ text: 'Supported decisions.', evidence: 'cv', sourceIds: ['cv-role'] }]
    });

    expect(tags(element, '.case-section-header')).toEqual([]);
    expect(tags(element, '.case-item')).toEqual(['Evidence: CV']);
  });

  it('should not repeat an evidence tag that the example label already states', () => {
    const element = render({
      id: 'results',
      title: 'Results',
      examples: [
        { title: 'Scenario', label: 'Synthetic example', evidence: 'synthetic', fields: [], disclaimer: 'Written for this page.' },
        { title: 'Sample run', label: 'Illustrative demo', evidence: 'public-product', sourceIds: ['site'], fields: [], disclaimer: 'One run.' }
      ]
    });
    const [synthetic, demo] = Array.from(element.querySelectorAll('.case-example'));

    expect(synthetic.querySelector('.case-example-label')?.textContent).toContain('Synthetic example');
    expect(tags(synthetic, '.case-example-disclaimer')).toEqual([]);
    expect(tags(demo, '.case-example-disclaimer')).toEqual(['Evidence: Public website']);
  });
});
