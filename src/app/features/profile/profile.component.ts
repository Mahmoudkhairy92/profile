import { Component, OnInit, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { Location } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ConfigDataService, PdfExportService, FileDownloadService, SkillIconService } from '../../core/services';
import { Achievement, Skill } from '../../core/models';

/** Number of skill categories shown on the home page (in skills.json order). */
const HOME_SKILL_CATEGORY_COUNT = 5;

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent implements OnInit {
  private readonly configService = inject(ConfigDataService);
  private readonly pdfService = inject(PdfExportService);
  private readonly fileDownloadService = inject(FileDownloadService);
  private readonly location = inject(Location);
  private readonly skillIconService = inject(SkillIconService);

  readonly profile = this.configService.profile;
  
  /**
   * Get the avatar URL with proper base href handling
   */
  readonly avatarUrl = computed(() => {
    const profileData = this.profile();
    const avatarPath = profileData?.avatar || '/assets/images/default-avatar.png';
    // Remove leading slash if present, Location.prepareExternalUrl will add it
    const normalizedPath = avatarPath.startsWith('/') ? avatarPath.substring(1) : avatarPath;
    return this.location.prepareExternalUrl(normalizedPath);
  });
  readonly skills = this.configService.skills;
  readonly experience = this.configService.experience;
  readonly achievements = this.configService.achievements;
  readonly projects = this.configService.projects;
  readonly contact = this.configService.contact;
  readonly ventures = this.configService.ventures;
  
  isExporting = signal(false);

  /** Curated selections for the home page; the full lists live on their own pages. */
  readonly featuredProjects = computed(() => this.projects()?.projects.filter(project => project.featured) ?? []);
  readonly featuredVentures = computed(() => this.ventures()?.ventures.filter(venture => venture.featured) ?? []);
  readonly featuredAchievements = computed(
    () => this.achievements()?.achievements.filter(achievement => achievement.featured) ?? []
  );
  readonly homeSkillCategories = computed(
    () => this.skills()?.categories.slice(0, HOME_SKILL_CATEGORY_COUNT) ?? []
  );
  readonly caseStudies = computed(() => this.configService.caseStudies()?.caseStudies ?? []);

  ngOnInit(): void {
    this.configService.loadProfile();
    this.configService.loadSkills();
    this.configService.loadExperience();
    this.configService.loadAchievements();
    this.configService.loadProjects();
    this.configService.loadContact();
    this.configService.loadVentures();
    this.configService.loadCaseStudies();
  }

  async exportToPdf(): Promise<void> {
    this.isExporting.set(true);
    try {
      await this.pdfService.exportToPdf('profile-export', 'my-professional-profile.pdf');
    } catch (error) {
      console.error('Failed to export PDF:', error);
    } finally {
      this.isExporting.set(false);
    }
  }

  downloadCV(): void {
    this.fileDownloadService.downloadCV();
  }

  public getAchievementIcon(category: string): string {
    const iconMap: Record<string, string> = {
      'award': 'fas fa-trophy',
      'certification': 'fas fa-certificate',
      'recognition': 'fas fa-star',
      'milestone': 'fas fa-flag-checkered'
    };
    return iconMap[category] || 'fas fa-award';
  }

  public getAchievementsByCategory(achievements: Achievement[], category: string): Achievement[] {
    return achievements.filter(a => a.category === category);
  }

  /**
   * Resolves an asset path with the correct base href (e.g. /profile in production at mahmoudkhairy92.github.io/profile).
   */
  getAssetUrl(path: string): string {
    if (!path) return '';
    const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
    return this.location.prepareExternalUrl(normalizedPath);
  }

  /**
   * Font Awesome icon for a skill (explicit icon, name lookup, then category fallback).
   */
  getSkillIcon(skill: Skill, category: string): string {
    return this.skillIconService.getSkillIcon(skill, category);
  }
}
