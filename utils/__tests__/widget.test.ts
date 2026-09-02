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
  test('totals what is actually charged this calendar month, not the monthly run rate', () => {
    // An annual plan renewing in March contributes nothing to a September widget, even though
    // it carries a non-zero monthly equivalent everywhere else in the app.
    const annual = makeSub({
      id: 'adobe-1',
      name: 'Adobe',
      billingCycle: 'annual',
      defaultPrice: 120,
      startedAt: '2026-03-10T12:00:00.000Z',
      nextBillingDate: '2027-03-10T12:00:00.000Z',
    });
    const payload = buildWidgetPayload([makeSub(), annual], 'EUR', 'en-US', noConvert, now);
    expect(payload.monthTotal).toBe('€10.00');
  });

  test('lists the three soonest charges, soonest first', () => {
    const subs = [
      makeSub({ id: 'c-1', name: 'Later', nextBillingDate: '2026-09-28T12:00:00.000Z' }),
      makeSub({ id: 'a-1', name: 'Soonest', nextBillingDate: '2026-09-06T12:00:00.000Z' }),
      makeSub({ id: 'b-1', name: 'Middle', nextBillingDate: '2026-09-12T12:00:00.000Z' }),
      makeSub({ id: 'd-1', name: 'Last', nextBillingDate: '2026-09-30T12:00:00.000Z' }),
    ];
    const payload = buildWidgetPayload(subs, 'EUR', 'en-US', noConvert, now);
    expect(payload.upcoming.map((u) => u.name)).toEqual(['Soonest', 'Middle', 'Later']);
  });

  test('leaves cancelled subscriptions out of the upcoming list', () => {
    const payload = buildWidgetPayload(
      [makeSub({ isCancelled: true, cancelEffectiveMonth: '2026-08-01T12:00:00.000Z' })],
      'EUR',
      'en-US',
      noConvert,
      now,
    );
    expect(payload.upcoming).toEqual([]);
  });

  test('pre-formats every money value, since the widget process cannot format currency itself', () => {
    const payload = buildWidgetPayload([makeSub()], 'JPY', 'en-US', noConvert, now);
    expect(payload.monthTotal).toBe('¥10');
    expect(payload.upcoming[0].amount).toBe('¥10');
  });

  test('carries the badge colour and initials the widget draws with', () => {
    const payload = buildWidgetPayload([makeSub()], 'EUR', 'en-US', noConvert, now);
    expect(payload.upcoming[0]).toMatchObject({ initials: 'NF', color: '#FF3B30' });
  });
});
