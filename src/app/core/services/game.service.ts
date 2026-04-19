import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Direction, GameState, GameTip, LeaderboardEntry, Position, TechItem } from '../models/game.model';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private readonly GRID_SIZE = 20;
  private readonly CELL_SIZE = 20;
  private readonly INITIAL_SPEED = 150;
  private readonly SPEED_INCREMENT = 10;
  private readonly COMBO_BONUS = 100;
  private readonly LEVEL_UP_THRESHOLD = 5;

  private gameState = signal<GameState>({
    snake: [{ x: 10, y: 10 }],
    direction: Direction.RIGHT,
    techItem: null,
    score: 0,
    gameOver: false,
    paused: false,
    speed: this.INITIAL_SPEED,
    level: 1,
    techCollected: 0,
    combo: 0,
    highScore: this.loadHighScore(),
  });

  private techTips = signal<GameTip[]>([]);
  private gameStartTime = 0;

  // Public computed signals
  public state = this.gameState.asReadonly();
  public canvasWidth = computed(() => this.GRID_SIZE * this.CELL_SIZE);
  public canvasHeight = computed(() => this.GRID_SIZE * this.CELL_SIZE);

  constructor(private http: HttpClient) {
    this.loadTechTips();
  }

  private loadTechTips(): void {
    this.http.get<{ techItems: GameTip[] }>('assets/data/tech-tips.json').subscribe({
      next: (data) => this.techTips.set(data.techItems),
      error: (err) => console.error('Failed to load tech tips:', err),
    });
  }

  private loadHighScore(): number {
    const stored = localStorage.getItem('snakeHighScore');
    return stored ? parseInt(stored, 10) : 0;
  }

  private saveHighScore(score: number): void {
    const current = this.gameState().highScore;
    if (score > current) {
      localStorage.setItem('snakeHighScore', score.toString());
      this.gameState.update((state) => ({ ...state, highScore: score }));
    }
  }

  public startGame(): void {
    this.gameStartTime = Date.now();
    this.gameState.set({
      snake: [{ x: 10, y: 10 }],
      direction: Direction.RIGHT,
      techItem: this.generateTechItem(),
      score: 0,
      gameOver: false,
      paused: false,
      speed: this.INITIAL_SPEED,
      level: 1,
      techCollected: 0,
      combo: 0,
      highScore: this.loadHighScore(),
    });
  }

  public togglePause(): void {
    this.gameState.update((state) => ({ ...state, paused: !state.paused }));
  }

  public changeDirection(newDirection: Direction): void {
    const state = this.gameState();
    
    // Prevent reverse direction
    if (
      (state.direction === Direction.UP && newDirection === Direction.DOWN) ||
      (state.direction === Direction.DOWN && newDirection === Direction.UP) ||
      (state.direction === Direction.LEFT && newDirection === Direction.RIGHT) ||
      (state.direction === Direction.RIGHT && newDirection === Direction.LEFT)
    ) {
      return;
    }

    this.gameState.update((s) => ({ ...s, direction: newDirection }));
  }

  public moveSnake(): boolean {
    const state = this.gameState();
    
    if (state.gameOver || state.paused) {
      return false;
    }

    const head = state.snake[0];
    let newHead: Position;

    // Calculate new head position
    switch (state.direction) {
      case Direction.UP:
        newHead = { x: head.x, y: head.y - 1 };
        break;
      case Direction.DOWN:
        newHead = { x: head.x, y: head.y + 1 };
        break;
      case Direction.LEFT:
        newHead = { x: head.x - 1, y: head.y };
        break;
      case Direction.RIGHT:
        newHead = { x: head.x + 1, y: head.y };
        break;
    }

    // Check wall collision
    if (
      newHead.x < 0 ||
      newHead.x >= this.GRID_SIZE ||
      newHead.y < 0 ||
      newHead.y >= this.GRID_SIZE
    ) {
      this.endGame();
      return false;
    }

    // Check self collision
    if (state.snake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
      this.endGame();
      return false;
    }

    const newSnake = [newHead, ...state.snake];
    let newScore = state.score;
    let newTechCollected = state.techCollected;
    let newCombo = state.combo;
    let newLevel = state.level;
    let newSpeed = state.speed;
    let newTechItem = state.techItem;

    // Check tech item collision
    if (state.techItem && newHead.x === state.techItem.position.x && newHead.y === state.techItem.position.y) {
      // Ate the tech item - grow snake
      newScore += state.techItem.points;
      newTechCollected++;
      newCombo++;

      // Combo bonus
      if (newCombo >= 3) {
        newScore += this.COMBO_BONUS;
      }

      // Level up
      if (newTechCollected % this.LEVEL_UP_THRESHOLD === 0) {
        newLevel++;
        newSpeed = Math.max(50, this.INITIAL_SPEED - (newLevel - 1) * this.SPEED_INCREMENT);
      }

      newTechItem = this.generateTechItem(newSnake);
    } else {
      // No food eaten - remove tail
      newSnake.pop();
      newCombo = 0; // Reset combo if no food eaten
    }

    this.gameState.update((s) => ({
      ...s,
      snake: newSnake,
      score: newScore,
      techCollected: newTechCollected,
      combo: newCombo,
      level: newLevel,
      speed: newSpeed,
      techItem: newTechItem,
    }));

    return true;
  }

  private generateTechItem(snake: Position[] = this.gameState().snake): TechItem | null {
    const tips = this.techTips();
    if (tips.length === 0) return null;

    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    let position: Position;
    let attempts = 0;
    const maxAttempts = 100;

    // Find a position that doesn't overlap with snake
    do {
      position = {
        x: Math.floor(Math.random() * this.GRID_SIZE),
        y: Math.floor(Math.random() * this.GRID_SIZE),
      };
      attempts++;
    } while (
      attempts < maxAttempts &&
      snake.some((segment) => segment.x === position.x && segment.y === position.y)
    );

    return {
      id: Math.random().toString(36).substring(7),
      name: randomTip.tech,
      icon: randomTip.icon,
      color: randomTip.color,
      tip: randomTip.tip,
      points: randomTip.points,
      position,
    };
  }

  private endGame(): void {
    const state = this.gameState();
    this.saveHighScore(state.score);
    this.gameState.update((s) => ({ ...s, gameOver: true }));
  }

  public getGameDuration(): number {
    return Math.floor((Date.now() - this.gameStartTime) / 1000);
  }

  // Leaderboard methods (will integrate with Firebase later)
  public async saveScore(playerName: string): Promise<void> {
    const state = this.gameState();
    const entry: LeaderboardEntry = {
      playerName,
      score: state.score,
      techCollected: state.techCollected,
      timestamp: Date.now(),
      duration: this.getGameDuration(),
    };

    // For now, save to localStorage - will replace with Firebase
    const leaderboard = this.getLocalLeaderboard();
    leaderboard.push(entry);
    leaderboard.sort((a, b) => b.score - a.score);
    const top100 = leaderboard.slice(0, 100);
    localStorage.setItem('snakeLeaderboard', JSON.stringify(top100));
  }

  public getLeaderboard(limit: number = 10): LeaderboardEntry[] {
    const leaderboard = this.getLocalLeaderboard();
    return leaderboard.slice(0, limit);
  }

  private getLocalLeaderboard(): LeaderboardEntry[] {
    const stored = localStorage.getItem('snakeLeaderboard');
    return stored ? JSON.parse(stored) : [];
  }

  public getPlayerRank(score: number): number {
    const leaderboard = this.getLocalLeaderboard();
    const rank = leaderboard.filter((entry) => entry.score > score).length + 1;
    return rank;
  }

  public getTotalPlayers(): number {
    return this.getLocalLeaderboard().length;
  }
}
