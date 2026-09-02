import { Subscription } from '../../types/subscription';
import { DiagnosisRecord } from '../diagnosis';
import { buildShareSummary, MAX_SHARE_RESULT_ROWS } from '../shareSummary';

function makeSub(overrides: Partial<Subscription> = {}): Subscription {
  return {
    id: 'netflix-1',
    name: 'Netflix',
    initials: 'NF',
    color: '#FF3B30',
    defaultPrice: 12,
    category: 'streaming',
    billingCycle: 'monthly',
    plans: [],
    startedAt: '2026-01-15T12:00:00.000Z',
    nextBillingDate: '2026-09-15T12:00:00.000Z',
    ...overrides,
  };
}

function makeRecord(overrides: Partial<DiagnosisRecord> = {}): DiagnosisRecord {
  return {
    subscriptionId: 'netflix-1',
    subscriptionName: 'Netflix',
    score: 70,
    answers: { usage: 3, duplicate: false, worthPrice: 2, forgot: false, wouldMiss: 2 },
    createdAt: '2026-09-05T10:00:00.000Z',
    ...overrides,
  };
}

describe('buildShareSummary', () => {
  test('derives the yearly figure from the monthly one so the two always agree', () => {
    const summary = buildShareSummary([makeSub()], []);
    expect(summary.monthlyTotal).toBe(12);
    expect(summary.annualTotal).toBe(144);
  });

  test('counts and prices only active subscriptions', () => {
    const summary = buildShareSummary([makeSub(), makeSub({ id: 'x-1', isCancelled: true })], []);
    expect(summary.activeCount).toBe(1);
    expect(summary.monthlyTotal).toBe(12);
  });

  test('includes only the most recent check-in run, not the whole history', () => {
    const summary = buildShareSummary(
      [makeSub()],
      [
        makeRecord({ subscriptionId: 'a-1', createdAt: '2026-09-05T10:00:00.000Z' }),
        makeRecord({ subscriptionId: 'b-1', createdAt: '2026-09-05T10:05:00.000Z' }),
        makeRecord({ subscriptionId: 'old-1', createdAt: '2026-07-01T10:00:00.000Z' }),
      ],
    );
    expect(summary.results.map((r) => r.subscriptionId)).toEqual(['a-1', 'b-1']);
  });

  test('caps the result rows so the card stays a sensible shape', () => {
    const many = Array.from({ length: 9 }, (_, i) =>
      makeRecord({ subscriptionId: `s-${i}`, createdAt: '2026-09-05T10:00:00.000Z' }),
    );
    expect(buildShareSummary([makeSub()], many).results).toHaveLength(MAX_SHARE_RESULT_ROWS);
  });

  test('is happy with no check-in history at all', () => {
    expect(buildShareSummary([makeSub()], []).results).toEqual([]);
  });

  test('applies the conversion function to every money figure', () => {
    const double = (amount: number) => amount * 2;
    const summary = buildShareSummary([makeSub()], [], double);
    expect(summary.monthlyTotal).toBe(24);
    expect(summary.dailyTotal).toBeCloseTo(0.8);
  });
});
