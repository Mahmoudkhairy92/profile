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

  it('should provide Firebase and the game service on the lazily loaded game route', () => {
    expect(GAME_ROUTES[0].component).toBe(GameComponent);
    expect(GAME_ROUTES[0].providers).toBe(GAME_PROVIDERS);
    expect(GAME_PROVIDERS).toContain(GameService);
  });
});
