interface NumberPadProps {
  onNumberPress: (n: number) => void;
  onBackspace: () => void;
  onSubmit: () => void;
  currentInput: string;
  isChallenge: boolean;
}

const REGULAR_BUTTONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 0];
const CHALLENGE_BUTTONS = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

export function NumberPad({ onNumberPress, onBackspace, onSubmit, currentInput, isChallenge }: NumberPadProps) {
  const btnBase = 'flex items-center justify-center w-20 h-20 rounded-2xl text-3xl font-black shadow-md active:scale-95 transition-transform select-none cursor-pointer';

  return (
    <div className="flex flex-col items-center gap-3">
      {isChallenge && (
        <div className="grid grid-cols-5 gap-3">
          {CHALLENGE_BUTTONS.map(n => (
            <button
              key={n}
              onClick={() => onNumberPress(n)}
              className={`${btnBase} bg-orange-400 hover:bg-orange-300 text-purple-900 border-4 border-orange-600`}
            >
              {n}
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-4 gap-3">
        {REGULAR_BUTTONS.map(n => (
          <button
            key={n}
            onClick={() => onNumberPress(n)}
            className={`${btnBase} bg-yellow-400 hover:bg-yellow-300 text-purple-900 border-4 border-yellow-600`}
          >
            {n}
          </button>
        ))}
        <button
          onClick={onBackspace}
          className={`${btnBase} bg-red-300 hover:bg-red-200 text-red-900 border-4 border-red-500`}
          title="Clear"
        >
          ⌫
        </button>
      </div>
      <button
        onClick={onSubmit}
        disabled={currentInput === ''}
        className="w-full py-5 rounded-3xl text-4xl font-black shadow-lg transition-all select-none
          bg-green-500 hover:bg-green-400 text-white border-4 border-green-700
          disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
          active:scale-95"
      >
        ✓ Check!
      </button>
    </div>
  );
}
