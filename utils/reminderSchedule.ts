import { Strings } from '@/i18n/strings';
import { Subscription } from '@/types/subscription';
import { CurrencyCode, formatMoney } from '@/utils/currency';
import { computeNextBillingFromStart, ConvertFn } from '@/utils/subscription';

/**
 * Deciding *what* to remind someone about, kept free of expo-notifications so it can be
 * reasoned about (and tested) on its own. utils/notifications.ts owns the OS side: permissions,
 * the Android channel, persistence of the catch-up ledger, and actually scheduling these.
 */

/** What a scheduled reminder is about. Rides along in the notification's `data` so tapping one can route. */
export type ReminderKind = 'before' | 'dayOf' | 'trialBefore' | 'trialEnd' | 'trialFollowUp';

export type ReminderPayload = {
  kind: ReminderKind;
  subscriptionId: string;
};

export type ReminderCandidate = {
  /** Stable per (subscription, kind, calendar day) — the unit the catch-up ledger dedupes on. */
  key: string;
  date: Date;
  title: string;
  body: string;
  data: ReminderPayload;
};

/** Reminders and billing-day alerts land mid-morning; the trial follow-up an hour later so it reads as its own beat. */
export const REMINDER_HOUR = 9;
export const TRIAL_FOLLOW_UP_HOUR = 10;

/**
 * How many future billing occurrences to build per subscription. Local notifications are
 * one-shot date triggers that the OS fires whether or not the app is ever reopened, so the only
 * thing limiting how long reminders keep arriving is how far ahead they're scheduled. A year of
 * monthly cycles comfortably outlives any realistic gap between app opens.
 */
export const MAX_OCCURRENCES_PER_SUB = 12;

/** iOS silently drops pending local notifications past 64; stay under that across all subscriptions. */
export const MAX_TOTAL_NOTIFICATIONS = 58;

/** A slot missed by less than this still fires (shortly) rather than being dropped for the cycle. */
export const CATCH_UP_WINDOW_MS = 24 * 60 * 60 * 1000;

function atHour(d: Date, hour: number): Date {
  const x = new Date(d);
  x.setHours(hour, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function candidatesForSubscription(
  sub: Subscription,
  reminderDays: 0 | 1 | 3 | 7,
  t: Strings,
  locale: string,
  displayCurrency: CurrencyCode,
  convert: ConvertFn,
): ReminderCandidate[] {
  const out: ReminderCandidate[] = [];
  const price = formatMoney(convert(sub.defaultPrice, sub.currency), displayCurrency);
  const trialEndsAt = sub.trialEndsAt ? new Date(sub.trialEndsAt) : null;
  const anchor = new Date(sub.startedAt ?? sub.nextBillingDate);

  const push = (kind: ReminderKind, date: Date, title: string, body: string) => {
    out.push({
      key: `${sub.id}|${kind}|${dayKey(date)}`,
      date,
      title,
      body,
      data: { kind, subscriptionId: sub.id },
    });
  };

  let occurrence = new Date(sub.nextBillingDate);
  for (let i = 0; i < MAX_OCCURRENCES_PER_SUB; i++) {
    // Occurrences inside the free trial are never charged; the trial notifications below cover
    // that transition instead.
    const inTrial = trialEndsAt !== null && occurrence.getTime() < trialEndsAt.getTime();
    if (!inTrial) {
      if (reminderDays > 0) {
        push(
          'before',
          atHour(addDays(occurrence, -reminderDays), REMINDER_HOUR),
          t.reminderNotificationTitle.replace('{name}', sub.name).replace('{days}', String(reminderDays)),
          t.reminderNotificationBody.replace('{price}', price),
        );
      }
      // The charge lands today — sent regardless of the days-before setting.
      push(
        'dayOf',
        atHour(occurrence, REMINDER_HOUR),
        t.billingTodayNotificationTitle.replace('{name}', sub.name),
        t.billingTodayNotificationBody.replace('{price}', price),
      );
    }
    occurrence = computeNextBillingFromStart(
      anchor,
      sub.billingCycle,
      new Date(occurrence.getTime() + 86400000),
    );
  }

  if (trialEndsAt) {
    const trialDate = trialEndsAt.toLocaleDateString(locale);
    if (reminderDays > 0) {
      push(
        'trialBefore',
        atHour(addDays(trialEndsAt, -reminderDays), REMINDER_HOUR),
        t.trialEndingNotificationTitle.replace('{name}', sub.name).replace('{date}', trialDate),
        t.trialEndingNotificationBody.replace('{price}', price),
      );
    }
    // The trial is over today — last chance to cancel before the first real charge.
    push(
      'trialEnd',
      atHour(trialEndsAt, REMINDER_HOUR),
      t.trialEndsTodayNotificationTitle.replace('{name}', sub.name),
      t.trialEndsTodayNotificationBody.replace('{price}', price),
    );
    // The day after: ask whether they actually cancelled. Tapping this opens the in-app prompt
    // (components/TrialFollowUpModal.tsx) via the `trialFollowUp` payload.
    push(
      'trialFollowUp',
      atHour(addDays(trialEndsAt, 1), TRIAL_FOLLOW_UP_HOUR),
      t.trialFollowUpNotificationTitle.replace('{name}', sub.name),
      t.trialFollowUpNotificationBody.replace('{name}', sub.name),
    );
  }

  return out;
}

/** Every reminder worth sending across all active subscriptions, in no particular order. */
export function buildReminderCandidates(
  subscriptions: Subscription[],
  reminderDays: 0 | 1 | 3 | 7,
  t: Strings,
  locale: string,
  displayCurrency: CurrencyCode,
  convert: ConvertFn,
): ReminderCandidate[] {
  if (reminderDays === 0) return [];
  return subscriptions
    .filter((s) => !s.isCancelled)
    .flatMap((s) => candidatesForSubscription(s, reminderDays, t, locale, displayCurrency, convert));
}

export type ReminderSelection = {
  /** In the order they should be handed to the OS. `catchUpKeys` members fire immediately. */
  scheduled: ReminderCandidate[];
  /** Overdue slots being fired now, to be added to the persisted ledger so they don't repeat. */
  catchUpKeys: string[];
};

/**
 * Picks the reminders to actually schedule. Candidates from every subscription are pooled and
 * sorted by fire date before the cap is applied, so the notification budget goes to whatever
 * happens next rather than being exhausted by whichever subscription came first in the list.
 *
 * `firedCatchUpKeys` is the persisted record of overdue slots already fired once. Without it,
 * every rebuild — and a rebuild happens each time any subscription is touched — would re-fire
 * every slot missed today.
 */
export function selectReminders(
  candidates: ReminderCandidate[],
  firedCatchUpKeys: ReadonlySet<string>,
  now: number = Date.now(),
): ReminderSelection {
  const dueLater: ReminderCandidate[] = [];
  const catchUp: ReminderCandidate[] = [];

  for (const c of candidates) {
    const delta = c.date.getTime() - now;
    if (delta > 0) {
      dueLater.push(c);
    } else if (-delta <= CATCH_UP_WINDOW_MS && !firedCatchUpKeys.has(c.key)) {
      // The slot passed a few hours ago but what it's about is still relevant — fire it shortly
      // rather than dropping it silently for this cycle.
      catchUp.push(c);
    }
  }

  // Catch-ups first (already overdue), then everything else soonest-first.
  const scheduled = [
    ...catchUp.sort((a, b) => a.date.getTime() - b.date.getTime()),
    ...dueLater.sort((a, b) => a.date.getTime() - b.date.getTime()),
  ].slice(0, MAX_TOTAL_NOTIFICATIONS);

  return {
    scheduled,
    catchUpKeys: scheduled.filter((c) => c.date.getTime() <= now).map((c) => c.key),
  };
}

/** Narrows an arbitrary notification `data` bag to a reminder payload, or null if it isn't one. */
export function parseReminderPayload(data: unknown): ReminderPayload | null {
  if (typeof data !== 'object' || data === null) return null;
  const { kind, subscriptionId } = data as Partial<ReminderPayload>;
  if (typeof subscriptionId !== 'string') return null;
  const kinds: ReminderKind[] = ['before', 'dayOf', 'trialBefore', 'trialEnd', 'trialFollowUp'];
  if (!kind || !kinds.includes(kind)) return null;
  return { kind, subscriptionId };
}
