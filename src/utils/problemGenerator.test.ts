import { generateProblems } from './problemGenerator';

describe('generateProblems', () => {
  it('returns exactly the requested count', () => {
    expect(generateProblems(10)).toHaveLength(10);
    expect(generateProblems(5)).toHaveLength(5);
  });

  it('all answers are non-negative', () => {
    const problems = generateProblems(100);
    for (const p of problems) {
      expect(p.answer).toBeGreaterThanOrEqual(0);
    }
  });

  it('regular problems never have 0 as an operand', () => {
    // Run many sessions; the one challenge per session may have large operands but never 0
    for (let i = 0; i < 10; i++) {
      const problems = generateProblems(10);
      for (const p of problems) {
        expect(p.operandA).toBeGreaterThanOrEqual(1);
        expect(p.operandB).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('addition answers equal operandA + operandB', () => {
    const problems = generateProblems(100).filter(p => p.operator === '+');
    for (const p of problems) {
      expect(p.answer).toBe(p.operandA + p.operandB);
    }
  });

  it('subtraction answers equal operandA - operandB and are never negative', () => {
    const problems = generateProblems(100).filter(p => p.operator === '-');
    for (const p of problems) {
      expect(p.answer).toBe(p.operandA - p.operandB);
      expect(p.answer).toBeGreaterThanOrEqual(0);
    }
  });

  it('produces both + and - operators across a large batch', () => {
    const problems = generateProblems(100);
    const operators = new Set(problems.map(p => p.operator));
    expect(operators.has('+')).toBe(true);
    expect(operators.has('-')).toBe(true);
  });

  it('no duplicate problems within a session', () => {
    const problems = generateProblems(10);
    const keys = problems.map(p => `${p.operandA}${p.operator}${p.operandB}`);
    expect(new Set(keys).size).toBe(10);
  });

  it('each session contains exactly one challenge problem', () => {
    for (let i = 0; i < 20; i++) {
      const problems = generateProblems(10);
      const challenges = problems.filter(
        p => (p.operator === '+' && p.answer > 10) || p.operandA > 10,
      );
      expect(challenges).toHaveLength(1);
    }
  });

  it('challenge addition has answer in (10, 20]', () => {
    const problems = generateProblems(100);
    const challengeAdds = problems.filter(p => p.operator === '+' && p.answer > 10);
    for (const p of challengeAdds) {
      expect(p.answer).toBeGreaterThan(10);
      expect(p.answer).toBeLessThanOrEqual(20);
    }
  });

  it('challenge subtraction has operandA in [11, 20] and non-negative answer', () => {
    const problems = generateProblems(100);
    const challengeSubs = problems.filter(p => p.operator === '-' && p.operandA > 10);
    for (const p of challengeSubs) {
      expect(p.operandA).toBeGreaterThanOrEqual(11);
      expect(p.operandA).toBeLessThanOrEqual(20);
      expect(p.answer).toBeGreaterThanOrEqual(0);
    }
  });
});
