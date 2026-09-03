import { Subscription } from '../../types/subscription';
import { buildWidgetPayload } from '../widget';

const noConvert = (amount: number) => amount;

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
    startedAt: '2026-01-15T12:00:00.000Z',
    nextBillingDate: '2026-09-15T12:00:00.000Z',
    ...overrides,
  };
}

// Mid-month, so "this month" still has charges ahead of it.
const now = new Date(2026, 8, 5, 12);

describe('buildWidgetPayload', () => {
  test('reports the same monthly figure the dashboard does', () => {
    // The widget used to sum only what is charged in the current calendar month, so this annual
    // plan counted as zero in September and the two screens disagreed under one label.
    const annual = makeSub({
      id: 'adobe-1',
      name: 'Adobe',
      billingCycle: 'annual',
      defaultPrice: 120,
      startedAt: '2026-03-10T12:00:00.000Z',
      nextBillingDate: '2027-03-10T12:00:00.000Z',
    });
    const payload = buildWidgetPayload([makeSub(), annual], 'EUR', 'en-US', noConvert, 'Monthly', now);
    // 10 monthly + 120/12 annual, exactly as context's monthlyTotal computes it.
    expect(payload.monthTotal).toBe('€20.00');
  });

  test('carries the dashboard label rather than a month name', () => {
    const payload = buildWidgetPayload([makeSub()], 'EUR', 'en-US', noConvert, 'Monatlich', now);
    expect(payload.totalLabel).toBe('Monatlich');
  });

  test('passes each service logo through so the widget can draw the real icon', () => {
    const withLogo = makeSub({ logo: 'https://example.com/icon.png' });
    const payload = buildWidgetPayload([withLogo], 'EUR', 'en-US', noConvert, 'Monthly', now);
    expect(payload.upcoming[0].logo).toBe('https://example.com/icon.png');
    // Absent logos stay undefined so the widget knows to fall back to the initials chip.
    const noLogo = buildWidgetPayload([makeSub()], 'EUR', 'en-US', noConvert, 'Monthly', now);
    expect(noLogo.upcoming[0].logo).toBeUndefined();
  });

  test('lists the three soonest charges, soonest first', () => {
    const subs = [
      makeSub({ id: 'c-1', name: 'Later', nextBillingDate: '2026-09-28T12:00:00.000Z' }),
      makeSub({ id: 'a-1', name: 'Soonest', nextBillingDate: '2026-09-06T12:00:00.000Z' }),
      makeSub({ id: 'b-1', name: 'Middle', nextBillingDate: '2026-09-12T12:00:00.000Z' }),
      makeSub({ id: 'd-1', name: 'Last', nextBillingDate: '2026-09-30T12:00:00.000Z' }),
    ];
    const payload = buildWidgetPayload(subs, 'EUR', 'en-US', noConvert, 'Monthly', now);
    expect(payload.upcoming.map((u) => u.name)).toEqual(['Soonest', 'Middle', 'Later']);
  });

  test('leaves cancelled subscriptions out of the upcoming list', () => {
    const payload = buildWidgetPayload(
      [makeSub({ isCancelled: true, cancelEffectiveMonth: '2026-08-01T12:00:00.000Z' })],
      'EUR',
      'en-US',
      noConvert,
      'Monthly',
      now,
    );
    expect(payload.upcoming).toEqual([]);
  });

  test('pre-formats every money value, since the widget process cannot format currency itself', () => {
    const payload = buildWidgetPayload([makeSub()], 'JPY', 'en-US', noConvert, 'Monthly', now);
    expect(payload.monthTotal).toBe('¥10');
    expect(payload.upcoming[0].amount).toBe('¥10');
  });

  test('carries the badge colour and initials the widget draws with', () => {
    const payload = buildWidgetPayload([makeSub()], 'EUR', 'en-US', noConvert, 'Monthly', now);
    expect(payload.upcoming[0]).toMatchObject({ initials: 'NF', color: '#FF3B30' });
  });
});
