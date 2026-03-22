import type { Problem, FeedbackType } from '../types/game';
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
  onNumberPress: (n: number) => void;
  onBackspace: () => void;
  onSubmit: () => void;
}

export function GameScreen({
  problem,
  currentIndex,
  currentInput,
  feedback,
  onNumberPress,
  onBackspace,
  onSubmit,
}: GameScreenProps) {
  return (
    <div className="min-h-screen bg-sky-300 flex flex-col items-center justify-between p-6 gap-6">
      <div className="w-full max-w-md pt-2">
        <ProgressBar current={currentIndex} total={SESSION_LENGTH} />
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
