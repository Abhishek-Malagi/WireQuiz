// Game types for the Circuit Quiz Challenge

export interface Question {
  id: number;
  question: string;
  answer: string;
  category: string;
  points: number;
}

export interface WireConnection {
  wireId: number;
  socketId: number | null;
}

export interface GameState {
  questions: Question[];
  connections: WireConnection[];
  isComplete: boolean;
  gameStarted: boolean;
  startTime: number;
  score: number;
  lives: number;
  timeLimit: number;
}

export interface MousePosition {
  x: number;
  y: number;
}

export interface ComponentBaseProps {
  className?: string;
  id?: string;
}

export interface InteractiveElementProps extends ComponentBaseProps {
  onClick?: () => void;
  onHover?: (isHovering: boolean) => void;
  disabled?: boolean;
}

export type ConnectionStatus = 'disconnected' | 'connected' | 'correct' | 'incorrect';
export type WireColor = string;
export type SocketId = number;
export type WireId = number;