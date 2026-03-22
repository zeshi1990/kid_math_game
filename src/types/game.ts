export type Operator = '+' | '-';

export interface Problem {
  operandA: number;
  operandB: number;
  operator: Operator;
  answer: number;
}

export type FeedbackType = 'correct' | 'wrong' | 'none';

export type GamePhase = 'start' | 'playing' | 'feedback' | 'summary';

export interface SessionResult {
  problem: Problem;
  userAnswer: number | null;
  correct: boolean;
}

export interface SessionRecord {
  id: string;
  timestamp: number;
  correct: number;
  total: number;
  results: SessionResult[];
}
