import { TestBed } from '@angular/core/testing';
import { GameComponent } from './game.component';
import { GameService } from '../../core/services/game.service';
import { provideHttpClient } from '@angular/common/http';

describe('GameComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameComponent],
      providers: [GameService, provideHttpClient()],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(GameComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
