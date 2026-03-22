import { useState, useEffect, useCallback } from 'react';
import type { GamePhase, FeedbackType, SessionResult, Problem } from '../types/game';
import { generateProblems } from '../utils/problemGenerator';
import { saveSession } from '../utils/sessionHistory';
import { useSound } from './useSound';

const FEEDBACK_DURATION_MS = 1500;
export const SESSION_LENGTH = 10;

interface GameState {
  phase: GamePhase;
  problems: Problem[];
  currentIndex: number;
  currentInput: string;
  feedback: FeedbackType;
  results: SessionResult[];
}

const initialState: GameState = {
  phase: 'start',
  problems: [],
  currentIndex: 0,
  currentInput: '',
  feedback: 'none',
  results: [],
};

export function useGameLogic() {
  const [state, setState] = useState<GameState>(initialState);
  const { playYay, playBuzzer } = useSound();

  // Auto-advance after feedback — moved to useEffect to avoid StrictMode double-timer bug
  useEffect(() => {
    if (state.feedback === 'none') return;
    const timer = setTimeout(() => {
      setState(prev => {
        const nextIndex = prev.currentIndex + 1;
        if (nextIndex >= SESSION_LENGTH) {
          saveSession({
            id: Date.now().toString(),
            timestamp: Date.now(),
            correct: prev.results.filter(r => r.correct).length,
            total: SESSION_LENGTH,
            results: prev.results,
          });
          return { ...prev, phase: 'summary', feedback: 'none' };
        }
        return { ...prev, currentIndex: nextIndex, currentInput: '', feedback: 'none', phase: 'playing' };
      });
    }, FEEDBACK_DURATION_MS);
    return () => clearTimeout(timer);
  }, [state.feedback, state.currentIndex]);

  const startGame = useCallback(() => {
    setState({
      ...initialState,
      phase: 'playing',
      problems: generateProblems(SESSION_LENGTH),
    });
  }, []);

  const resetGame = useCallback(() => {
    setState(initialState);
  }, []);

  const handleNumberPress = useCallback((n: number) => {
    setState(s => s.phase === 'playing' ? { ...s, currentInput: String(n) } : s);
  }, []);

  const handleBackspace = useCallback(() => {
    setState(s => s.phase === 'playing' ? { ...s, currentInput: '' } : s);
  }, []);

  const handleSubmit = useCallback(() => {
    setState(s => {
      if (s.phase !== 'playing' || s.currentInput === '') return s;
      const problem = s.problems[s.currentIndex];
      const userAnswer = parseInt(s.currentInput, 10);
      const correct = userAnswer === problem.answer;
      if (correct) playYay(); else playBuzzer();
      return {
        ...s,
        phase: 'feedback',
        feedback: correct ? 'correct' : 'wrong',
        results: [...s.results, { problem, userAnswer, correct }],
      };
    });
  }, [playYay, playBuzzer]);

  const currentProblem = state.problems[state.currentIndex] ?? null;

  return {
    phase: state.phase,
    currentProblem,
    currentIndex: state.currentIndex,
    currentInput: state.currentInput,
    feedback: state.feedback,
    results: state.results,
    startGame,
    resetGame,
    handleNumberPress,
    handleBackspace,
    handleSubmit,
  };
}
