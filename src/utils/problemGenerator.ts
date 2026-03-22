import type { Problem, Operator } from '../types/game';

// Regular problem: both operands in [1, 9/10], answer in [0, 10]. No zeros as operands.
function generateOneProblem(): Problem {
  const operator: Operator = Math.random() < 0.5 ? '+' : '-';

  if (operator === '+') {
    // a in [1,9] so b always has room to be ≥ 1; b in [1, 10-a]; sum in [2, 10]
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * (10 - a)) + 1;
    return { operandA: a, operandB: b, operator, answer: a + b };
  } else {
    // a in [1,10], b in [1, a]; answer in [0, 9]
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * a) + 1;
    return { operandA: a, operandB: b, operator, answer: a - b };
  }
}

// Challenge problem: addition with sum in (10, 20], or subtraction with operandA in [11, 20].
function generateChallengeProblem(): Problem {
  if (Math.random() < 0.5) {
    // Challenge addition: sum in [11, 20], both operands ≥ 1
    const a = Math.floor(Math.random() * 10) + 1; // [1, 10]
    const minB = Math.max(1, 11 - a);
    const b = minB + Math.floor(Math.random() * (10 - minB + 1)); // [minB, 10]
    return { operandA: a, operandB: b, operator: '+', answer: a + b };
  } else {
    // Challenge subtraction: operandA in [11, 20], operandB in [1, operandA-1]
    const a = Math.floor(Math.random() * 10) + 11; // [11, 20]
    const b = Math.floor(Math.random() * (a - 1)) + 1; // [1, a-1]
    return { operandA: a, operandB: b, operator: '-', answer: a - b };
  }
}

export function generateProblems(count = 10): Problem[] {
  const seen = new Set<string>();
  const problems: Problem[] = [];

  // Generate the one challenge problem
  let challenge: Problem | null = null;
  while (!challenge) {
    const p = generateChallengeProblem();
    const key = `${p.operandA}${p.operator}${p.operandB}`;
    if (!seen.has(key)) {
      seen.add(key);
      challenge = p;
    }
  }

  // Generate the remaining regular problems
  while (problems.length < count - 1) {
    const p = generateOneProblem();
    const key = `${p.operandA}${p.operator}${p.operandB}`;
    if (!seen.has(key)) {
      seen.add(key);
      problems.push(p);
    }
  }

  // Insert challenge at a random position
  const insertAt = Math.floor(Math.random() * (problems.length + 1));
  problems.splice(insertAt, 0, challenge);

  return problems;
}
