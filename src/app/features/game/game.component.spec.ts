import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { GameComponent } from './game.component';
import { GameService } from '../../core/services/game.service';
import { GAME_PROVIDERS, GAME_ROUTES } from './game.routes';

describe('GameComponent', () => {
  beforeEach(async () => {
    // Keep the test offline: the leaderboard calls go to Firestore
    vi.spyOn(GameService.prototype, 'getTotalPlayers').mockResolvedValue(0);
    vi.spyOn(GameService.prototype, 'getPlayerRank').mockResolvedValue(1);
    vi.spyOn(GameService.prototype, 'getLeaderboard').mockResolvedValue([]);

    await TestBed.configureTestingModule({
      imports: [GameComponent],
      // The same providers as the game route (Firebase is provided only there)
      providers: [...GAME_PROVIDERS, provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(GameComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should open the instructions as a modal dialog focused on Start Playing that Escape does not dismiss', async () => {
    const fixture = TestBed.createComponent(GameComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const dialog: HTMLElement = fixture.nativeElement.querySelector('.instructions-overlay .modal-content');

    expect(dialog.getAttribute('role')).toBe('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(document.getElementById(dialog.getAttribute('aria-labelledby')!)?.textContent).toContain('Tech Stack Snake');
    expect(document.activeElement?.textContent).toContain('Start Playing');
    expect(fixture.nativeElement.querySelector('.game-wrapper').hasAttribute('inert')).toBe(true);

    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.showInstructions()).toBe(true);
    fixture.destroy();
  });

  it('should keep keyboard focus in the leaderboard, close it with Escape and return focus to its opener', async () => {
    const fixture = TestBed.createComponent(GameComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    const viewButton = [...element.querySelectorAll<HTMLButtonElement>('.instructions-overlay button')]
      .find((button) => button.textContent?.includes('View Leaderboard'))!;

    viewButton.focus();
    viewButton.click();
    fixture.detectChanges();
    await fixture.whenStable();
    const leaderboard = element.querySelector<HTMLElement>('.leaderboard-overlay .modal-content')!;
    const buttons = [...leaderboard.querySelectorAll<HTMLButtonElement>('button')];
    expect(leaderboard.contains(document.activeElement)).toBe(true);

    // Tab from the last control wraps to the first; the instructions underneath stay out of reach
    buttons[buttons.length - 1].focus();
    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    buttons[buttons.length - 1].dispatchEvent(tab);
    expect(tab.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(buttons[0]);
    viewButton.focus();
    expect(leaderboard.contains(document.activeElement)).toBe(true);

    leaderboard.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve));
    expect(element.querySelector('.leaderboard-overlay')).toBeNull();
    expect(document.activeElement).toBe(viewButton);
    fixture.destroy();
  });

  it('should provide Firebase and the game service on the lazily loaded game route', () => {
    expect(GAME_ROUTES[0].component).toBe(GameComponent);
    expect(GAME_ROUTES[0].providers).toBe(GAME_PROVIDERS);
    expect(GAME_PROVIDERS).toContain(GameService);
  });
});
