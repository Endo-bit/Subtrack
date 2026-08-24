import { diagnosisLabelKey, diagnosisScore, DiagnosisAnswers, recommendsCancellation } from '../diagnosis';

const base: DiagnosisAnswers = {
  usage: 0,
  duplicate: true,
  worthPrice: 0,
  forgot: true,
  wouldMiss: 0,
};

describe('diagnosisScore', () => {
  test('scores the worst-case answers as 0', () => {
    expect(diagnosisScore(base)).toBe(0);
  });

  test('scores the best-case answers at the maximum achievable value', () => {
    const best: DiagnosisAnswers = { usage: 3, duplicate: false, worthPrice: 2, forgot: false, wouldMiss: 2 };
    expect(diagnosisScore(best)).toBe(95);
  });

  test('each answer contributes independently', () => {
    expect(diagnosisScore({ ...base, usage: 2 })).toBe(16);
    expect(diagnosisScore({ ...base, duplicate: false })).toBe(15);
    expect(diagnosisScore({ ...base, worthPrice: 1 })).toBe(10);
    expect(diagnosisScore({ ...base, forgot: false })).toBe(12);
    expect(diagnosisScore({ ...base, wouldMiss: 1 })).toBe(12);
  });
});

describe('recommendsCancellation', () => {
  test('recommends cancellation below the threshold', () => {
    expect(recommendsCancellation(44)).toBe(true);
  });

  test('does not recommend cancellation at or above the threshold', () => {
    expect(recommendsCancellation(45)).toBe(false);
  });
});

describe('diagnosisLabelKey', () => {
  test('returns keep at 70 and above', () => {
    expect(diagnosisLabelKey(70)).toBe('diagnosisResultKeep');
    expect(diagnosisLabelKey(95)).toBe('diagnosisResultKeep');
  });

  test('returns review between the cancel threshold and the keep threshold', () => {
    expect(diagnosisLabelKey(45)).toBe('diagnosisResultReview');
    expect(diagnosisLabelKey(69)).toBe('diagnosisResultReview');
  });

  test('returns cancel below the cancel threshold', () => {
    expect(diagnosisLabelKey(44)).toBe('diagnosisResultCancel');
    expect(diagnosisLabelKey(0)).toBe('diagnosisResultCancel');
  });
});
