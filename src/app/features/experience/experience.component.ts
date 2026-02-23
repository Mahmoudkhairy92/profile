import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { Location } from '@angular/common';
import { ConfigDataService } from '../../core/services';
import { ExperienceCardComponent, PageHeaderComponent } from '../../shared/components';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [PageHeaderComponent, ExperienceCardComponent],
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperienceComponent implements OnInit {
  private readonly configService = inject(ConfigDataService);
  private readonly location = inject(Location);
  
  readonly experience = this.configService.experience;

  ngOnInit(): void {
    this.configService.loadExperience();
  }

  /**
   * Resolves an asset path with the correct base href (e.g. /profile in production at aelbazz.github.io/profile).
   */
  getAssetUrl(path: string): string {
    if (!path) return '';
    const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
    return this.location.prepareExternalUrl(normalizedPath);
  }
}

