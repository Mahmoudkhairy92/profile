import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { ConfigDataService } from '../../core/services';
import { PageHeaderComponent } from '../../shared/components';

@Component({
  selector: 'app-achievements',
  standalone: true,
  imports: [PageHeaderComponent],
  templateUrl: './achievements.component.html',
  styleUrls: ['./achievements.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AchievementsComponent implements OnInit {
  private readonly configService = inject(ConfigDataService);
  
  readonly achievements = this.configService.achievements;

  ngOnInit(): void {
    this.configService.loadAchievements();
  }

  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      award: 'fas fa-trophy',
      certification: 'fas fa-certificate',
      recognition: 'fas fa-star',
      milestone: 'fas fa-flag-checkered'
    };
    return icons[category] || 'fas fa-award';
  }

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      award: 'Award',
      certification: 'Certification',
      recognition: 'Recognition',
      milestone: 'Milestone'
    };
    return labels[category] || category;
  }
}

