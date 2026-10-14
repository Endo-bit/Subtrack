import { Strings } from '@/i18n/strings';
import { Subscription } from '@/types/subscription';
import { CurrencyCode, formatMoney } from '@/utils/currency';
import {
  chargeAmountInMonth,
  chargesInMonth,
  computeNextBillingFromStart,
  ConvertFn,
} from '@/utils/subscription';

/**
 * Deciding *what* to remind someone about, kept free of expo-notifications so it can be
 * reasoned about (and tested) on its own. utils/notifications.ts owns the OS side: permissions,
 * the Android channel, persistence of the catch-up ledger, and actually scheduling these.
 */

/** What a scheduled reminder is about. Rides along in the notification's `data` so tapping one can route. */
export type ReminderKind =
  | 'before'
  | 'dayOf'
  | 'trialBefore'
  | 'trialEnd'
  | 'trialFollowUp'
  | 'monthlyDigest';

const REMINDER_KINDS: ReminderKind[] = [
  'before',
  'dayOf',
  'trialBefore',
  'trialEnd',
  'trialFollowUp',
  'monthlyDigest',
];

export type ReminderPayload = {
  kind: ReminderKind;
  /** Empty for the monthly digest, which is about every subscription rather than one. */
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
/** The monthly digest lands on the 1st, after the morning's billing reminders. */
export const MONTHLY_DIGEST_HOUR = 11;

/**
 * How many upcoming month-starts get a digest queued. Few on purpose: they're rebuilt on every
 * open and by the background refresh, and each one spends a slot of the 64-notification budget.
 */
export const MONTHLY_DIGEST_MONTHS = 3;

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

/**
 * When the budget can't hold everything, billing-day alerts only compete for slots inside this
 * window. Beyond it the budget goes to the days-before reminder the user actually configured
 * (and trial warnings), which stretches how far ahead those keep arriving with the app closed.
 */
export const DAY_OF_PRIORITY_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

/** How long after the last scheduled reminder the "open SubTrack to keep them coming" notice fires. */
export const REFILL_NOTICE_DELAY_MS = 60 * 60 * 1000;

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

/**
 * The 1st-of-the-month summary: what this month's subscriptions add up to and how many renew.
 * Billing reminders only bring someone back when a charge is due; this is the one regular
 * reason to open the app, and the moment people actually prune what they no longer use.
 * Months with nothing to bill are skipped rather than announcing a zero.
 */
export function buildMonthlyDigestCandidates(
  subscriptions: Subscription[],
  reminderDays: 0 | 1 | 3 | 7,
  t: Strings,
  locale: string,
  displayCurrency: CurrencyCode,
  convert: ConvertFn,
  now: number = Date.now(),
): ReminderCandidate[] {
  // "Reminders off" means off: the digest rides on the same switch as every other notification.
  if (reminderDays === 0) return [];
  const out: ReminderCandidate[] = [];
  const today = new Date(now);
  for (let i = 1; i <= MONTHLY_DIGEST_MONTHS; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() + i, 1, MONTHLY_DIGEST_HOUR, 0, 0, 0);
    const year = date.getFullYear();
    const month = date.getMonth();
    const renewals = subscriptions.filter((s) => chargesInMonth(s, year, month)).length;
    const total = subscriptions.reduce((sum, s) => sum + chargeAmountInMonth(s, year, month, convert), 0);
    if (renewals === 0 || total <= 0) continue;
    // French and Spanish month names are lowercase, but this one opens the title.
    const monthName = date.toLocaleDateString(locale, { month: 'long' });
    out.push({
      key: `digest|monthlyDigest|${dayKey(date)}`,
      date,
      title: t.digestNotificationTitle
        .replace('{month}', monthName.charAt(0).toLocaleUpperCase(locale) + monthName.slice(1))
        .replace('{total}', formatMoney(total, displayCurrency)),
      body: t.digestNotificationBody.replace('{n}', String(renewals)),
      data: { kind: 'monthlyDigest', subscriptionId: '' },
    });
  }
  return out;
}

export type ReminderSelection = {
  /** In the order they should be handed to the OS. `catchUpKeys` members fire immediately. */
  scheduled: ReminderCandidate[];
  /** Overdue slots being fired now, to be added to the persisted ledger so they don't repeat. */
  catchUpKeys: string[];
  /**
   * Set when reminders had to be left out for lack of budget: the moment the queue runs dry.
   * A notice scheduled then asks the user to open the app, so a full queue never ends in
   * silence. Null when everything fit.
   */
  refillNoticeAt: Date | null;
};

/**
 * Picks the reminders to actually schedule. Candidates from every subscription are pooled and
 * sorted by fire date before the cap is applied, so the notification budget goes to whatever
 * happens next rather than being exhausted by whichever subscription came first in the list.
 * When they don't all fit, billing-day alerts past DAY_OF_PRIORITY_WINDOW_MS give way to the
 * days-before reminders, and one slot is kept back for the refill notice.
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
  let dueLater: ReminderCandidate[] = [];
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

  const byDate = (a: ReminderCandidate, b: ReminderCandidate) => a.date.getTime() - b.date.getTime();
  catchUp.sort(byDate);
  dueLater.sort(byDate);

  const overBudget = catchUp.length + dueLater.length > MAX_TOTAL_NOTIFICATIONS;
  if (overBudget) {
    dueLater = dueLater.filter(
      (c) => c.data.kind !== 'dayOf' || c.date.getTime() - now <= DAY_OF_PRIORITY_WINDOW_MS,
    );
  }
  // Catch-ups first (already overdue), then everything else soonest-first.
  // Over budget, something is always left out, so one slot goes to the refill notice.
  const scheduled = [...catchUp, ...dueLater].slice(
    0,
    overBudget ? MAX_TOTAL_NOTIFICATIONS - 1 : MAX_TOTAL_NOTIFICATIONS,
  );
  const last = scheduled[scheduled.length - 1];

  return {
    scheduled,
    catchUpKeys: scheduled.filter((c) => c.date.getTime() <= now).map((c) => c.key),
    refillNoticeAt:
      overBudget && last ? new Date(Math.max(last.date.getTime(), now) + REFILL_NOTICE_DELAY_MS) : null,
  };
}

/** Narrows an arbitrary notification `data` bag to a reminder payload, or null if it isn't one. */
export function parseReminderPayload(data: unknown): ReminderPayload | null {
  if (typeof data !== 'object' || data === null) return null;
  const { kind, subscriptionId } = data as Partial<ReminderPayload>;
  if (typeof subscriptionId !== 'string') return null;
  if (!kind || !REMINDER_KINDS.includes(kind)) return null;
  return { kind, subscriptionId };
}
