import type { Operator } from '../types/game';

/** Returns the display symbol for a math operator. */
export function operatorSymbol(op: Operator): string {
  return op === '+' ? '+' : '−';
}
