import { CurrencyCode } from '@/utils/currency';

export type Language = 'de' | 'fr' | 'en' | 'es';
export type BillingCycle = 'monthly' | 'quarterly' | 'annual';
export type Category = 'streaming' | 'music' | 'productivity' | 'gaming' | 'health' | 'news' | 'other';
export type VatMode = 'de' | 'fr' | 'none';

export type ServicePlan = {
  id: string;
  name: string;
  price: number;
  currency?: string;
  billingCycle?: BillingCycle;
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
