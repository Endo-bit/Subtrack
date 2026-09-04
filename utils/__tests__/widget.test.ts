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
    const payload = buildWidgetPayload([makeSub(), annual], 'EUR', 'en-US', noConvert, 'Monthly', 'Trial', now);
    // 10 monthly + 120/12 annual, exactly as context's monthlyTotal computes it.
    expect(payload.monthTotal).toBe('€20.00');
  });

  test('carries the dashboard label rather than a month name', () => {
    const payload = buildWidgetPayload([makeSub()], 'EUR', 'en-US', noConvert, 'Monatlich', 'Test', now);
    expect(payload.totalLabel).toBe('Monatlich');
  });

  test('passes each service logo through so the widget can draw the real icon', () => {
    const withLogo = makeSub({ logo: 'https://example.com/icon.png' });
    const payload = buildWidgetPayload([withLogo], 'EUR', 'en-US', noConvert, 'Monthly', 'Trial', now);
    expect(payload.upcoming[0].logo).toBe('https://example.com/icon.png');
    // Absent logos stay undefined so the widget knows to fall back to the initials chip.
    const noLogo = buildWidgetPayload([makeSub()], 'EUR', 'en-US', noConvert, 'Monthly', 'Trial', now);
    expect(noLogo.upcoming[0].logo).toBeUndefined();
  });

  test('lists the three soonest charges, soonest first', () => {
    const subs = [
      makeSub({ id: 'c-1', name: 'Later', nextBillingDate: '2026-09-28T12:00:00.000Z' }),
      makeSub({ id: 'a-1', name: 'Soonest', nextBillingDate: '2026-09-06T12:00:00.000Z' }),
      makeSub({ id: 'b-1', name: 'Middle', nextBillingDate: '2026-09-12T12:00:00.000Z' }),
      makeSub({ id: 'd-1', name: 'Last', nextBillingDate: '2026-09-30T12:00:00.000Z' }),
    ];
    const payload = buildWidgetPayload(subs, 'EUR', 'en-US', noConvert, 'Monthly', 'Trial', now);
    expect(payload.upcoming.map((u) => u.name)).toEqual(['Soonest', 'Middle', 'Later']);
  });

  test('leaves cancelled subscriptions out of the upcoming list', () => {
    const payload = buildWidgetPayload(
      [makeSub({ isCancelled: true, cancelEffectiveMonth: '2026-08-01T12:00:00.000Z' })],
      'EUR',
      'en-US',
      noConvert,
      'Monthly',
      'Trial',
      now,
    );
    expect(payload.upcoming).toEqual([]);
  });

  test('shows the trial badge and the trial end date instead of a real charge while in trial', () => {
    // now = 2026-09-05; a monthly cycle anchored on startedAt would land a "next billing" date
    // inside the trial, which is not when anything actually gets charged.
    const trialSub = makeSub({
      startedAt: '2026-09-01T12:00:00.000Z',
      nextBillingDate: '2026-10-01T12:00:00.000Z',
      trialEndsAt: '2026-12-07T12:00:00.000Z',
    });
    const payload = buildWidgetPayload([trialSub], 'EUR', 'en-US', noConvert, 'Monthly', 'Trial', now);
    expect(payload.upcoming[0].amount).toBe('Trial');
    expect(payload.upcoming[0].dateLabel).toBe('Dec 7');
  });

  test('sorts a trial subscription by its trial end date, not its in-trial billing date', () => {
    const trialSub = makeSub({
      id: 'trial-1',
      name: 'InTrial',
      startedAt: '2026-09-01T12:00:00.000Z',
      nextBillingDate: '2026-09-10T12:00:00.000Z', // earlier than "Middle" below, but inside the trial
      trialEndsAt: '2026-12-07T12:00:00.000Z',
    });
    const middle = makeSub({ id: 'b-1', name: 'Middle', nextBillingDate: '2026-09-12T12:00:00.000Z' });
    const payload = buildWidgetPayload([trialSub, middle], 'EUR', 'en-US', noConvert, 'Monthly', 'Trial', now);
    expect(payload.upcoming.map((u) => u.name)).toEqual(['Middle', 'InTrial']);
  });

  test('judges trial status against the injected `now`, not the real system clock', () => {
    // Fixed reference time after this fixture's trial has already ended — the payload must
    // read as "trial over" here even though the trial end date is in the future relative to
    // whatever the real wall clock says when this test happens to run.
    const later = new Date(2027, 0, 1, 12);
    const trialSub = makeSub({ trialEndsAt: '2026-12-07T12:00:00.000Z' });
    const payload = buildWidgetPayload([trialSub], 'EUR', 'en-US', noConvert, 'Monthly', 'Trial', later);
    expect(payload.upcoming[0].amount).toBe('€10.00');
  });

  test('pre-formats every money value, since the widget process cannot format currency itself', () => {
    const payload = buildWidgetPayload([makeSub()], 'JPY', 'en-US', noConvert, 'Monthly', 'Trial', now);
    expect(payload.monthTotal).toBe('¥10');
    expect(payload.upcoming[0].amount).toBe('¥10');
  });

  test('carries the badge colour and initials the widget draws with', () => {
    const payload = buildWidgetPayload([makeSub()], 'EUR', 'en-US', noConvert, 'Monthly', 'Trial', now);
    expect(payload.upcoming[0]).toMatchObject({ initials: 'NF', color: '#FF3B30' });
  });
});
