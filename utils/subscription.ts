import { BillingCycle, Subscription } from '@/types/subscription';

export const monthly = (s: Subscription) =>
  s.billingCycle === 'annual'
    ? s.defaultPrice / 12
    : s.billingCycle === 'quarterly'
      ? s.defaultPrice / 3
      : s.defaultPrice;

export const yearly = (s: Subscription) => monthly(s) * 12;

/** Cost per day based on billing cycle. */
export const dailyCost = (s: Subscription): number => {
  if (s.billingCycle === 'annual') return s.defaultPrice / 365;
  if (s.billingCycle === 'quarterly') return s.defaultPrice / 91;
  return s.defaultPrice / 30;
};

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

export function chargesInMonth(sub: Subscription, year: number, month: number): boolean {
  if (!isMonthOnOrAfterStart(sub, year, month)) return false;

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

export function chargeAmountInMonth(sub: Subscription, year: number, month: number): number {
  if (!chargesInMonth(sub, year, month)) return 0;
  return sub.defaultPrice;
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
  if (sub.isCancelled || !chargesInMonth(sub, year, month)) return null;
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
  return subs.filter((s) => {
    if (s.isCancelled) return false;
    const billDay = billingDayInMonth(s, year, month);
    return billDay === day;
  });
}

export function spendingBreakdownForMonth(
  subs: Subscription[],
  year: number,
  month: number,
): MonthBreakdownItem[] {
  const active = subs.filter((s) => !s.isCancelled);
  return active
    .map((subscription) => ({
      subscription,
      amount: chargeAmountInMonth(subscription, year, month),
    }))
    .filter((row) => row.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

export function spendingTrendMonths(
  subs: Subscription[],
  monthCount = 6,
  locale?: string,
): MonthTrendRow[] {
  const active = subs.filter((s) => !s.isCancelled);
  const now = new Date();
  const rows: MonthTrendRow[] = [];

  for (let i = monthCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const total = active.reduce((sum, s) => sum + chargeAmountInMonth(s, year, month), 0);
    rows.push({
      label: d.toLocaleString(locale, { month: 'short' }),
      total,
      year,
      month,
    });
  }
  return rows;
}
