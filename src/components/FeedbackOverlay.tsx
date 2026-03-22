import type { FeedbackType } from '../types/game';

interface FeedbackOverlayProps {
  feedback: FeedbackType;
}

export function FeedbackOverlay({ feedback }: FeedbackOverlayProps) {
  if (feedback === 'none') return null;

  const isCorrect = feedback === 'correct';

  return (
    <div
      className={`fixed inset-0 flex flex-col items-center justify-center z-50
        ${isCorrect ? 'bg-green-400' : 'bg-red-400'}`}
    >
      <div className="pop-in flex flex-col items-center gap-6">
        {isCorrect ? (
          <div className="flex flex-wrap justify-center gap-4 text-8xl leading-none">
            <span>🍞</span>
            <span>🍓</span>
            <span>🍌</span>
            <span>🚗</span>
            <span>🏠</span>
          </div>
        ) : (
          <div className="text-[10rem] leading-none">🍌</div>
        )}
        <div className="text-6xl font-black text-white drop-shadow-lg">
          {isCorrect ? 'Yay! 🎉' : 'Try again! 😅'}
        </div>
        <div className="text-3xl text-white font-bold opacity-90">
          {isCorrect ? 'You earned a strawberry-jam bread!' : 'You got a rotten banana...'}
        </div>
      </div>
    </div>
  );
}
