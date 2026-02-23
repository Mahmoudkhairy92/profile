import { Component, OnInit, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { Location } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ConfigDataService, PdfExportService, FileDownloadService, SkillIconService } from '../../core/services';
import { Achievement, Skill, SkillData } from '../../core/models';
import { ExperienceCardComponent } from '../../shared/components';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, ExperienceCardComponent],
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
  
  isExporting = signal(false);

  /**
   * Sorted skills with categories sorted (technical first) and skills sorted within each category
   */
  readonly sortedSkills = computed<SkillData | null>(() => {
    const skillsData = this.skills();
    if (!skillsData) return null;

    // Process each category: sort skills and then sort categories
    const processedCategories = skillsData.categories.map(cat => ({
      category: cat.category,
      skills: [...cat.skills].sort((a, b) => {
        // First sort by level (descending - higher levels first)
        if (b.level !== a.level) {
          return b.level - a.level;
        }
        // If same level, sort alphabetically by name
        return a.name.localeCompare(b.name);
      })
    }));

    // Sort categories: technical first, then others
    const sortedCategories = processedCategories.sort((a, b) => {
      const aIsTechnical = this.isTechnicalCategory(a.category);
      const bIsTechnical = this.isTechnicalCategory(b.category);
      
      if (aIsTechnical && !bIsTechnical) return -1;
      if (!aIsTechnical && bIsTechnical) return 1;
      // Keep original order within same group
      return 0;
    });

    return {
      categories: sortedCategories
    };
  });

  ngOnInit(): void {
    this.configService.loadProfile();
    this.configService.loadSkills();
    this.configService.loadExperience();
    this.configService.loadAchievements();
    this.configService.loadProjects();
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

  public getCategoryLabel(category: string): string {
    const labelMap: Record<string, string> = {
      'award': 'Award',
      'certification': 'Certification',
      'recognition': 'Recognition',
      'milestone': 'Milestone'
    };
    return labelMap[category] || category;
  }

  public getAchievementsByCategory(achievements: Achievement[], category: string): Achievement[] {
    return achievements.filter(a => a.category === category);
  }

  /**
   * Resolves an asset path with the correct base href (e.g. /profile in production at aelbazz.github.io/profile).
   */
  getAssetUrl(path: string): string {
    if (!path) return '';
    const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
    return this.location.prepareExternalUrl(normalizedPath);
  }

  /**
   * Gets the skill level category (beginner, intermediate, expert)
   */
  getSkillIcon(skill: Skill, category: string): string {
    return this.skillIconService.getSkillIcon(skill, category);
  }

  public getSkillLevelCategory(level: number): 'beginner' | 'intermediate' | 'strong' {
    if (level >= 1 && level <= 3) return 'beginner';
    if (level >= 4 && level <= 6) return 'intermediate';
    if (level >= 7 && level <= 9) return 'strong';
    return 'beginner'; // fallback
  }

  /**
   * Gets the skill level label
   */
  public getSkillLevelLabel(level: number): string {
    if (level >= 1 && level <= 3) return 'Beginner';
    if (level >= 4 && level <= 6) return 'Intermediate';
    if (level >= 7 && level <= 9) return 'Expert';
    return '';
  }

  /**
   * Checks if a category is a technical section
   */
  private isTechnicalCategory(category: string): boolean {
    const technicalCategories = [
      'Methodologies & Frameworks',
      'Software Engineering & Architecture',
      'Frontend Technologies',
      'Backend, DevOps & Cloud',
      'Data & Analytics',
      'Tools & Platforms',
      'AI & Emerging Technologies',
      'Security & Authentication'
    ];
    return technicalCategories.includes(category);
  }
}

