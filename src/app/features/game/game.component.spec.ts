import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { GameComponent } from './game.component';
import { GameService } from '../../core/services/game.service';
import { ScreenshotService } from '../../core/services/screenshot.service';
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

  it('should keep focus in the share dialog, close it with Escape and return focus to Share to LinkedIn', async () => {
    // Saving the score and the screenshot are mocked: nothing is written to the live leaderboard
    const saveScore = vi.spyOn(GameService.prototype, 'saveScore').mockResolvedValue(undefined);
    vi.spyOn(ScreenshotService.prototype, 'captureElement').mockResolvedValue('data:image/png;base64,AAAA');
    const fixture = TestBed.createComponent(GameComponent);
    const component = fixture.componentInstance;
    const element: HTMLElement = fixture.nativeElement;
    fixture.detectChanges();
    await fixture.whenStable();
    component.showInstructions.set(false);
    component.showGameOver.set(true);
    component.playerName.set('Tester');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement?.textContent).toContain('Play Again');

    const openShare = [...element.querySelectorAll<HTMLButtonElement>('.gameover-overlay button')]
      .find((button) => button.textContent?.includes('Share to LinkedIn'))!;
    openShare.focus();
    openShare.click();
    await new Promise((resolve) => setTimeout(resolve, 150));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(saveScore).toHaveBeenCalledWith('Tester');
    const share = element.querySelector<HTMLElement>('.share-overlay [role="dialog"]')!;
    const buttons = [...share.querySelectorAll<HTMLButtonElement>('button')];
    expect(share.getAttribute('aria-modal')).toBe('true');
    expect(share.contains(document.activeElement)).toBe(true);

    const press = (target: HTMLElement, shiftKey = false) => {
      const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey, bubbles: true, cancelable: true });
      target.dispatchEvent(event);
      return event;
    };
    buttons[buttons.length - 1].focus();
    expect(press(buttons[buttons.length - 1]).defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(buttons[0]);
    expect(press(buttons[0], true).defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(buttons[buttons.length - 1]);

    share.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    expect(element.querySelector('.share-overlay')).toBeNull();
    expect(element.querySelector('.gameover-overlay')?.contains(document.activeElement)).toBe(true);
    expect(document.activeElement?.textContent).toContain('Share to LinkedIn');
    fixture.destroy();
  });

  it('should not steer or pause the game while the visitor types in a text field', async () => {
    const changeDirection = vi.spyOn(GameService.prototype, 'changeDirection');
    const togglePause = vi.spyOn(GameService.prototype, 'togglePause');
    const fixture = TestBed.createComponent(GameComponent);
    vi.spyOn(fixture.componentInstance as never as { startGameLoop: () => void }, 'startGameLoop').mockImplementation(() => {});
    fixture.detectChanges();
    fixture.componentInstance.showInstructions.set(false);
    const field = document.createElement('input');
    document.body.appendChild(field);

    for (const key of ['w', 'a', 's', 'd', ' ', 'ArrowUp']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      field.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    }
    expect(changeDirection).not.toHaveBeenCalled();
    expect(togglePause).not.toHaveBeenCalled();

    // Outside text fields the keys still control the game
    const steer = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true });
    document.body.dispatchEvent(steer);
    expect(steer.defaultPrevented).toBe(true);
    expect(changeDirection).toHaveBeenCalledTimes(1);
    field.remove();
    fixture.destroy();
  });

  it('should stop handling keys once the game page is left', () => {
    const changeDirection = vi.spyOn(GameService.prototype, 'changeDirection');
    const fixture = TestBed.createComponent(GameComponent);
    fixture.detectChanges();
    fixture.componentInstance.showInstructions.set(false);
    fixture.destroy();

    const scroll = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true });
    document.body.dispatchEvent(scroll);
    expect(scroll.defaultPrevented).toBe(false);
    expect(changeDirection).not.toHaveBeenCalled();
  });

  it('should provide Firebase and the game service on the lazily loaded game route', () => {
    expect(GAME_ROUTES[0].component).toBe(GameComponent);
    expect(GAME_ROUTES[0].providers).toBe(GAME_PROVIDERS);
    expect(GAME_PROVIDERS).toContain(GameService);
  });
});
