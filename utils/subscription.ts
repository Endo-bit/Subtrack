import { BillingCycle, Subscription } from '@/types/subscription';
import { CurrencyCode } from '@/utils/currency';

/** Converts a native amount (in `fromCurrency`, or the app's display currency if unset) to the display currency. No-op when omitted. */
export type ConvertFn = (amount: number, fromCurrency?: CurrencyCode) => number;

/**
 * True while `trialEndsAt` is set and in the future — billing is treated as €0 until then.
 * Accepts `now` so callers that already have a reference time (a fixed `now` passed through a
 * render or a test) get a deterministic answer instead of a fresh real-clock read.
 */
export function isInTrial(s: Subscription, now: Date = new Date()): boolean {
  return !!s.trialEndsAt && new Date(s.trialEndsAt).getTime() > now.getTime();
}

/**
 * The next date actually worth showing the user. `nextBillingDate` is anchored to the billing
 * cycle from `startedAt` regardless of any trial, so for a trial longer than one cycle it can
 * land well inside the trial — a date nothing will be charged on, and often much sooner than
 * the trial itself ends. While in trial, the trial's end is the next thing that matters.
 */
export function nextRelevantDate(s: Subscription, now: Date = new Date()): Date {
  return isInTrial(s, now) ? new Date(s.trialEndsAt!) : new Date(s.nextBillingDate);
}

export const monthly = (s: Subscription, convert?: ConvertFn) => {
  if (isInTrial(s)) return 0;
  const raw =
    s.billingCycle === 'annual'
      ? s.defaultPrice / 12
      : s.billingCycle === 'quarterly'
        ? s.defaultPrice / 3
        : s.defaultPrice;
  return convert ? convert(raw, s.currency) : raw;
};

export const yearly = (s: Subscription, convert?: ConvertFn) => monthly(s, convert) * 12;

/** Cost per day based on billing cycle. */
export const dailyCost = (s: Subscription, convert?: ConvertFn): number => {
  if (isInTrial(s)) return 0;
  const raw =
    s.billingCycle === 'annual' ? s.defaultPrice / 365 : s.billingCycle === 'quarterly' ? s.defaultPrice / 91 : s.defaultPrice / 30;
  return convert ? convert(raw, s.currency) : raw;
};

/**
 * Whole calendar days from `from` to `to`, ignoring the time of day. Subtracting raw timestamps
 * instead makes a charge dated today read as a fraction of a day in the past by mid-morning,
 * which is how today's charges used to fall out of the dashboard's due-soon window entirely.
 */
export function calendarDaysUntil(from: Date, to: Date): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

const monthIndex = (year: number, month: number) => year * 12 + month;

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x;
}

/** Effective contract start. */
export function subscriptionStartedAt(sub: Subscription): Date {
  const raw = sub.startedAt ?? sub.nextBillingDate;
  return startOfDay(new Date(raw));
}

/** Billing anchor day/month derived from contract start. */
export function billingAnchorDate(sub: Subscription): Date {
  return subscriptionStartedAt(sub);
}

/** Next billing on or after `reference` from contract start + cycle. */
export function computeNextBillingFromStart(
  startedAt: Date,
  cycle: BillingCycle,
  reference: Date = new Date(),
): Date {
  const start = startOfDay(startedAt);
  const ref = startOfDay(reference);
  const billDay = start.getDate();
  const cycleMonths = cycle === 'annual' ? 12 : cycle === 'quarterly' ? 3 : 1;

  const dateAtOffset = (monthOffset: number): Date => {
    const totalMonths = start.getMonth() + monthOffset;
    const y = start.getFullYear() + Math.floor(totalMonths / 12);
    const m = ((totalMonths % 12) + 12) % 12;
    const last = new Date(y, m + 1, 0).getDate();
    return startOfDay(new Date(y, m, Math.min(billDay, last)));
  };

  if (ref <= start) return start;

  let offset = 0;
  while (offset <= 600) {
    const d = dateAtOffset(offset);
    if (d >= ref) return d;
    offset += cycleMonths;
  }
  return ref;
}

export function normalizeSubscription(sub: Subscription): Subscription {
  const startedAt = sub.startedAt ?? sub.nextBillingDate ?? new Date().toISOString();
  const anchor = new Date(startedAt);
  const nextBillingDate = computeNextBillingFromStart(
    anchor,
    sub.billingCycle,
  ).toISOString();
  const defaultPlan = sub.plans?.[0];
  return {
    ...sub,
    startedAt,
    nextBillingDate,
    plans: sub.plans?.length ? sub.plans : defaultPlan ? [defaultPlan] : [],
    planName: sub.planName ?? defaultPlan?.name,
    planChangedAt: sub.planChangedAt ?? startedAt,
  };
}

export function isMonthOnOrAfterStart(sub: Subscription, year: number, month: number): boolean {
  const start = subscriptionStartedAt(sub);
  if (Number.isNaN(start.getTime())) return false;
  return monthIndex(year, month) >= monthIndex(start.getFullYear(), start.getMonth());
}

export function isDateOnOrAfterStart(
  sub: Subscription,
  year: number,
  month: number,
  day: number,
): boolean {
  const start = subscriptionStartedAt(sub);
  if (Number.isNaN(start.getTime())) return false;
  const target = new Date(year, month, day);
  const startLocal = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  return target >= startLocal;
}

/**
 * First billing month with no charge, decided at cancel time from `nextBillingDate`:
 * if this month's charge already went out (next occurrence rolled to a later month),
 * the cutoff is next month; otherwise it's this month (nothing pending gets charged).
 */
export function computeCancelEffectiveMonth(sub: Subscription, now: Date = new Date()): string {
  const next = new Date(sub.nextBillingDate);
  const alreadyBilledThisMonth =
    next.getFullYear() !== now.getFullYear() || next.getMonth() !== now.getMonth();
  const cutoffMonth = now.getMonth() + (alreadyBilledThisMonth ? 1 : 0);
  return startOfDay(new Date(now.getFullYear(), cutoffMonth, 1)).toISOString();
}

export function chargesInMonth(sub: Subscription, year: number, month: number): boolean {
  if (!isMonthOnOrAfterStart(sub, year, month)) return false;

  if (sub.isCancelled) {
    const cutoff = sub.cancelEffectiveMonth
      ? new Date(sub.cancelEffectiveMonth)
      : subscriptionStartedAt(sub);
    if (Number.isNaN(cutoff.getTime())) return false;
    if (monthIndex(year, month) >= monthIndex(cutoff.getFullYear(), cutoff.getMonth())) return false;
  }

  const anchor = billingAnchorDate(sub);
  if (Number.isNaN(anchor.getTime())) return false;

  const billMonth = anchor.getMonth();
  const billYear = anchor.getFullYear();
  const monthsSince = (year - billYear) * 12 + (month - billMonth);
  const mod = (n: number, m: number) => ((n % m) + m) % m;

  switch (sub.billingCycle) {
    case 'monthly':
      return monthsSince >= 0;
    case 'quarterly':
      return monthsSince >= 0 && mod(monthsSince, 3) === 0;
    case 'annual':
      return monthsSince >= 0 && mod(monthsSince, 12) === 0;
    default:
      return false;
  }
}

export function chargeAmountInMonth(
  sub: Subscription,
  year: number,
  month: number,
  convert?: ConvertFn,
): number {
  if (!chargesInMonth(sub, year, month)) return 0;
  if (sub.trialEndsAt) {
    const billDay = billingDayInMonth(sub, year, month);
    if (billDay !== null) {
      const occurs = new Date(year, month, billDay);
      if (occurs.getTime() < new Date(sub.trialEndsAt).getTime()) return 0;
    }
  }
  return convert ? convert(sub.defaultPrice, sub.currency) : sub.defaultPrice;
}

export type MonthTrendRow = {
  label: string;
  total: number;
  year: number;
  month: number;
};

export type MonthBreakdownItem = {
  subscription: Subscription;
  amount: number;
};

export function billingDayInMonth(sub: Subscription, year: number, month: number): number | null {
  if (!chargesInMonth(sub, year, month)) return null;
  const anchor = billingAnchorDate(sub);
  if (Number.isNaN(anchor.getTime())) return null;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const day = Math.min(anchor.getDate(), lastDay);
  if (!isDateOnOrAfterStart(sub, year, month, day)) return null;
  return day;
}

export function subsOnBillingDay(
  subs: Subscription[],
  year: number,
  month: number,
  day: number,
): Subscription[] {
  return subs.filter((s) => billingDayInMonth(s, year, month) === day);
}

export function spendingBreakdownForMonth(
  subs: Subscription[],
  year: number,
  month: number,
  convert?: ConvertFn,
): MonthBreakdownItem[] {
  // No isCancelled filter here — chargesInMonth() already zeroes out months at/after
  // a subscription's cancellation cutoff, so past months stay accurate after cancelling.
  return subs
    .map((subscription) => ({
      subscription,
      amount: chargeAmountInMonth(subscription, year, month, convert),
    }))
    .filter((row) => row.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

export function spendingTrendMonths(
  subs: Subscription[],
  monthCount = 6,
  locale?: string,
  convert?: ConvertFn,
): MonthTrendRow[] {
  const now = new Date();
  const rows: MonthTrendRow[] = [];

  for (let i = monthCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const total = subs.reduce((sum, s) => sum + chargeAmountInMonth(s, year, month, convert), 0);
    rows.push({
      label: d.toLocaleString(locale, { month: 'short' }),
      total,
      year,
      month,
    });
  }
  return rows;
}

/** Jan–Dec spending for a specific calendar year, for browsing past years. */
export function spendingTrendForYear(
  subs: Subscription[],
  year: number,
  locale?: string,
  convert?: ConvertFn,
): MonthTrendRow[] {
  const rows: MonthTrendRow[] = [];
  for (let month = 0; month < 12; month++) {
    const total = subs.reduce((sum, s) => sum + chargeAmountInMonth(s, year, month, convert), 0);
    rows.push({
      label: new Date(year, month, 1).toLocaleString(locale, { month: 'short' }),
      total,
      year,
      month,
    });
  }
  return rows;
}
