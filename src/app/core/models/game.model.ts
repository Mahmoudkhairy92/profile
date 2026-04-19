export interface Position {
  x: number;
  y: number;
}

export interface TechItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  tip: string;
  points: number;
  position: Position;
}

export interface GameState {
  snake: Position[];
  direction: Direction;
  techItem: TechItem | null;
  score: number;
  gameOver: boolean;
  paused: boolean;
  speed: number;
  level: number;
  techCollected: number;
  combo: number;
  highScore: number;
}

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export interface LeaderboardEntry {
  id?: string;
  playerName: string;
  score: number;
  techCollected: number;
  timestamp: number;
  duration: number; // in seconds
}

export interface GameTip {
  tech: string;
  icon: string;
  color: string;
  tip: string;
  points: number;
}
