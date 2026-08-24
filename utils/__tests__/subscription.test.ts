import { Subscription } from '@/types/subscription';
import {
  chargeAmountInMonth,
  chargesInMonth,
  computeNextBillingFromStart,
  dailyCost,
  isInTrial,
  monthly,
  normalizeSubscription,
  spendingTrendForYear,
  yearly,
} from '../subscription';

function makeSub(overrides: Partial<Subscription> = {}): Subscription {
  return {
    id: 'test',
    name: 'Test Service',
    initials: 'TS',
    color: '#000',
    defaultPrice: 12,
    category: 'other',
    billingCycle: 'monthly',
    plans: [],
    startedAt: '2026-01-15T12:00:00.000Z',
    nextBillingDate: '2026-01-15T12:00:00.000Z',
    ...overrides,
  };
}

describe('monthly / yearly / dailyCost', () => {
  test('monthly billing passes the price through unchanged', () => {
    expect(monthly(makeSub({ defaultPrice: 12, billingCycle: 'monthly' }))).toBe(12);
  });

  test('quarterly billing divides by 3', () => {
    expect(monthly(makeSub({ defaultPrice: 30, billingCycle: 'quarterly' }))).toBe(10);
  });

  test('annual billing divides by 12', () => {
    expect(monthly(makeSub({ defaultPrice: 120, billingCycle: 'annual' }))).toBe(10);
  });

  test('yearly is monthly times 12', () => {
    expect(yearly(makeSub({ defaultPrice: 10, billingCycle: 'monthly' }))).toBe(120);
  });

  test('dailyCost uses the cycle-appropriate divisor', () => {
    expect(dailyCost(makeSub({ defaultPrice: 30, billingCycle: 'monthly' }))).toBeCloseTo(1);
    expect(dailyCost(makeSub({ defaultPrice: 365, billingCycle: 'annual' }))).toBeCloseTo(1);
    expect(dailyCost(makeSub({ defaultPrice: 91, billingCycle: 'quarterly' }))).toBeCloseTo(1);
  });
});

describe('computeNextBillingFromStart', () => {
  test('returns the start date itself when the reference is before it', () => {
    const start = new Date(2026, 5, 10);
    const next = computeNextBillingFromStart(start, 'monthly', new Date(2026, 4, 1));
    expect([next.getFullYear(), next.getMonth(), next.getDate()]).toEqual([2026, 5, 10]);
  });

  test('advances monthly billing to the next occurrence on/after the reference', () => {
    const start = new Date(2026, 0, 15);
    const next = computeNextBillingFromStart(start, 'monthly', new Date(2026, 2, 1));
    expect([next.getMonth(), next.getDate()]).toEqual([2, 15]);
  });

  test('clamps the billing day to the last day of shorter months', () => {
    const start = new Date(2026, 0, 31);
    const next = computeNextBillingFromStart(start, 'monthly', new Date(2026, 1, 1));
    expect([next.getMonth(), next.getDate()]).toEqual([1, 28]);
  });

  test('advances quarterly billing in 3-month steps', () => {
    const start = new Date(2026, 0, 1);
    const next = computeNextBillingFromStart(start, 'quarterly', new Date(2026, 5, 1));
    expect(next.getMonth()).toBe(6);
  });
});

describe('normalizeSubscription', () => {
  test('derives nextBillingDate from startedAt and billingCycle', () => {
    const normalized = normalizeSubscription(makeSub({ startedAt: '2026-01-15T12:00:00.000Z' }));
    expect(new Date(normalized.nextBillingDate).getDate()).toBe(15);
  });

  test('defaults planName to the first plan when not explicitly set', () => {
    const normalized = normalizeSubscription(
      makeSub({ plans: [{ id: 'p1', name: 'Standard', price: 10 }] }),
    );
    expect(normalized.planName).toBe('Standard');
  });

  test('defaults planChangedAt to startedAt when not explicitly set', () => {
    const normalized = normalizeSubscription(makeSub({ startedAt: '2026-01-15T12:00:00.000Z' }));
    expect(normalized.planChangedAt).toBe('2026-01-15T12:00:00.000Z');
  });
});

describe('chargesInMonth', () => {
  test('monthly subscription charges every month from start onward', () => {
    const sub = makeSub({ startedAt: '2026-01-10T12:00:00.000Z', billingCycle: 'monthly' });
    expect(chargesInMonth(sub, 2026, 0)).toBe(true);
    expect(chargesInMonth(sub, 2026, 5)).toBe(true);
    expect(chargesInMonth(sub, 2025, 11)).toBe(false);
  });

  test('quarterly subscription only charges every 3rd month', () => {
    const sub = makeSub({ startedAt: '2026-01-10T12:00:00.000Z', billingCycle: 'quarterly' });
    expect(chargesInMonth(sub, 2026, 0)).toBe(true);
    expect(chargesInMonth(sub, 2026, 1)).toBe(false);
    expect(chargesInMonth(sub, 2026, 3)).toBe(true);
  });

  test('chargeAmountInMonth returns 0 outside billing months', () => {
    const sub = makeSub({ startedAt: '2026-01-10T12:00:00.000Z', billingCycle: 'annual', defaultPrice: 100 });
    expect(chargeAmountInMonth(sub, 2026, 0)).toBe(100);
    expect(chargeAmountInMonth(sub, 2026, 5)).toBe(0);
  });
});

describe('free trial billing', () => {
  test('isInTrial is true while trialEndsAt is in the future', () => {
    const future = new Date(Date.now() + 10 * 86400000).toISOString();
    expect(isInTrial(makeSub({ trialEndsAt: future }))).toBe(true);
  });

  test('isInTrial is false once trialEndsAt has passed', () => {
    const past = new Date(Date.now() - 86400000).toISOString();
    expect(isInTrial(makeSub({ trialEndsAt: past }))).toBe(false);
  });

  test('isInTrial is false when trialEndsAt is not set', () => {
    expect(isInTrial(makeSub())).toBe(false);
  });

  test('monthly and dailyCost are 0 while in trial', () => {
    const future = new Date(Date.now() + 10 * 86400000).toISOString();
    const sub = makeSub({ defaultPrice: 20, trialEndsAt: future });
    expect(monthly(sub)).toBe(0);
    expect(dailyCost(sub)).toBe(0);
  });

  test('chargeAmountInMonth is 0 for occurrences within the trial and full price after', () => {
    const sub = makeSub({
      startedAt: '2026-01-10T12:00:00.000Z',
      billingCycle: 'monthly',
      defaultPrice: 15,
      trialEndsAt: '2026-03-10T00:00:00.000Z',
    });
    expect(chargeAmountInMonth(sub, 2026, 1)).toBe(0);
    expect(chargeAmountInMonth(sub, 2026, 3)).toBe(15);
  });
});

describe('spendingTrendForYear', () => {
  test('returns 12 rows for the given year with correct totals', () => {
    const sub = makeSub({ startedAt: '2026-01-10T12:00:00.000Z', billingCycle: 'monthly', defaultPrice: 10 });
    const rows = spendingTrendForYear([sub], 2026);
    expect(rows).toHaveLength(12);
    expect(rows[0]).toMatchObject({ total: 10, year: 2026, month: 0 });
  });

  test('excludes cancelled subscriptions', () => {
    const sub = makeSub({
      startedAt: '2026-01-10T12:00:00.000Z',
      billingCycle: 'monthly',
      defaultPrice: 10,
      isCancelled: true,
    });
    const rows = spendingTrendForYear([sub], 2026);
    expect(rows.every((r) => r.total === 0)).toBe(true);
  });
});
