import { Routes } from '@angular/router';
import { caseStudyTitleResolver } from './features/case-studies/case-study-title.resolver';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => 
      import('./features/profile/profile.component').then(m => m.ProfileComponent),
    title: 'Mahmoud Khairy | Quality Engineering & AI Enablement'
  },
  {
    path: 'profile',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: 'experience',
    loadComponent: () => 
      import('./features/experience/experience.component').then(m => m.ExperienceComponent),
    title: 'Experience | Mahmoud Khairy'
  },
  {
    path: 'projects',
    loadComponent: () => 
      import('./features/projects/projects.component').then(m => m.ProjectsComponent),
    title: 'Projects | Mahmoud Khairy'
  },
  {
    path: 'case-studies',
    loadComponent: () =>
      import('./features/case-studies/case-studies.component').then(m => m.CaseStudiesComponent),
    title: 'Case Studies | Mahmoud Khairy'
  },
  {
    path: 'case-studies/:slug',
    loadComponent: () =>
      import('./features/case-studies/case-study-detail.component').then(m => m.CaseStudyDetailComponent),
    title: caseStudyTitleResolver
  },
  {
    path: 'ventures',
    loadComponent: () =>
      import('./features/ventures/ventures.component').then(m => m.VenturesComponent),
    title: 'Products & Ventures | Mahmoud Khairy'
  },
  {
    path: 'achievements',
    loadComponent: () => 
      import('./features/achievements/achievements.component').then(m => m.AchievementsComponent),
    title: 'Achievements | Mahmoud Khairy'
  },
  {
    path: 'courses',
    loadComponent: () => 
      import('./features/courses/courses.component').then(m => m.CoursesComponent),
    title: 'Courses & Trainings | Mahmoud Khairy'
  },
  {
    path: 'skills',
    loadComponent: () => 
      import('./features/skills/skills.component').then(m => m.SkillsComponent),
    title: 'Skills | Mahmoud Khairy'
  },
  {
    path: 'contact',
    loadComponent: () => 
      import('./features/contact/contact.component').then(m => m.ContactComponent),
    title: 'Contact | Mahmoud Khairy'
  },
  {
    path: 'game',
    // Loads the game together with the Firebase providers its leaderboard needs
    loadChildren: () =>
      import('./features/game/game.routes').then(m => m.GAME_ROUTES)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
