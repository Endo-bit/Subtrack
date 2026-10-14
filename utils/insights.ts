import { PresetService, Subscription } from '@/types/subscription';
import { CurrencyCode } from '@/utils/currency';
import { billingDayInMonth, chargeAmountInMonth, ConvertFn, monthly, subscriptionStartedAt } from '@/utils/subscription';

/**
 * The "shareable truths" behind SubTrack's growth features — receipt, lifetime spend, price-hike
 * radar and streaming rotation. Pure functions over the user's own data, nothing fetched.
 */

/**
 * Roughly what a subscription has cost since it started: every billing occurrence up to today at
 * today's price. Past price changes aren't recorded, so this reads as "about" — which is also
 * the framing people use when they say "I've paid Netflix over €1,000".
 */
export function lifetimeSpend(sub: Subscription, convert?: ConvertFn, now: Date = new Date()): number {
  const start = subscriptionStartedAt(sub);
  if (Number.isNaN(start.getTime()) || start > now) return 0;
  let total = 0;
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 1);
  while (cursor <= end) {
    const y = cursor.getFullYear();
    const m = cursor.getMonth();
    const day = billingDayInMonth(sub, y, m);
    // This month's charge only counts once its day has come.
    if (day !== null && new Date(y, m, day) <= now) total += chargeAmountInMonth(sub, y, m, convert);
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return total;
}

export function totalLifetimeSpend(subs: Subscription[], convert?: ConvertFn, now: Date = new Date()): number {
  return subs.reduce((sum, s) => sum + lifetimeSpend(s, convert, now), 0);
}

/** Hours of paid work a yearly amount takes. Null when no wage has been entered. */
export function workHours(yearlyAmount: number, hourlyWage: number | null): number | null {
  if (!hourlyWage || hourlyWage <= 0) return null;
  return yearlyAmount / hourlyWage;
}

export type PriceHike = {
  subscription: Subscription;
  trackedPrice: number;
  currentPrice: number;
  /** Whole-number percentage increase. */
  pct: number;
  /** Stable per (subscription, new price) so a dismissal holds until the price moves again. */
  key: string;
};

type CatalogPriceFn = (
  eurAmount: number,
  localPrices?: Partial<Record<CurrencyCode, number>>,
) => { amount: number; currency: CurrencyCode; exact: boolean };

/**
 * Subscriptions whose catalogue plan now costs more than what the user is tracking — i.e. the
 * vendor raised the price since they added it. Only compares like with like: a catalogue plan
 * the user didn't override, in the display currency, at that market's published price. A price
 * produced by an exchange rate is never reported as a "hike".
 */
export function detectPriceHikes(
  subs: Subscription[],
  presets: PresetService[],
  catalogPrice: CatalogPriceFn,
  displayCurrency: CurrencyCode,
  dismissed: readonly string[] = [],
): PriceHike[] {
  const out: PriceHike[] = [];
  for (const sub of subs) {
    if (sub.isCancelled || sub.customPrice || sub.currency || !sub.planName) continue;
    const preset = presets.find((p) => p.id === sub.id.replace(/-\d+$/, ''));
    const plan = preset?.plans.find((p) => p.name === sub.planName);
    if (!plan) continue;
    const current = catalogPrice(plan.price, plan.prices);
    if (!current.exact || current.currency !== displayCurrency) continue;
    if (sub.defaultPrice <= 0 || current.amount <= sub.defaultPrice * 1.005) continue;
    const key = `${sub.id}|${current.amount}`;
    if (dismissed.includes(key)) continue;
    out.push({
      subscription: sub,
      trackedPrice: sub.defaultPrice,
      currentPrice: current.amount,
      pct: Math.round(((current.amount - sub.defaultPrice) / sub.defaultPrice) * 100),
      key,
    });
  }
  return out.sort((a, b) => b.pct - a.pct);
}

export type RotationPlan = {
  members: Subscription[];
  /** What the streaming stack costs per month today. */
  monthlyNow: number;
  /** Average monthly cost when only one of them is active at a time. */
  monthlyRotating: number;
  yearlySaving: number;
  /** Which service to have in each of the coming months, starting with this one. */
  schedule: { month: Date; subscription: Subscription }[];
};

export const ROTATION_MONTHS = 6;

/**
 * "Subscribe, binge, cancel": keeping one streaming service at a time instead of the whole stack.
 * Monthly-billed streaming only — annual plans can't be paused month to month. The schedule
 * cycles from the most expensive service down, one per month.
 */
export function buildRotationPlan(subs: Subscription[], convert?: ConvertFn, now: Date = new Date()): RotationPlan | null {
  const members = subs
    .filter((s) => !s.isCancelled && s.category === 'streaming' && s.billingCycle === 'monthly')
    .filter((s) => monthly(s, convert) > 0)
    .sort((a, b) => monthly(b, convert) - monthly(a, convert));
  if (members.length < 2) return null;
  const monthlyNow = members.reduce((sum, s) => sum + monthly(s, convert), 0);
  const monthlyRotating = monthlyNow / members.length;
  const schedule = Array.from({ length: ROTATION_MONTHS }, (_, i) => ({
    month: new Date(now.getFullYear(), now.getMonth() + i, 1),
    subscription: members[i % members.length],
  }));
  return {
    members,
    monthlyNow,
    monthlyRotating,
    yearlySaving: (monthlyNow - monthlyRotating) * 12,
    schedule,
  };
}
