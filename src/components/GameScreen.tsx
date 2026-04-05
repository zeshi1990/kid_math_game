import type { Problem, FeedbackType, SessionResult } from '../types/game';
import { SESSION_LENGTH } from '../hooks/useGameLogic';
import { ProgressBar } from './ProgressBar';
import { ProblemDisplay } from './ProblemDisplay';
import { NumberPad } from './NumberPad';
import { FeedbackOverlay } from './FeedbackOverlay';

interface GameScreenProps {
  problem: Problem;
  currentIndex: number;
  currentInput: string;
  feedback: FeedbackType;
  timeLeft: number;
  results: SessionResult[];
  onNumberPress: (n: number) => void;
  onBackspace: () => void;
  onSubmit: () => void;
}

export function GameScreen({
  problem,
  currentIndex,
  currentInput,
  feedback,
  timeLeft,
  results,
  onNumberPress,
  onBackspace,
  onSubmit,
}: GameScreenProps) {
  const displayTime = Math.max(0, timeLeft);
  const timerColor =
    displayTime >= 40 ? 'bg-green-500 text-white' :
    displayTime >= 20 ? 'bg-yellow-400 text-yellow-900' :
    displayTime >= 10 ? 'bg-orange-500 text-white' :
                       'bg-red-600 text-white animate-pulse';

  const correctCount = results.filter(r => r.correct).length;

  return (
    <div className="min-h-screen bg-sky-300 flex flex-col items-center justify-between p-6 gap-6">
      <div className="w-full max-w-md pt-2 flex items-center gap-3">
        <div className="flex-1">
          <ProgressBar current={currentIndex} total={SESSION_LENGTH} correctCount={correctCount} />
        </div>
        <div className={`min-w-[3rem] h-12 rounded-2xl flex items-center justify-center text-2xl font-black shadow-md px-3 ${timerColor}`}>
          {displayTime}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center w-full max-w-md">
        <ProblemDisplay
          problem={problem}
          currentInput={currentInput}
          animationKey={currentIndex}
        />
      </div>

      <div className="w-full max-w-md pb-4">
        <NumberPad
          onNumberPress={onNumberPress}
          onBackspace={onBackspace}
          onSubmit={onSubmit}
          currentInput={currentInput}
          isChallenge={problem.operandA > 10 || problem.answer > 10}
        />
      </div>

      <FeedbackOverlay feedback={feedback} />
    </div>
  );
}
