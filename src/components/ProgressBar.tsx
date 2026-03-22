interface ProgressBarProps {
  current: number; // 0-based index
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = ((current) / total) * 100;
  return (
    <div className="w-full">
      <div className="flex justify-between text-purple-900 font-bold text-lg mb-1">
        <span>Question {current + 1} of {total}</span>
        <span>{current} ✅</span>
      </div>
      <div className="w-full bg-purple-200 rounded-full h-4 overflow-hidden">
        <div
          className="bg-purple-500 h-4 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
