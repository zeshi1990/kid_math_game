import { HistoryPanel } from './HistoryPanel';

interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="min-h-screen bg-sky-300 flex flex-col items-center justify-center gap-8 p-6">
      <div className="text-center">
        <div className="text-8xl mb-4">🍞🔢🍌</div>
        <h1 className="text-6xl font-black text-purple-900 leading-tight">
          Math Adventure!
        </h1>
        <p className="text-2xl text-purple-700 font-semibold mt-3">
          10 questions · Addition & Subtraction
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-sm w-full">
        <div className="text-xl font-bold text-purple-800 mb-4">How to play:</div>
        <div className="flex flex-col gap-3 text-lg text-gray-700">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔢</span>
            <span>Tap a number to answer</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">✓</span>
            <span>Press Check to confirm</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🍞</span>
            <span>Correct = Strawberry-jam bread!</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🍌</span>
            <span>Wrong = Rotten banana...</span>
          </div>
        </div>
      </div>

      <button
        onClick={onStart}
        className="px-16 py-6 rounded-3xl text-5xl font-black shadow-xl
          bg-green-500 hover:bg-green-400 text-white border-4 border-green-700
          active:scale-95 transition-transform"
      >
        Start! 🚀
      </button>

      <HistoryPanel />
    </div>
  );
}
