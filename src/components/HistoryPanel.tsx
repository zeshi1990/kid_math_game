import { useState, useEffect } from 'react';
import type { SessionRecord } from '../types/game';
import { loadHistory } from '../utils/sessionHistory';

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function HistoryPanel() {
  const [history, setHistory] = useState<SessionRecord[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  if (history.length === 0) {
    return (
      <div className="w-full max-w-sm text-center text-purple-600 font-semibold text-lg opacity-70">
        No games played yet
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm bg-white rounded-3xl shadow-lg p-4">
      <div className="text-purple-800 font-black text-lg mb-3 text-center">Past Sessions 📋</div>
      <div className="flex flex-col gap-2 max-h-52 overflow-y-auto">
        {history.map(record => {
          const pct = Math.round((record.correct / record.total) * 100);
          const color = pct >= 80 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-500';
          return (
            <div key={record.id} className="flex items-center justify-between bg-sky-50 rounded-xl px-4 py-2">
              <span className="text-purple-700 font-semibold text-base">📅 {formatDate(record.timestamp)}</span>
              <span className="text-base font-bold">🍞 {record.correct}/{record.total}</span>
              <span className={`text-base font-black ${color}`}>⭐ {pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
