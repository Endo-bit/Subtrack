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
  planName?: string;
  /** ISO date when price/plan last changed. */
  planChangedAt?: string;
  customPrice?: boolean;
};

export type SortMode = 'date' | 'cost' | 'alpha';
export type AddListMode = 'alpha' | 'category';
