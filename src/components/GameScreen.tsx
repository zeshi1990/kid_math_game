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
  timeLeft: number;
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
  onNumberPress,
  onBackspace,
  onSubmit,
}: GameScreenProps) {
  const timerColor =
    timeLeft >= 40 ? 'bg-green-500 text-white' :
    timeLeft >= 20 ? 'bg-yellow-400 text-yellow-900' :
    timeLeft >= 10 ? 'bg-orange-500 text-white' :
                     'bg-red-600 text-white animate-pulse';

  return (
    <div className="min-h-screen bg-sky-300 flex flex-col items-center justify-between p-6 gap-6">
      <div className="w-full max-w-md pt-2 flex items-center gap-3">
        <div className="flex-1">
          <ProgressBar current={currentIndex} total={SESSION_LENGTH} />
        </div>
        <div className={`min-w-[3rem] h-12 rounded-2xl flex items-center justify-center text-2xl font-black shadow-md px-3 ${timerColor}`}>
          {timeLeft}
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
