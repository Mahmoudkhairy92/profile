import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AskLauncherComponent } from './ask-launcher.component';

describe('AskLauncherComponent', () => {
  let fixture: ComponentFixture<AskLauncherComponent>;
  let element: HTMLElement;

  // The launcher loads the panel with a dynamic import; compiling it once up front keeps the
  // first test from depending on how fast the test runner compiles it under load.
  beforeAll(async () => {
    await import('./ask-panel.component');
  }, 30000);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AskLauncherComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(AskLauncherComponent);
    element = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  const launcher = () => element.querySelector<HTMLButtonElement>('.ask-launcher')!;

  it('should be enabled by its feature flag', () => {
    expect(environment.features.askAboutMahmoud).toBe(true);
  });

  it('should show an accessible launcher without loading the panel', () => {
    expect(launcher().textContent).toContain('Ask about Mahmoud');
    expect(launcher().getAttribute('aria-haspopup')).toBe('dialog');
    expect(launcher().getAttribute('aria-expanded')).toBe('false');
    expect(element.querySelector('app-ask-panel')).toBeNull();
  });

  it('should load and open the panel, and return focus to the launcher when it closes', async () => {
    await fixture.componentInstance.show();
    fixture.detectChanges();

    const panel = element.querySelector('.ask-panel')!;
    expect(panel).not.toBeNull();
    expect(panel.hasAttribute('hidden')).toBe(false);
    expect(launcher().hidden).toBe(true);
    expect(launcher().getAttribute('aria-expanded')).toBe('true');

    (element.querySelector('.ask-close') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(element.querySelector('.ask-panel')!.hasAttribute('hidden')).toBe(true);
    expect(launcher().hidden).toBe(false);
    expect(document.activeElement).toBe(launcher());
  });

  it('should keep the same panel (and conversation) when reopened', async () => {
    await fixture.componentInstance.show();
    fixture.detectChanges();
    const firstPanel = element.querySelector('app-ask-panel');

    fixture.componentInstance.hide();
    await fixture.componentInstance.show();
    fixture.detectChanges();

    expect(element.querySelectorAll('app-ask-panel').length).toBe(1);
    expect(element.querySelector('app-ask-panel')).toBe(firstPanel);
  });
});
