import { Component, OnInit, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfigDataService, SkillIconService } from '../../core/services';
import { PageHeaderComponent } from '../../shared/components';
import { Skill, SkillData } from '../../core/models';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [PageHeaderComponent, FormsModule],
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkillsComponent implements OnInit {
  private readonly configService = inject(ConfigDataService);
  private readonly skillIconService = inject(SkillIconService);

  readonly skills = this.configService.skills;
  readonly searchTerm = signal<string>('');
  readonly selectedCategory = signal<string | null>(null);

  readonly availableCategories = computed<string[]>(() => {
    const skillsData = this.skills();
    if (!skillsData) return [];
    return skillsData.categories.map(cat => cat.category);
  });

  readonly filteredSkills = computed<SkillData | null>(() => {
    const skillsData = this.skills();
    const search = this.searchTerm().toLowerCase().trim();
    const category = this.selectedCategory();

    if (!skillsData) {
      return null;
    }

    let filtered = skillsData.categories;

    // Filter by category
    if (category) {
      filtered = filtered.filter(cat => cat.category === category);
    }

    // Filter by search term
    if (search) {
      filtered = filtered
        .map(cat => ({
          category: cat.category,
          skills: cat.skills.filter(skill =>
            skill.name.toLowerCase().includes(search) ||
            cat.category.toLowerCase().includes(search)
          )
        }))
        .filter(cat => cat.skills.length > 0);
    }

    // Sort categories: technical sections first, then others
    filtered = filtered.sort((a, b) => {
      const aIsTechnical = this.isTechnicalCategory(a.category);
      const bIsTechnical = this.isTechnicalCategory(b.category);
      
      if (aIsTechnical && !bIsTechnical) return -1;
      if (!aIsTechnical && bIsTechnical) return 1;
      return 0; // Keep original order within same group
    });

    return {
      categories: filtered
    };
  });

  ngOnInit(): void {
    this.configService.loadSkills();
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  clearSearch(): void {
    this.searchTerm.set('');
  }

  selectCategory(category: string | null): void {
    this.selectedCategory.set(category);
  }

  clearCategoryFilter(): void {
    this.selectedCategory.set(null);
  }

  /**
   * Checks if a category is a technical section
   */
  isTechnicalCategory(category: string): boolean {
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

  getSkillIcon(skill: Skill, category: string): string {
    return this.skillIconService.getSkillIcon(skill, category);
  }

  /**
   * Gets the appropriate icon for each skill category
   */
  getCategoryIcon(category: string): string {
    return this.skillIconService.getCategoryIcon(category);
  }
}

