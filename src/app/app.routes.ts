import { Routes } from '@angular/router';

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
    loadComponent: () => 
      import('./features/game/game.component').then(m => m.GameComponent),
    title: 'Tech Stack Snake - Play & Learn | Mahmoud Khairy'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
