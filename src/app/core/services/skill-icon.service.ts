import { Injectable } from '@angular/core';
import { Skill } from '../models';

/**
 * Maps skill names to Font Awesome icon classes (fas/fab).
 * Used when skill.icon is not set in data. Fallback: category icon, then fa-check.
 */
@Injectable({ providedIn: 'root' })
export class SkillIconService {
  private readonly categoryIcons: Record<string, string> = {
    'Leadership & People Management': 'fas fa-users-cog',
    'Communication & Collaboration': 'fas fa-comments',
    'Professional & Cognitive Skills': 'fas fa-brain',
    'Project & Delivery Management': 'fas fa-tasks',
    'Methodologies & Frameworks': 'fas fa-project-diagram',
    'Software Engineering & Architecture': 'fas fa-sitemap',
    'Frontend Technologies': 'fas fa-palette',
    'Backend, DevOps & Cloud': 'fas fa-server',
    'Data & Analytics': 'fas fa-chart-line',
    'Tools & Platforms': 'fas fa-tools',
    'AI & Emerging Technologies': 'fas fa-robot',
    'Security & Authentication': 'fas fa-shield-alt',
    'Languages': 'fas fa-language',
    'Personal Interests & Wellness': 'fas fa-heart'
  };

  /** Skill name (exact or normalized) -> Font Awesome icon class */
  private readonly skillIcons: Record<string, string> = {
    // Frontend
    'HTML 5': 'fab fa-html5',
    'HTML5': 'fab fa-html5',
    'CSS': 'fab fa-css3-alt',
    'Sass': 'fab fa-sass',
    'Bootstrap': 'fab fa-bootstrap',
    'JavaScript (ES6+)': 'fab fa-js',
    'JavaScript': 'fab fa-js',
    'Angular (Angular 2+)': 'fab fa-angular',
    'Angular': 'fab fa-angular',
    'TypeScript': 'fas fa-file-code',
    'Angular Material': 'fab fa-angular',
    'RxJS': 'fas fa-bolt',
    'Tailwind CSS': 'fas fa-wind',
    'Ngx-Bootstrap': 'fab fa-bootstrap',
    'React': 'fab fa-react',
    'Vue.js': 'fab fa-vuejs',
    'LitElement': 'fas fa-code',
    'Responsive Web Design': 'fas fa-mobile-alt',
    'PWA (Progressive Web Apps)': 'fas fa-mobile-alt',
    // Backend & DevOps
    'Node.js': 'fab fa-node-js',
    'NestJS': 'fas fa-server',
    'Express': 'fab fa-node-js',
    '.NET Core': 'fab fa-microsoft',
    'ABP Framework': 'fas fa-layer-group',
    'Docker': 'fab fa-docker',
    'Kubernetes (K8s)': 'fas fa-cubes',
    'Kubernetes': 'fas fa-cubes',
    'ArgoCD': 'fas fa-sync-alt',
    'Azure DevOps': 'fab fa-microsoft',
    'Keycloak': 'fas fa-key',
    'Vault': 'fas fa-lock',
    'CI / CD': 'fas fa-code-branch',
    'Containerization': 'fab fa-docker',
    'FastAPI': 'fas fa-bolt',
    // Data & Tools
    'Power BI': 'fab fa-microsoft',
    'npm': 'fab fa-npm',
    'Visual Studio Code': 'fas fa-code',
    'Cursor AI': 'fas fa-robot',
    'Google Chrome Developer Tools': 'fab fa-chrome',
    'Lighthouse': 'fas fa-search',
    'Postman': 'fas fa-paper-plane',
    'Gulp.js': 'fas fa-tasks',
    'Webpack': 'fas fa-box',
    'Yarn': 'fab fa-yarn',
    'GIT': 'fab fa-git-alt',
    'Git': 'fab fa-git-alt',
    'TFS': 'fab fa-microsoft',
    'Microsoft SharePoint Online': 'fab fa-microsoft',
    'Microsoft Power Automate': 'fab fa-microsoft',
    'Power Apps': 'fab fa-microsoft',
    'Figma': 'fab fa-figma',
    'Adobe XD': 'fas fa-pen-fancy',
    'Photoshop': 'fas fa-image',
    'Zeplin': 'fas fa-palette',
    // AI & Security
    'Generative AI': 'fas fa-robot',
    'AI Prompt Engineering': 'fas fa-robot',
    'Flowise AI': 'fas fa-robot',
    'Ollama': 'fas fa-robot',
    'LangChain': 'fas fa-link',
    'CrewAI': 'fas fa-robot',
    'Machine Learning Fundamentals': 'fas fa-brain',
    'Microsoft Authentication Library (MSAL)': 'fab fa-microsoft',
    // Soft skills & other
    'Leadership': 'fas fa-users-cog',
    'Mentoring & Coaching': 'fas fa-user-graduate',
    'Accountability & Ownership': 'fas fa-hand-holding-heart',
    'Psychological Safety': 'fas fa-shield-alt',
    'Respect': 'fas fa-heart',
    'Employee Onboarding': 'fas fa-user-plus',
    'Facilitation of Meetings': 'fas fa-users',
    'Team Coordination': 'fas fa-project-diagram',
    'Communication': 'fas fa-comments',
    'Leadership Communication': 'fas fa-bullhorn',
    'Public Speaking': 'fas fa-microphone',
    'Interpersonal Relationships': 'fas fa-handshake',
    'Teamwork & Collaboration': 'fas fa-people-carry',
    'Collaboration': 'fas fa-users',
    'Social Perceptiveness': 'fas fa-eye',
    'Cross-functional Coordination': 'fas fa-sitemap',
    'Critical Thinking': 'fas fa-brain',
    'Problem Solving': 'fas fa-lightbulb',
    'Problem-Solving': 'fas fa-lightbulb',
    'REST API': 'fas fa-plug',
    'RESTful API Design': 'fas fa-plug',
    'JSON': 'fas fa-code',
    'XML': 'fas fa-code',
    'Cross-browser Compatibility': 'fab fa-chrome',
    'Data Structures': 'fas fa-database',
    'Algorithms': 'fas fa-sort-amount-down',
    'Design Systems': 'fas fa-palette',
    'English': 'fas fa-language',
    'Arabic': 'fas fa-language',
    'Hiking': 'fas fa-hiking',
    'Sports': 'fas fa-futbol',
    'Padel': 'fas fa-table-tennis',
    'Chess and Strategic Games': 'fas fa-chess',
    'Reading (Technology, Leadership, Personal Development)': 'fas fa-book-reader',
    'Exploring Emerging Technologies and AI Innovations': 'fas fa-rocket',
    'Understanding the Big Picture': 'fas fa-globe',
    'Focus on Quality': 'fas fa-star',
    'Attention to Detail': 'fas fa-search-plus',
    'Creativity & Innovation': 'fas fa-lightbulb',
    'Frontend / UI Engineering': 'fas fa-palette',
    'DevOps Management': 'fas fa-server',
    'Automation Pipelines': 'fas fa-code-branch',
    'Data Architecture': 'fas fa-database',
    'Data Analysis': 'fas fa-chart-bar',
    'Analytics': 'fas fa-chart-line'
  };

  /**
   * Returns the Font Awesome icon class for a skill.
   * Uses skill.icon if set, then skill name lookup, then category icon, then 'fas fa-check'.
   */
  getSkillIcon(skill: Skill, category?: string): string {
    if (skill.icon) {
      return skill.icon;
    }
    const byName = this.skillIcons[skill.name];
    if (byName) {
      return byName;
    }
    const categoryIcon = category && this.categoryIcons[category];
    return categoryIcon ?? 'fas fa-check';
  }
}
