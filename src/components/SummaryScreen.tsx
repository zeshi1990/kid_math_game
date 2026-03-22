import type { SessionResult } from '../types/game';

interface SummaryScreenProps {
  results: SessionResult[];
  onPlayAgain: () => void;
}

export function SummaryScreen({ results, onPlayAgain }: SummaryScreenProps) {
  const correct = results.filter(r => r.correct).length;
  const wrong = results.length - correct;

  return (
    <div className="min-h-screen bg-sky-300 flex flex-col items-center justify-center gap-8 p-6">
      <div className="text-6xl font-black text-purple-900">Game Over! 🎊</div>

      <div className="bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center gap-6 w-full max-w-md">
        <div className="text-center">
          <div className="text-5xl font-black text-green-600 mb-1">{correct} / {results.length}</div>
          <div className="text-2xl text-purple-800 font-bold">Correct Answers</div>
        </div>

        <div className="flex gap-10 text-center">
          <div>
            <div className="text-5xl">🍞</div>
            <div className="text-4xl font-black text-green-600">{correct}</div>
            <div className="text-lg text-green-700 font-semibold">Breads</div>
          </div>
          <div>
            <div className="text-5xl">🍌</div>
            <div className="text-4xl font-black text-red-500">{wrong}</div>
            <div className="text-lg text-red-600 font-semibold">Bananas</div>
          </div>
        </div>

        <div className="w-full border-t border-gray-200 pt-4">
          <div className="text-xl font-bold text-purple-800 mb-3">Review:</div>
          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
            {results.map((r, i) => {
              const sym = r.problem.operator === '+' ? '+' : '−';
              return (
                <div key={i} className={`flex justify-between items-center rounded-xl px-4 py-2 text-lg font-bold
                  ${r.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  <span>{r.problem.operandA} {sym} {r.problem.operandB} = {r.problem.answer}</span>
                  <span>{r.correct ? '🍞' : `🍌 (you said ${r.userAnswer})`}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <button
        onClick={onPlayAgain}
        className="mt-2 px-12 py-5 rounded-3xl text-4xl font-black shadow-lg
          bg-purple-500 hover:bg-purple-400 text-white border-4 border-purple-700
          active:scale-95 transition-transform"
      >
        Play Again! 🎮
      </button>
    </div>
  );
}
