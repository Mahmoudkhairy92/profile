import achievementsJson from '../../../public/assets/data/achievements.json';
import askJson from '../../../public/assets/data/ask-mahmoud.json';
import caseStudiesJson from '../../../public/assets/data/case-studies.json';
import contactJson from '../../../public/assets/data/contact.json';
import coursesJson from '../../../public/assets/data/courses.json';
import experienceJson from '../../../public/assets/data/experience.json';
import profileJson from '../../../public/assets/data/profile.json';
import projectsJson from '../../../public/assets/data/projects.json';
import skillsJson from '../../../public/assets/data/skills.json';
import venturesJson from '../../../public/assets/data/ventures.json';

/**
 * Guards the content decisions for the public portfolio data: the internal THIQAH platform is
 * described generically, subjective or unsupported labels stay out, and no people-management
 * claims are made. All data files are publicly served.
 */
const publicData = {
  achievements: achievementsJson, ask: askJson, caseStudies: caseStudiesJson, contact: contactJson, courses: coursesJson,
  experience: experienceJson, profile: profileJson, projects: projectsJson, skills: skillsJson, ventures: venturesJson
};

describe('public portfolio content', () => {
  it.each(Object.entries(publicData))('%s should not name the internal THIQAH platform', (_, data) => {
    expect(JSON.stringify(data)).not.toMatch(/quality[\s_-]*mate|كواليتي|كوالتي/i);
  });

  it('should describe the internal platform generically and keep its scoped results', () => {
    const platform = projectsJson.projects.find(project => project.id === 'proj1')!;
    expect(platform.name).toBe('Internal AI-enabled Quality Engineering Platform');
    expect(platform.description).toContain('developed at THIQAH');
    expect(platform.description).toContain('5 teams (~20 QC engineers)');
    expect(platform.description).toContain('40%');
  });

  it('should not publish subjective praise, unsupported role labels or designations', () => {
    const text = JSON.stringify(publicData);
    expect(text).not.toMatch(/deep admiration|Recognition from executive leadership|Founder & (?:Program Lead|Content Creator)|AI Training Institute/);
    expect(projectsJson.projects.some(project => 'isStrategicInitiative' in project)).toBe(false);
  });

  it('should keep unverified claims hidden until they are confirmed', () => {
    const text = JSON.stringify(publicData);
    expect(text).not.toMatch(/LEAP 2025|Certificate of Appreciation|THIQAH Leadership Program|iHealth/);
    expect(text).not.toMatch(/Excellent/);
    expect(text).not.toMatch(/Nuha LLM|NestJS/);
    expect(text).not.toMatch(/outstanding technical leadership|innovation in AI automation|elevating team performance/);
    const selfStudy = coursesJson.courses.filter(course => course.level === 'Self-Study');
    expect(selfStudy.every(course => !('completionDate' in course))).toBe(true);
  });

  it('should keep confirmed achievements, the degree and self-study topics', () => {
    const achievementIds = achievementsJson.achievements.map(item => item.id);
    expect(achievementIds).toEqual(expect.arrayContaining(['ach1', 'ach2', 'ach3', 'ach13']));
    expect(achievementsJson.achievements.find(item => item.id === 'ach1')!.description).toBe('Awarded Employee of the Year (2024) within the Quality Team at THIQAH.');
    expect(achievementsJson.achievements.find(item => item.id === 'ach2')!.description).toContain('Second Place with team Agent X');
    const degree = coursesJson.courses.find(course => course.id === 'edu1')!;
    expect(degree.title).toContain('Bachelor of Engineering');
    expect(degree.completionDate).toBe('2014');
    expect(coursesJson.courses.filter(course => course.level === 'Self-Study').length).toBeGreaterThan(10);
    expect(projectsJson.projects.find(project => project.id === 'proj7')!.technologies).toEqual([]);
  });

  it('should not claim formal people management beyond the approved scope', () => {
    const text = JSON.stringify(publicData);
    expect(text).not.toMatch(/managed (?:a team of )?~?70|manages ~?70|70 direct reports|people manager/i);
    expect(profileJson.summary).toContain('Directly led a 5-engineer automation team');
    expect(profileJson.summary).toContain('technical influence across a ~70-engineer Quality organization');
  });
});
