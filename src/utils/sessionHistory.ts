import type { SessionRecord } from '../types/game';

const STORAGE_KEY = 'mathgame_history';
const MAX_SESSIONS = 10;

export function loadHistory(): SessionRecord[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as SessionRecord[];
  } catch {
    return [];
  }
}

export function saveSession(record: SessionRecord): void {
  const history = loadHistory();
  const updated = [record, ...history].slice(0, MAX_SESSIONS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
