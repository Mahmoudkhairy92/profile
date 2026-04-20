import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  signal,
  effect,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../core/services/game.service';
import { ScreenshotService } from '../../core/services/screenshot.service';
import { Direction, LeaderboardEntry } from '../../core/models/game.model';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameComponent implements OnInit, OnDestroy {
  @ViewChild('gameCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('leaderboardCard') leaderboardCardRef?: ElementRef<HTMLElement>;

  private ctx!: CanvasRenderingContext2D;
  public gameLoop: any; // Make public for template access
  private lastRenderTime = 0;

  // Signals
  public showInstructions = signal(true);
  public showGameOver = signal(false);
  public showTip = signal(false);
  public currentTip = signal('');
  public playerName = signal('');
  public leaderboard = signal<LeaderboardEntry[]>([]);
  public playerRank = signal(0);
  public totalPlayers = signal(0);
  public showLeaderboard = signal(false);
  public screenshotUrl = signal<string | null>(null);
  public showShareModal = signal(false);
  public shareMessage = signal('');
  public copySuccess = signal(false);

  // Mobile controls
  public isMobile = signal(false);

  constructor(
    public gameService: GameService,
    private screenshotService: ScreenshotService
  ) {
    // Watch for game over
    effect(() => {
      const state = this.gameService.state();
      if (state.gameOver) {
        this.onGameOver();
      }
    });
  }

  ngOnInit(): void {
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.setupCanvas();
    this.setupControls();
    this.checkMobile();
    this.loadLeaderboard();
    
    // Update player stats from current game state
    const state = this.gameService.state();
    this.gameService.getTotalPlayers().then(count => this.totalPlayers.set(count));
    if (state.score > 0) {
      this.gameService.getPlayerRank(state.score).then(rank => this.playerRank.set(rank));
    }
  }

  ngOnDestroy(): void {
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop);
    }
  }

  private setupCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = this.gameService.canvasWidth();
    canvas.height = this.gameService.canvasHeight();
  }

  private setupControls(): void {
    // Keyboard controls
    window.addEventListener('keydown', this.handleKeyPress.bind(this));
  }

  private handleKeyPress(event: KeyboardEvent): void {
    const state = this.gameService.state();
    
    if (state.gameOver || this.showInstructions()) {
      return;
    }

    // Start game loop on first move
    const startLoop = !this.gameLoop;

    switch (event.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        event.preventDefault();
        this.gameService.changeDirection(Direction.UP);
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        event.preventDefault();
        this.gameService.changeDirection(Direction.DOWN);
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        event.preventDefault();
        this.gameService.changeDirection(Direction.LEFT);
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        event.preventDefault();
        this.gameService.changeDirection(Direction.RIGHT);
        break;
      case ' ':
        event.preventDefault();
        this.gameService.togglePause();
        return; // Don't start loop for pause
    }
    
    if (startLoop) {
      this.startGameLoop();
    }
  }

  private checkMobile(): void {
    this.isMobile.set(window.innerWidth < 768);
  }

  public startGame(): void {
    this.showInstructions.set(false);
    this.showGameOver.set(false);
    this.showLeaderboard.set(false);
    this.gameService.startGame();
    // Don't start game loop yet - wait for first move
  }

  private startGameLoop(): void {
    const loop = (currentTime: number) => {
      const state = this.gameService.state();
      
      if (state.gameOver) {
        return;
      }

      const deltaTime = currentTime - this.lastRenderTime;

      if (deltaTime >= state.speed) {
        this.gameService.moveSnake();
        this.render();
        this.lastRenderTime = currentTime;
      }

      this.gameLoop = requestAnimationFrame(loop);
    };

    this.lastRenderTime = performance.now();
    this.gameLoop = requestAnimationFrame(loop);
  }

  private render(): void {
    const state = this.gameService.state();
    const canvas = this.canvasRef.nativeElement;
    const cellSize = 20;

    // Clear canvas
    this.ctx.fillStyle = '#0a192f';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid (subtle)
    this.ctx.strokeStyle = 'rgba(100, 255, 218, 0.05)';
    this.ctx.lineWidth = 1;
    for (let i = 0; i <= canvas.width; i += cellSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(i, 0);
      this.ctx.lineTo(i, canvas.height);
      this.ctx.stroke();
    }
    for (let i = 0; i <= canvas.height; i += cellSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, i);
      this.ctx.lineTo(canvas.width, i);
      this.ctx.stroke();
    }

    // Draw tech item
    if (state.techItem) {
      const item = state.techItem;
      const x = item.position.x * cellSize;
      const y = item.position.y * cellSize;

      // Glow effect
      this.ctx.shadowBlur = 15;
      this.ctx.shadowColor = item.color;
      
      // Draw icon background
      this.ctx.fillStyle = item.color;
      this.ctx.globalAlpha = 0.3;
      this.ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
      this.ctx.globalAlpha = 1;
      
      // Draw icon
      this.ctx.font = '16px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(item.icon, x + cellSize / 2, y + cellSize / 2);
      
      this.ctx.shadowBlur = 0;
    }

    // Draw snake with gradient
    state.snake.forEach((segment: any, index: number) => {
      const x = segment.x * cellSize;
      const y = segment.y * cellSize;
      
      // Create gradient from cyan to blue
      const gradient = this.ctx.createLinearGradient(x, y, x + cellSize, y + cellSize);
      const ratio = index / state.snake.length;
      gradient.addColorStop(0, `rgba(100, 255, 218, ${1 - ratio * 0.5})`);
      gradient.addColorStop(1, `rgba(45, 212, 191, ${1 - ratio * 0.5})`);
      
      // Draw segment
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
      
      // Head glow
      if (index === 0) {
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#64ffda';
        this.ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
        this.ctx.shadowBlur = 0;
      }
    });
  }

  private async onGameOver(): Promise<void> {
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop);
    }
    
    const state = this.gameService.state();
    const rank = await this.gameService.getPlayerRank(state.score);
    const total = await this.gameService.getTotalPlayers();
    this.playerRank.set(rank);
    this.totalPlayers.set(total);
    this.showGameOver.set(true);
  }

  public async saveAndShare(): Promise<void> {
    const name = this.playerName().trim();
    if (!name) {
      alert('Please enter your name!');
      return;
    }

    await this.gameService.saveScore(name);
    this.loadLeaderboard();
    
    // Wait for leaderboard to render, then capture screenshot
    setTimeout(() => this.prepareShareContent(), 100);
  }
  
  public async quickShareToLinkedIn(): Promise<void> {
    const name = this.playerName().trim();
    if (!name) {
      alert('Please enter your name first!');
      return;
    }

    await this.gameService.saveScore(name);
    this.loadLeaderboard();
    
    // Show the share modal with screenshot
    setTimeout(() => this.prepareShareContent(), 100);
  }

  private async prepareShareContent(): Promise<void> {
    const state = this.gameService.state();
    
    // Generate share message with LinkedIn profile link
    const message = 
      `مين يقدر يكسر التحدي\n` +
      `🎮 Just scored ${state.score} points on Mahmoud Kahiry's Tech Stack Snake!\n` +
      `🏆 Collected ${state.techCollected} technologies in ${this.formatDuration(this.gameService.getGameDuration())}\n` +
      `📊 Ranked #${this.playerRank()} out of ${this.totalPlayers()} players\n\n` +
      `Think you can beat my score? 🚀\n` +
      `Try it now: ${window.location.href}\n\n` +
      `#TechChallenge #MahmoudKhairy #QualityControl #AutomationTesting #AITesting\n` +
      `Created by Mahmoud Kahiry\n` +
      `🔗 https://www.linkedin.com/in/mahmoud-khairy-64633188/`;
    
    this.shareMessage.set(message);
    
    // Show share modal
    this.showShareModal.set(true);
    this.showGameOver.set(false);
    
    // Capture leaderboard screenshot
    await this.captureLeaderboardScreenshot();
  }

  private async captureLeaderboardScreenshot(): Promise<void> {
    try {
      // Create a temporary leaderboard element for screenshot
      const tempContainer = document.createElement('div');
      tempContainer.className = 'screenshot-leaderboard';
      tempContainer.innerHTML = this.generateLeaderboardHTML();
      document.body.appendChild(tempContainer);
      
      // Capture screenshot
      const dataUrl = await this.screenshotService.captureElement(tempContainer);
      this.screenshotUrl.set(dataUrl);
      
      // Remove temporary element
      document.body.removeChild(tempContainer);
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
    }
  }

  private generateLeaderboardHTML(): string {
    const state = this.gameService.state();
    const leaderboard = this.leaderboard();
    const playerName = this.playerName();
    
    return `
      <div style="background: linear-gradient(135deg, #0a192f 0%, #112240 100%); padding: 2rem; border-radius: 16px; color: #ccd6f6; font-family: Arial, sans-serif; min-width: 600px;">
        <h2 style="color: #64ffda; text-align: center; margin-bottom: 1rem; font-size: 2rem;">🏆 Tech Stack Snake Leaderboard</h2>
        <p style="text-align: center; color: #8892b0; margin-bottom: 2rem;">Top Players - Mahmoud Kahiry's Portfolio Challenge</p>
        
        <div style="background: rgba(100, 255, 218, 0.1); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; border: 2px solid #64ffda;">
          <div style="text-align: center;">
            <div style="font-size: 1rem; color: #8892b0; margin-bottom: 0.5rem;">Your Score</div>
            <div style="font-size: 3rem; font-weight: bold; color: #64ffda;">${state.score}</div>
            <div style="font-size: 1.25rem; color: #ccd6f6; margin-top: 0.5rem;">Rank #${this.playerRank()} - ${playerName}</div>
          </div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: rgba(100, 255, 218, 0.1);">
              <th style="padding: 1rem; text-align: left; color: #64ffda; border-bottom: 2px solid rgba(100, 255, 218, 0.3);">Rank</th>
              <th style="padding: 1rem; text-align: left; color: #64ffda; border-bottom: 2px solid rgba(100, 255, 218, 0.3);">Player</th>
              <th style="padding: 1rem; text-align: center; color: #64ffda; border-bottom: 2px solid rgba(100, 255, 218, 0.3);">Score</th>
              <th style="padding: 1rem; text-align: center; color: #64ffda; border-bottom: 2px solid rgba(100, 255, 218, 0.3);">Tech Items</th>
            </tr>
          </thead>
          <tbody>
            ${leaderboard.slice(0, 5).map((entry, index) => `
              <tr style="border-bottom: 1px solid rgba(100, 255, 218, 0.1); ${entry.playerName === playerName ? 'background: rgba(100, 255, 218, 0.15);' : ''}">
                <td style="padding: 1rem; ${index < 3 ? 'font-size: 1.5rem;' : ''}">
                  ${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                </td>
                <td style="padding: 1rem; font-weight: ${entry.playerName === playerName ? 'bold' : 'normal'}; color: ${entry.playerName === playerName ? '#64ffda' : '#ccd6f6'};">${entry.playerName}</td>
                <td style="padding: 1rem; text-align: center; font-weight: bold; color: #64ffda;">${entry.score}</td>
                <td style="padding: 1rem; text-align: center; color: #8892b0;">${entry.techCollected}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div style="text-align: center; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid rgba(100, 255, 218, 0.2);">
          <p style="color: #8892b0; font-size: 0.875rem;">Play at: ${window.location.href}</p>
          <p style="color: #64ffda; font-size: 0.875rem; margin-top: 0.5rem;">Created by Mahmoud Kahiry</p>
        </div>
      </div>
    `;
  }

  public async copyMessage(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.shareMessage());
      this.copySuccess.set(true);
      setTimeout(() => this.copySuccess.set(false), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
      alert('Failed to copy. Please copy manually.');
    }
  }

  public downloadScreenshot(): void {
    const url = this.screenshotUrl();
    if (!url) return;
    
    const link = document.createElement('a');
    link.download = `tech-stack-snake-score-${this.gameService.state().score}.png`;
    link.href = url;
    link.click();
  }

  public async shareToLinkedInDirect(): Promise<void> {
    const shareText = this.shareMessage();
    const screenshotUrl = this.screenshotUrl();
    
    // Auto-download the image first
    if (screenshotUrl) {
      this.downloadScreenshot();
    }
    
    // Try Web Share API with text only (works better)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Tech Stack Snake - My Score',
          text: shareText,
          url: window.location.href,
        });
        return; // Success!
      } catch (error: any) {
        // User cancelled or not supported
        if (error.name === 'AbortError') {
          return; // User cancelled, that's fine
        }
        console.log('Web Share not supported:', error);
      }
    }
    
    // Fallback for desktop: Open LinkedIn with copied text
    try {
      await navigator.clipboard.writeText(shareText);
      alert(
        '✅ Ready to share!\n\n' +
        '📋 Message copied\n' +
        '📸 Image downloaded\n\n' +
        'LinkedIn opening...\n' +
        'Paste & attach image!'
      );
    } catch (error) {
      alert('📸 Image downloaded!\n\nLinkedIn opening...');
    }
    
    // Open LinkedIn
    setTimeout(() => {
      window.open('https://www.linkedin.com/feed/', '_blank');
    }, 100);
  }

  public openLinkedIn(): void {
    window.open('https://www.linkedin.com/feed/', '_blank');
  }

  public closeShareModal(): void {
    this.showShareModal.set(false);
    this.showGameOver.set(true);
  }

  public viewLeaderboard(): void {
    this.loadLeaderboard();
    this.showLeaderboard.set(true);
    this.showGameOver.set(false);
  }

  public closeLeaderboard(): void {
    this.showLeaderboard.set(false);
  }

  private async loadLeaderboard(): Promise<void> {
    const leaders = await this.gameService.getLeaderboard(10);
    this.leaderboard.set(leaders);
  }

  // Mobile controls
  public swipeUp(): void {
    this.gameService.changeDirection(Direction.UP);
    this.startGameOnFirstMove();
  }

  public swipeDown(): void {
    this.gameService.changeDirection(Direction.DOWN);
    this.startGameOnFirstMove();
  }

  public swipeLeft(): void {
    this.gameService.changeDirection(Direction.LEFT);
    this.startGameOnFirstMove();
  }

  public swipeRight(): void {
    this.gameService.changeDirection(Direction.RIGHT);
    this.startGameOnFirstMove();
  }
  
  private startGameOnFirstMove(): void {
    if (!this.gameLoop) {
      this.startGameLoop();
    }
  }

  public formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  public formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString();
  }
}
