import {
  ChangeDetectionStrategy, Component, ComponentRef, ElementRef, Injector, ViewContainerRef, afterNextRender, inject,
  signal, viewChild
} from '@angular/core';
import type { AskPanelComponent } from './ask-panel.component';

/**
 * Floating "Ask About Mahmoud" button. The panel (with its matcher and knowledge base) is
 * downloaded with a dynamic import the first time the visitor opens it, which keeps the initial
 * bundle small (a @defer block would add Angular's defer runtime to it).
 */
@Component({
  selector: 'app-ask-launcher',
  standalone: true,
  templateUrl: './ask-launcher.component.html',
  styleUrls: ['./ask-launcher.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AskLauncherComponent {
  private readonly injector = inject(Injector);
  private readonly launcher = viewChild<ElementRef<HTMLButtonElement>>('launcher');
  private readonly panelHost = viewChild('panelHost', { read: ViewContainerRef });
  private panel?: ComponentRef<AskPanelComponent>;

  readonly open = signal(false);
  readonly loading = signal(false);
  readonly loadFailed = signal(false);

  async show(): Promise<void> {
    this.open.set(true);
    this.loadFailed.set(false);
    if (this.panel) {
      // The panel stays alive while closed, so the conversation survives closing it
      this.panel.setInput('open', true);
      return;
    }
    this.loading.set(true);
    try {
      const { AskPanelComponent } = await import('./ask-panel.component');
      const host = this.panelHost();
      if (!host) {
        throw new Error('Panel host not available');
      }
      this.panel = host.createComponent(AskPanelComponent);
      this.panel.setInput('open', true);
      this.panel.instance.closed.subscribe(() => this.hide());
    } catch {
      this.open.set(false);
      this.loadFailed.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  hide(): void {
    this.open.set(false);
    this.panel?.setInput('open', false);
    afterNextRender(() => this.launcher()?.nativeElement.focus(), { injector: this.injector });
  }
}
