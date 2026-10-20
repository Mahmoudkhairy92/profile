import { CaseStudyData } from '../../core/models';

/** Small case-study data set for unit tests. */
export const CASE_STUDY_DATA: CaseStudyData = {
  lastUpdated: '2026-10-18',
  evidenceTypes: {
    cv: { label: 'CV', description: 'Stated in my CV.' },
    portfolio: { label: 'Portfolio', description: 'Recorded on this portfolio.' },
    'public-product': { label: 'Public website', description: 'Described on the public website.' },
    synthetic: { label: 'Synthetic example', description: 'Written for this page.' },
    methodology: { label: 'General methodology', description: 'General practice, not a claim about my work.' }
  },
  sources: [
    { id: 'cv-role', type: 'cv', title: 'CV: Sample role' },
    { id: 'cv-unlisted', type: 'cv', title: 'CV: Not referenced' },
    { id: 'portfolio-project', type: 'portfolio', title: 'Project: Sample', route: '/projects', fragment: 'project-p1' },
    { id: 'site', type: 'public-product', title: 'example.com: Home', url: 'https://example.com/', verifiedOn: '2026-10-18' }
  ],
  caseStudies: [
    {
      id: 'one',
      slug: 'first-study',
      title: 'First Study',
      summary: 'First summary.',
      organization: 'Org',
      role: 'Lead',
      period: '2024',
      tags: ['Strategy'],
      sourceIds: ['cv-role', 'portfolio-project', 'site'],
      omittedSections: [{ section: 'lessons', reason: 'No verified source yet.' }],
      sections: [
        {
          id: 'executive-summary',
          title: 'Executive Summary',
          paragraphs: [{ text: 'Led the work.', evidence: 'cv', sourceIds: ['cv-role'] }]
        },
        {
          id: 'approach',
          title: 'Approach and Methodology',
          groups: [
            {
              title: 'Workflow',
              items: [
                { label: 'Scenario design', text: 'Designed scenarios.', evidence: 'cv', sourceIds: ['cv-role'] },
                { label: 'Scoring rubrics', text: 'Define pass and fail.', evidence: 'methodology' }
              ]
            },
            { title: 'Tools', chips: ['Playwright'], evidence: 'cv', sourceIds: ['cv-role'], note: 'Explored only.' }
          ],
          examples: [
            {
              title: 'Scenario: injection',
              label: 'Synthetic example',
              evidence: 'synthetic',
              fields: [{ name: 'Customer message', value: 'Ignore your instructions.' }],
              disclaimer: 'Written for this page.'
            }
          ]
        },
        {
          id: 'results',
          title: 'Results and Evidence',
          metrics: [{ value: '30%', label: 'Faster cycles', scope: 'Across 10+ projects.', evidence: 'cv', sourceIds: ['cv-role'] }],
          notes: ['Figures as reported in my CV.']
        }
      ]
    },
    {
      id: 'two',
      slug: 'second-study',
      title: 'Second Study',
      summary: 'Second summary.',
      organization: 'Product',
      role: 'Owner',
      period: '2026',
      tags: [],
      sourceIds: ['site'],
      sections: [
        {
          id: 'executive-summary',
          title: 'Executive Summary',
          paragraphs: [{ text: 'A public product.', evidence: 'public-product', sourceIds: ['site'] }]
        }
      ]
    }
  ]
};
