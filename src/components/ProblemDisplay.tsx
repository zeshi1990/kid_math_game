import type { Problem } from '../types/game';
import { operatorSymbol } from '../utils/formatters';

interface ProblemDisplayProps {
  problem: Problem;
  currentInput: string;
  animationKey: number;
}

export function ProblemDisplay({ problem, currentInput, animationKey }: ProblemDisplayProps) {
  const answer = currentInput !== '' ? currentInput : '?';
  const symbol = operatorSymbol(problem.operator);

  return (
    <div key={animationKey} className="fade-slide-in text-center">
      <div className="text-8xl font-black text-purple-900 tracking-wide select-none">
        {problem.operandA} {symbol} {problem.operandB} ={' '}
        <span className={`inline-block min-w-[2.5rem] border-b-8 border-purple-400 ${currentInput ? 'text-purple-700' : 'text-purple-300'}`}>
          {answer}
        </span>
      </div>
    </div>
  );
}
