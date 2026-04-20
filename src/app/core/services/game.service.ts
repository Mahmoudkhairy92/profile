import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { 
  Firestore, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit as firestoreLimit, 
  getDocs,
  QuerySnapshot,
  DocumentData
} from '@angular/fire/firestore';
import { Direction, GameState, GameTip, LeaderboardEntry, Position, TechItem } from '../models/game.model';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private readonly GRID_SIZE = typeof window !== 'undefined' && window.innerWidth < 768 ? 15 : 20;
  private readonly CELL_SIZE = typeof window !== 'undefined' && window.innerWidth < 768 ? 18 : 20;
  private readonly INITIAL_SPEED = 150;
  private readonly SPEED_INCREMENT = 10;
  private readonly COMBO_BONUS = 100;
  private readonly LEVEL_UP_THRESHOLD = 5;

  private gameState = signal<GameState>({
    snake: [{ x: 10, y: 10 }],
    direction: Direction.RIGHT,
    techItems: [],
    score: 0,
    gameOver: false,
    paused: false,
    speed: this.INITIAL_SPEED,
    level: 1,
    techCollected: 0,
    combo: 0,
    highScore: this.loadHighScore(),
    lastSpawnTime: Date.now(),
  });

  private techTips = signal<GameTip[]>([]);
  private gameStartTime = 0;
  private firestore = inject(Firestore);
  private leaderboardCollection = collection(this.firestore, 'leaderboard');

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
    const items: TechItem[] = [];
    const item1 = this.generateTechItem();
    const item2 = this.generateTechItem([], item1 ? [item1] : []);
    if (item1) items.push(item1);
    if (item2) items.push(item2);
    
    this.gameState.set({
      snake: [{ x: 10, y: 10 }],
      direction: Direction.RIGHT,
      techItems: items,
      score: 0,
      gameOver: false,
      paused: false,
      speed: this.INITIAL_SPEED,
      level: 1,
      techCollected: 0,
      combo: 0,
      highScore: this.loadHighScore(),
      lastSpawnTime: Date.now(),
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
    let newTechItems = [...state.techItems];
    let ate = false;

    // Check collision with any tech item
    const collectedItemIndex = newTechItems.findIndex(
      item => newHead.x === item.position.x && newHead.y === item.position.y
    );

    if (collectedItemIndex !== -1) {
      const collectedItem = newTechItems[collectedItemIndex];
      // Ate a tech item - grow snake
      newScore += collectedItem.points;
      newTechCollected++;
      newCombo++;
      ate = true;

      // Combo bonus
      if (newCombo >= 3) {
        newScore += this.COMBO_BONUS;
      }

      // Level up
      if (newTechCollected % this.LEVEL_UP_THRESHOLD === 0) {
        newLevel++;
        newSpeed = Math.max(50, this.INITIAL_SPEED - (newLevel - 1) * this.SPEED_INCREMENT);
      }

      // Remove collected item and replace with new one
      newTechItems.splice(collectedItemIndex, 1);
      const newItem = this.generateTechItem(newSnake, newTechItems);
      if (newItem) {
        newTechItems.push(newItem);
      }
    } else {
      // No food eaten - remove tail and reset combo
      newSnake.pop();
      newCombo = 0;
    }

    // Timed spawning: Add new item every 8 seconds if less than 3 items
    const currentTime = Date.now();
    let newLastSpawnTime = state.lastSpawnTime;
    if (newTechItems.length < 3 && currentTime - state.lastSpawnTime >= 8000) {
      const newItem = this.generateTechItem(newSnake, newTechItems);
      if (newItem) {
        newTechItems.push(newItem);
        newLastSpawnTime = currentTime;
      }
    }

    this.gameState.update((s) => ({
      ...s,
      snake: newSnake,
      score: newScore,
      techCollected: newTechCollected,
      combo: newCombo,
      level: newLevel,
      speed: newSpeed,
      techItems: newTechItems,
      lastSpawnTime: newLastSpawnTime,
    }));

    return true;
  }

  private generateTechItem(snake: Position[] = this.gameState().snake, existingItems: TechItem[] = []): TechItem | null {
    const tips = this.techTips();
    if (tips.length === 0) return null;

    // Weighted random selection based on rarity
    const rarityWeights = { common: 60, rare: 30, epic: 9, legendary: 1 };
    const totalWeight = Object.values(rarityWeights).reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    let selectedRarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common';
    
    for (const [rarity, weight] of Object.entries(rarityWeights)) {
      random -= weight;
      if (random <= 0) {
        selectedRarity = rarity as any;
        break;
      }
    }

    // Filter tips by rarity
    const filteredTips = tips.filter(t => t.rarity === selectedRarity);
    if (filteredTips.length === 0) return null;
    
    const randomTip = filteredTips[Math.floor(Math.random() * filteredTips.length)];
    let position: Position;
    let attempts = 0;
    const maxAttempts = 100;

    // Find a position that doesn't overlap with snake or existing items
    do {
      position = {
        x: Math.floor(Math.random() * this.GRID_SIZE),
        y: Math.floor(Math.random() * this.GRID_SIZE),
      };
      attempts++;
    } while (
      attempts < maxAttempts &&
      (snake.some((segment) => segment.x === position.x && segment.y === position.y) ||
       existingItems.some((item) => item.position.x === position.x && item.position.y === position.y))
    );

    return {
      id: Math.random().toString(36).substring(7),
      name: randomTip.tech,
      icon: randomTip.icon,
      color: randomTip.color,
      tip: randomTip.tip,
      points: randomTip.points,
      rarity: randomTip.rarity,
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

  // Leaderboard methods with Firebase Firestore
  public async saveScore(playerName: string): Promise<void> {
    const state = this.gameState();
    const entry: LeaderboardEntry = {
      playerName,
      score: state.score,
      techCollected: state.techCollected,
      timestamp: Date.now(),
      duration: this.getGameDuration(),
    };

    try {
      // Save to Firestore
      await addDoc(this.leaderboardCollection, entry);
      console.log('Score saved to Firestore successfully');
    } catch (error) {
      console.error('Error saving to Firestore, falling back to localStorage:', error);
      // Fallback to localStorage if Firestore fails
      const leaderboard = this.getLocalLeaderboard();
      leaderboard.push(entry);
      leaderboard.sort((a, b) => b.score - a.score);
      const top100 = leaderboard.slice(0, 100);
      localStorage.setItem('snakeLeaderboard', JSON.stringify(top100));
    }
  }

  public async getLeaderboard(limitCount: number = 10): Promise<LeaderboardEntry[]> {
    try {
      // Fetch from Firestore
      const q = query(
        this.leaderboardCollection, 
        orderBy('score', 'desc'), 
        firestoreLimit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      const leaderboard: LeaderboardEntry[] = [];
      querySnapshot.forEach((doc) => {
        leaderboard.push(doc.data() as LeaderboardEntry);
      });
      return leaderboard;
    } catch (error) {
      console.error('Error fetching from Firestore, using localStorage:', error);
      // Fallback to localStorage
      return this.getLocalLeaderboard().slice(0, limitCount);
    }
  }

  private getLocalLeaderboard(): LeaderboardEntry[] {
    const stored = localStorage.getItem('snakeLeaderboard');
    return stored ? JSON.parse(stored) : [];
  }

  public async getPlayerRank(score: number): Promise<number> {
    try {
      // Count scores higher than current score from Firestore
      const allScores = await this.getLeaderboard(1000); // Get top 1000
      const rank = allScores.filter((entry) => entry.score > score).length + 1;
      return rank;
    } catch (error) {
      console.error('Error getting rank from Firestore:', error);
      const leaderboard = this.getLocalLeaderboard();
      return leaderboard.filter((entry) => entry.score > score).length + 1;
    }
  }

  public async getTotalPlayers(): Promise<number> {
    try {
      const allScores = await this.getLeaderboard(1000);
      return allScores.length;
    } catch (error) {
      console.error('Error getting total players from Firestore:', error);
      return this.getLocalLeaderboard().length;
    }
  }
}
