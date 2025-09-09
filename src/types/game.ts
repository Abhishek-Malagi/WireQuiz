// Game types for the Circuit Quiz Challenge

export interface Question {
  id: number;
  question: string;
  answer: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  points?: number;
}

export interface WireConnection {
  wireId: number;
  socketId: number | null;
  timestamp?: number;
  isCorrect?: boolean;
}

export interface GameState {
  questions: Question[];
  connections: WireConnection[];
  isComplete: boolean;
  showBulb: boolean;
  shuffledAnswers: string[];
  gameStarted: boolean;
  startTime: number;
  completionTime?: number;
  attempts: number;
  score: number;
  correctConnections: number;
}

export interface MousePosition {
  x: number;
  y: number;
}

export interface GameStats {
  totalGames: number;
  bestTime: number;
  averageTime: number;
  bestEfficiency: number;
  totalCorrectAnswers: number;
  streakRecord: number;
  currentStreak: number;
}

export interface GameSettings {
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number;
  hintsEnabled: boolean;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  theme: 'default' | 'dark' | 'colorful';
}

// Animation and visual types
export interface AnimationConfig {
  duration: number;
  delay?: number;
  easing?: string;
  repeat?: boolean | number;
}

export interface WireVisualProps {
  color: string;
  thickness: number;
  glowIntensity: number;
  animated: boolean;
}

export interface BulbState {
  isGlowing: boolean;
  brightness: number;
  glowColor: string;
  sparkleCount: number;
}

// Event types
export interface GameEvent {
  type: 'connection' | 'disconnection' | 'completion' | 'reset' | 'start';
  timestamp: number;
  data?: any;
}

export interface DragEvent {
  wireId: number;
  startPosition: MousePosition;
  currentPosition: MousePosition;
  isDragging: boolean;
}

// Component prop types
export interface ComponentBaseProps {
  className?: string;
  id?: string;
  'data-testid'?: string;
}

export interface InteractiveElementProps extends ComponentBaseProps {
  onClick?: () => void;
  onHover?: (isHovering: boolean) => void;
  disabled?: boolean;
  loading?: boolean;
}

// Utility types
export type ConnectionStatus = 'disconnected' | 'connected' | 'correct' | 'incorrect';
export type GamePhase = 'setup' | 'playing' | 'completed' | 'paused';
export type WireColor = string;
export type SocketId = number;
export type WireId = number;

// Response types for potential API integration
export interface GameSession {
  id: string;
  userId?: string;
  startTime: number;
  endTime?: number;
  score: number;
  questionsAnswered: number;
  correctAnswers: number;
  efficiency: number;
  timeElapsed: number;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  score: number;
  timeElapsed: number;
  efficiency: number;
  completedAt: number;
  rank: number;
}

// Error types
export interface GameError {
  code: string;
  message: string;
  timestamp: number;
  context?: any;
}

// Configuration types
export interface GameConfig {
  maxQuestions: number;
  timeLimit: number;
  pointsPerCorrectAnswer: number;
  penaltyPerWrongConnection: number;
  enableHints: boolean;
  enableSound: boolean;
  wireColors: WireColor[];
  animationSpeed: 'slow' | 'normal' | 'fast';
}