import { CurrencyCode } from '@/utils/currency';

export type Language = 'de' | 'fr' | 'en' | 'es';
export type BillingCycle = 'monthly' | 'quarterly' | 'annual';
export type Category = 'streaming' | 'music' | 'productivity' | 'gaming' | 'health' | 'news' | 'other';
export type VatMode = 'de' | 'fr' | 'none';

/**
 * Published list prices in other markets, keyed by currency. A subscription costs what the vendor
 * charges in that country, which is rarely the euro price run through an exchange rate — Netflix
 * Standard is EUR 13.99, USD 19.99 and JPY 1590, and no FX rate reconciles those. Where a market
 * is missing here the euro price is converted instead, which is an approximation.
 */
export type LocalPrices = Partial<Record<CurrencyCode, number>>;

export type ServicePlan = {
  id: string;
  name: string;
  /** The euro list price. Other markets live in `prices`. */
  price: number;
  currency?: string;
  billingCycle?: BillingCycle;
  prices?: LocalPrices;
};

export type PresetService = {
  id: string;
  name: string;
  initials: string;
  color: string;
  logo?: string;
  defaultPrice: number;
  category: Category;
  billingCycle: BillingCycle;
  plans: ServicePlan[];
  cancelUrl?: string;
  /** Local prices for the headline figure shown while browsing. */
  prices?: LocalPrices;
};

export type Subscription = PresetService & {
  /** Next charge date (derived from startedAt + cycle, kept for calendar/reminders). */
  nextBillingDate: string;
  /** Contract start date (ISO). Spending history starts here. */
  startedAt: string;
  note?: string;
  isCancelled?: boolean;
  /**
   * ISO date (1st of month) — the first billing month with no charge once cancelled.
   * Set at cancel time based on whether that month's bill had already gone out.
   * Legacy cancellations from before this field existed have isCancelled without it,
   * which chargesInMonth() treats as "cancelled from the start" (excluded everywhere).
   */
  cancelEffectiveMonth?: string;
  planName?: string;
  /** ISO date when price/plan last changed. */
  planChangedAt?: string;
  customPrice?: boolean;
  /** ISO date the free trial ends. While in the future, billing is treated as €0. */
  trialEndsAt?: string;
  /** Currency this subscription is actually billed in (Pro only). Defaults to the app's display currency when unset. */
  currency?: CurrencyCode;
  /**
   * ISO timestamp of when the user answered the post-trial "did you cancel or continue?"
   * prompt. While a trial has ended and this is unset, the prompt is still pending — that's
   * what stops it reappearing forever once answered.
   */
  trialFollowUpAnsweredAt?: string;
};

export type SortMode = 'date' | 'cost' | 'alpha';
export type AddListMode = 'alpha' | 'category';
