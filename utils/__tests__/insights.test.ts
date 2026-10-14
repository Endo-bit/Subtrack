import { PresetService, Subscription } from '../../types/subscription';
import { buildRotationPlan, detectPriceHikes, lifetimeSpend, workHours } from '../insights';

function makeSub(overrides: Partial<Subscription> = {}): Subscription {
  return {
    id: 'netflix-1',
    name: 'Netflix',
    initials: 'NF',
    color: '#FF3B30',
    defaultPrice: 10,
    category: 'streaming',
    billingCycle: 'monthly',
    plans: [],
    startedAt: new Date(2026, 0, 15, 12).toISOString(),
    nextBillingDate: new Date(2026, 9, 15, 12).toISOString(),
    ...overrides,
  };
}

describe('lifetimeSpend', () => {
  test('counts every charge up to today, and this month only once its day has passed', () => {
    // Jan 15 → Oct 14: Jan..Sep billed = 9 charges; Oct 15 hasn't happened yet.
    expect(lifetimeSpend(makeSub(), undefined, new Date(2026, 9, 14, 12))).toBe(90);
    expect(lifetimeSpend(makeSub(), undefined, new Date(2026, 9, 15, 13))).toBe(100);
  });

  test('is zero before the subscription starts', () => {
    expect(lifetimeSpend(makeSub(), undefined, new Date(2025, 5, 1))).toBe(0);
  });

  test('annual plans charge once a year', () => {
    const sub = makeSub({ billingCycle: 'annual', defaultPrice: 99, startedAt: new Date(2024, 2, 1, 12).toISOString() });
    expect(lifetimeSpend(sub, undefined, new Date(2026, 9, 14))).toBe(99 * 3);
  });
});

describe('workHours', () => {
  test('divides by the wage, and is null without one', () => {
    expect(workHours(300, 15)).toBe(20);
    expect(workHours(300, null)).toBeNull();
    expect(workHours(300, 0)).toBeNull();
  });
});

describe('detectPriceHikes', () => {
  const preset: PresetService = {
    id: 'netflix',
    name: 'Netflix',
    initials: 'N',
    color: '#E50914',
    defaultPrice: 17.99,
    category: 'streaming',
    billingCycle: 'monthly',
    plans: [{ id: 'netflix-standard', name: 'Standard', price: 15.99, prices: { USD: 19.99 } }],
  };
  const exactEur = (eur: number) => ({ amount: eur, currency: 'EUR' as const, exact: true });

  test('flags a catalogue plan that now costs more than the tracked price', () => {
    const sub = makeSub({ id: 'netflix-123', planName: 'Standard', defaultPrice: 13.99 });
    const [hike] = detectPriceHikes([sub], [preset], exactEur, 'EUR');
    expect(hike.currentPrice).toBe(15.99);
    expect(hike.pct).toBe(14);
  });

  test('ignores custom prices, converted prices, cancelled subs and dismissed hikes', () => {
    const base = { id: 'netflix-123', planName: 'Standard', defaultPrice: 13.99 };
    expect(detectPriceHikes([makeSub({ ...base, customPrice: true })], [preset], exactEur, 'EUR')).toEqual([]);
    expect(detectPriceHikes([makeSub({ ...base, isCancelled: true })], [preset], exactEur, 'EUR')).toEqual([]);
    const converted = () => ({ amount: 99, currency: 'JPY' as const, exact: false });
    expect(detectPriceHikes([makeSub(base)], [preset], converted, 'JPY')).toEqual([]);
    expect(detectPriceHikes([makeSub(base)], [preset], exactEur, 'EUR', ['netflix-123|15.99'])).toEqual([]);
  });
});

describe('buildRotationPlan', () => {
  test('needs at least two monthly streaming services', () => {
    expect(buildRotationPlan([makeSub()])).toBeNull();
    expect(buildRotationPlan([makeSub(), makeSub({ id: 'x', category: 'music' })])).toBeNull();
  });

  test('saves the difference between the stack and one-at-a-time', () => {
    const plan = buildRotationPlan(
      [makeSub({ id: 'a', defaultPrice: 20 }), makeSub({ id: 'b', defaultPrice: 10 })],
      undefined,
      new Date(2026, 9, 14),
    )!;
    expect(plan.monthlyNow).toBe(30);
    expect(plan.monthlyRotating).toBe(15);
    expect(plan.yearlySaving).toBe(180);
    expect(plan.schedule.map((s) => s.subscription.id)).toEqual(['a', 'b', 'a', 'b', 'a', 'b']);
  });
});
