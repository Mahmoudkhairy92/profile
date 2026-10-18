import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { ConfigDataService } from '../../core/services';
import { PageHeaderComponent } from '../../shared/components';

@Component({
  selector: 'app-ventures',
  standalone: true,
  imports: [PageHeaderComponent],
  templateUrl: './ventures.component.html',
  styleUrls: ['./ventures.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VenturesComponent implements OnInit {
  private readonly configService = inject(ConfigDataService);

  readonly ventures = this.configService.ventures;

  ngOnInit(): void {
    this.configService.loadVentures();
  }
}
