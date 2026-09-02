import { strings } from '../../i18n/strings';
import { Subscription } from '../../types/subscription';
import {
  buildReminderCandidates,
  MAX_TOTAL_NOTIFICATIONS,
  parseReminderPayload,
  selectReminders,
} from '../reminderSchedule';

const t = strings.en;
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

const kindsFor = (sub: Subscription, days: 0 | 1 | 3 | 7 = 3) =>
  buildReminderCandidates([sub], days, t, 'en-US', 'EUR', noConvert).map((c) => c.data.kind);

describe('buildReminderCandidates', () => {
  test('schedules both a days-before reminder and one on the billing day itself', () => {
    const kinds = kindsFor(makeSub());
    expect(kinds).toContain('before');
    expect(kinds).toContain('dayOf');
  });

  test('pre-schedules many cycles ahead so reminders survive the app never being reopened', () => {
    const dayOf = buildReminderCandidates([makeSub()], 3, t, 'en-US', 'EUR', noConvert).filter(
      (c) => c.data.kind === 'dayOf',
    );
    expect(dayOf.length).toBeGreaterThanOrEqual(12);
    // Distinct occurrences, not the same date twelve times.
    expect(new Set(dayOf.map((c) => c.date.getTime())).size).toBe(dayOf.length);
  });

  test('fires the days-before reminder exactly that many days ahead, at 9am local', () => {
    const before = buildReminderCandidates([makeSub()], 7, t, 'en-US', 'EUR', noConvert).find(
      (c) => c.data.kind === 'before',
    )!;
    const billing = new Date('2026-09-15T12:00:00.000Z');
    const expected = new Date(billing);
    expected.setDate(expected.getDate() - 7);
    expected.setHours(9, 0, 0, 0);
    expect(before.date.getTime()).toBe(expected.getTime());
  });

  test('adds trial-warning, last-day and next-day follow-up reminders for a free trial', () => {
    const kinds = kindsFor(makeSub({ trialEndsAt: '2026-09-10T12:00:00.000Z' }));
    expect(kinds).toContain('trialBefore');
    expect(kinds).toContain('trialEnd');
    expect(kinds).toContain('trialFollowUp');
  });

  test('puts the trial follow-up the day after the trial ends', () => {
    const trialEnd = new Date('2026-09-10T12:00:00.000Z');
    const followUp = buildReminderCandidates(
      [makeSub({ trialEndsAt: trialEnd.toISOString() })],
      3,
      t,
      'en-US',
      'EUR',
      noConvert,
    ).find((c) => c.data.kind === 'trialFollowUp')!;
    const expected = new Date(trialEnd);
    expected.setDate(expected.getDate() + 1);
    expected.setHours(10, 0, 0, 0);
    expect(followUp.date.getTime()).toBe(expected.getTime());
  });

  test("treats the 'off' reminder setting as no notifications at all", () => {
    // reminderDays === 0 means off entirely — not merely "no advance warning".
    expect(kindsFor(makeSub(), 0)).toEqual([]);
  });

  test('skips billing occurrences that fall inside the free trial', () => {
    // Trial runs past the first two monthly occurrences.
    const candidates = buildReminderCandidates(
      [makeSub({ trialEndsAt: '2026-11-20T12:00:00.000Z' })],
      3,
      t,
      'en-US',
      'EUR',
      noConvert,
    );
    const dayOfDates = candidates.filter((c) => c.data.kind === 'dayOf').map((c) => c.date);
    expect(dayOfDates.every((d) => d.getTime() >= new Date('2026-11-20T12:00:00.000Z').getTime())).toBe(true);
  });

  test('ignores cancelled subscriptions', () => {
    expect(kindsFor(makeSub({ isCancelled: true }))).toEqual([]);
  });

  test('renders the price into the notification body', () => {
    const dayOf = buildReminderCandidates([makeSub()], 3, t, 'en-US', 'EUR', noConvert).find(
      (c) => c.data.kind === 'dayOf',
    )!;
    expect(dayOf.body).toContain('€10.00');
    expect(dayOf.title).toContain('Netflix');
  });
});

describe('selectReminders', () => {
  const now = new Date('2026-09-01T12:00:00.000Z').getTime();

  const candidate = (key: string, offsetMs: number) => ({
    key,
    date: new Date(now + offsetMs),
    title: key,
    body: key,
    data: { kind: 'dayOf' as const, subscriptionId: key },
  });

  test('spends the notification budget on the soonest reminders across all subscriptions', () => {
    // Far-future entries first, so a naive implementation that keeps input order would fail.
    const candidates = [
      ...Array.from({ length: MAX_TOTAL_NOTIFICATIONS }, (_, i) =>
        candidate(`far-${i}`, (i + 100) * 86400000),
      ),
      candidate('soon', 86400000),
    ];
    const { scheduled } = selectReminders(candidates, new Set(), now);
    expect(scheduled).toHaveLength(MAX_TOTAL_NOTIFICATIONS);
    expect(scheduled[0].key).toBe('soon');
  });

  test('fires a slot missed earlier today instead of dropping it', () => {
    const { scheduled, catchUpKeys } = selectReminders(
      [candidate('missed', -3 * 3600000)],
      new Set(),
      now,
    );
    expect(scheduled.map((c) => c.key)).toEqual(['missed']);
    expect(catchUpKeys).toEqual(['missed']);
  });

  test('does not re-fire a catch-up already recorded in the ledger', () => {
    const { scheduled, catchUpKeys } = selectReminders(
      [candidate('missed', -3 * 3600000)],
      new Set(['missed']),
      now,
    );
    expect(scheduled).toEqual([]);
    expect(catchUpKeys).toEqual([]);
  });

  test('drops slots missed by more than a day rather than firing stale reminders', () => {
    const { scheduled } = selectReminders([candidate('ancient', -5 * 86400000)], new Set(), now);
    expect(scheduled).toEqual([]);
  });

  test('puts overdue catch-ups ahead of future reminders', () => {
    const { scheduled } = selectReminders(
      [candidate('future', 86400000), candidate('missed', -3600000)],
      new Set(),
      now,
    );
    expect(scheduled.map((c) => c.key)).toEqual(['missed', 'future']);
  });
});

describe('parseReminderPayload', () => {
  test('accepts a well-formed payload', () => {
    expect(parseReminderPayload({ kind: 'trialFollowUp', subscriptionId: 'a-1' })).toEqual({
      kind: 'trialFollowUp',
      subscriptionId: 'a-1',
    });
  });

  test('rejects anything that is not one of ours', () => {
    expect(parseReminderPayload(null)).toBeNull();
    expect(parseReminderPayload('nope')).toBeNull();
    expect(parseReminderPayload({})).toBeNull();
    expect(parseReminderPayload({ kind: 'made-up', subscriptionId: 'a-1' })).toBeNull();
    expect(parseReminderPayload({ kind: 'dayOf' })).toBeNull();
  });
});
