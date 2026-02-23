import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { Location } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Experience } from '../../../core/models/experience.model';

@Component({
  selector: 'app-experience-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './experience-card.component.html',
  styleUrls: ['./experience-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperienceCardComponent {
  private readonly location = inject(Location);

  @Input({ required: true }) experience!: Experience;
  @Input() cardId?: string;

  @Input() showResponsibilities = false;
  @Input() showAchievements = false;
  @Input() showTechnologies = true;
  @Input() showCurrentBadge = true;

  @Input() showDetailsLink = false;
  @Input() detailsLink: string | string[] = '/experience';
  @Input() detailsFragment?: string;

  /**
   * Resolves an asset path with the correct base href (e.g. /profile in production at aelbazz.github.io/profile).
   */
  getAssetUrl(path: string | undefined | null): string {
    if (!path) {
      return '';
    }

    const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
    return this.location.prepareExternalUrl(normalizedPath);
  }
}

