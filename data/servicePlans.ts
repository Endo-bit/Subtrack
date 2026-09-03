import { BillingCycle, LocalPrices, ServicePlan } from '@/types/subscription';

/** (id suffix, label, EUR price, optional cycle, optional published prices in other markets) */
type PlanRow = [string, string, number, BillingCycle?, LocalPrices?];

/** Extra plans beyond the default row price (id suffix, label, price, optional cycle). */
export const EXTRA_PLANS: Record<string, PlanRow[]> = {
  netflix: [
    ['standard', 'Standard', 13.99, 'monthly', { USD: 19.99, JPY: 1590 }],
    ['premium', 'Premium', 17.99, 'monthly', { USD: 26.99, JPY: 2290 }],
  ],
  spotify: [
    ['individual', 'Individual', 10.99, 'monthly', { JPY: 1080 }],
    ['duo', 'Duo', 14.99],
    ['family', 'Family', 17.99, 'monthly', { USD: 19.99 }],
  ],
  disney: [
    ['standard', 'Standard', 8.99, 'monthly', { USD: 11.99, JPY: 1250 }],
    ['premium', 'Premium', 11.99, 'monthly', { USD: 18.99, JPY: 1670 }],
  ],
  // Prices verified against the vendors' own pricing pages (Sept 2026). USD-priced services are
  // carried at numeric parity in EUR, matching how the rest of this catalogue was already built;
  // every price is an editable default, and the Add screen converts it to the display currency.
  // These vendors publish in USD, so the figure below *is* the US list price and is carried
  // through unconverted; the EUR column is the same number, matching how this catalogue was
  // already built (real EU prices land ~15-20% higher once VAT is applied).
  'chatgpt': [
    ['go', 'Go', 8, 'monthly', { USD: 8 }],
    ['plus', 'Plus', 20, 'monthly', { USD: 20 }],
    ['pro', 'Pro', 200, 'monthly', { USD: 200 }],
    ['business', 'Business', 25, 'monthly', { USD: 25 }],
    ['business-yr', 'Business (annual)', 240, 'annual', { USD: 240 }],
  ],
  claude: [
    ['pro', 'Pro', 20, 'monthly', { USD: 20 }],
    ['pro-yr', 'Pro (annual)', 200, 'annual', { USD: 200 }],
    ['max5', 'Max 5x', 100, 'monthly', { USD: 100 }],
    ['max20', 'Max 20x', 200, 'monthly', { USD: 200 }],
    ['team', 'Team', 25, 'monthly', { USD: 25 }],
    ['team-yr', 'Team (annual)', 240, 'annual', { USD: 240 }],
  ],
  duolingo: [
    ['super-yr', 'Super (annual)', 122.99, 'annual'],
    ['family-yr', 'Family (annual)', 122.99, 'annual'],
    ['max', 'Max', 14.99],
    ['max-yr', 'Max (annual)', 179.99, 'annual'],
  ],
  'github-copilot': [
    ['free', 'Free', 0, 'monthly', { USD: 0 }],
    ['pro', 'Pro', 10, 'monthly', { USD: 10 }],
    ['pro-plus', 'Pro+', 39, 'monthly', { USD: 39 }],
  ],
  figma: [
    ['professional', 'Professional', 15, 'monthly', { USD: 15 }],
    ['professional-yr', 'Professional (annual)', 144, 'annual', { USD: 144 }],
    ['organization', 'Organization', 45, 'monthly', { USD: 45 }],
  ],
  vercel: [
    ['hobby', 'Hobby', 0, 'monthly', { USD: 0 }],
    ['pro', 'Pro', 20, 'monthly', { USD: 20 }],
  ],
  'apple-developer': [
    ['program', 'Developer Program', 99, 'annual', { USD: 99 }],
    ['enterprise', 'Enterprise Program', 299, 'annual', { USD: 299 }],
  ],
  jetbrains: [
    ['all-products', 'All Products Pack', 29.9, 'monthly', { USD: 29.9 }],
    ['all-products-yr', 'All Products Pack (annual)', 249, 'annual', { USD: 249 }],
  ],
  'amazon-prime': [
    ['prime', 'Prime', 8.99, 'monthly', { JPY: 600 }],
    ['prime-video', 'Prime Video', 4.99],
  ],
  icloud: [
    ['50gb', '50 GB', 0.99],
    ['200gb', '200 GB', 2.99],
    ['2tb', '2 TB', 9.99],
  ],
  'apple-one': [
    ['individual', 'Individual', 16.95],
    ['family', 'Family', 22.95],
  ],
  'playstation-plus': [
    ['essential', 'Essential', 8.99],
    ['extra', 'Extra', 13.99],
    ['premium', 'Premium', 16.99],
  ],
  'xbox-gp': [
    ['core', 'Core', 6.99],
    ['pc', 'PC Game Pass', 9.99],
    ['ultimate', 'Ultimate', 12.99],
  ],
  nordvpn: [
    ['standard', 'Standard', 12.99],
    ['plus', 'Plus', 13.99],
  ],
  ms365: [
    ['personal', 'Personal', 10],
    ['family', 'Family', 13],
  ],
};

export function buildPlans(
  serviceId: string,
  serviceName: string,
  defaultPrice: number,
  defaultCycle: BillingCycle,
): ServicePlan[] {
  const extras = EXTRA_PLANS[serviceId];
  if (extras?.length) {
    return extras.map(([id, name, price, cycle, prices]) => ({
      id: `${serviceId}-${id}`,
      name,
      price,
      currency: 'EUR',
      billingCycle: cycle ?? defaultCycle,
      prices,
    }));
  }
  return [
    {
      id: `${serviceId}-default`,
      name: serviceName,
      price: defaultPrice,
      currency: 'EUR',
      billingCycle: defaultCycle,
    },
  ];
}

/**
 * Local list prices behind the single headline figure the Add list shows per service. Kept
 * separate from EXTRA_PLANS because the headline comes from the curated row price in
 * data/services.ts, not from the plan ladder.
 */
export const HEADLINE_PRICES: Record<string, LocalPrices> = {
  netflix: { USD: 26.99, JPY: 2290 },
  spotify: { JPY: 1080 },
  disney: { USD: 11.99, JPY: 1250 },
  'amazon-prime': { JPY: 600 },
  'apple-music': { JPY: 1180 },
  'youtube-premium': { USD: 15.99, JPY: 1280 },
  chatgpt: { USD: 20 },
  claude: { USD: 20 },
  vercel: { USD: 20 },
  'apple-developer': { USD: 99 },
  jetbrains: { USD: 29.9 },
  'github-copilot': { USD: 10 },
  figma: { USD: 15 },
};
