import { BillingCycle, ServicePlan } from '@/types/subscription';

type PlanRow = [string, string, number, BillingCycle?];

/** Extra plans beyond the default row price (id suffix, label, price, optional cycle). */
export const EXTRA_PLANS: Record<string, PlanRow[]> = {
  netflix: [
    ['standard', 'Standard', 13.99],
    ['premium', 'Premium', 17.99],
  ],
  spotify: [
    ['individual', 'Individual', 10.99],
    ['duo', 'Duo', 14.99],
    ['family', 'Family', 17.99],
  ],
  disney: [
    ['standard', 'Standard', 8.99],
    ['premium', 'Premium', 11.99],
  ],
  // Prices verified against the vendors' own pricing pages (Sept 2026). USD-priced services are
  // carried at numeric parity in EUR, matching how the rest of this catalogue was already built;
  // every price is an editable default, and the Add screen converts it to the display currency.
  'chatgpt': [
    ['go', 'Go', 8],
    ['plus', 'Plus', 20],
    ['pro', 'Pro', 200],
    ['business', 'Business', 25],
    ['business-yr', 'Business (annual)', 240, 'annual'],
  ],
  claude: [
    ['pro', 'Pro', 20],
    ['pro-yr', 'Pro (annual)', 200, 'annual'],
    ['max5', 'Max 5x', 100],
    ['max20', 'Max 20x', 200],
    ['team', 'Team', 25],
    ['team-yr', 'Team (annual)', 240, 'annual'],
  ],
  duolingo: [
    ['super-yr', 'Super (annual)', 122.99, 'annual'],
    ['family-yr', 'Family (annual)', 122.99, 'annual'],
    ['max', 'Max', 14.99],
    ['max-yr', 'Max (annual)', 179.99, 'annual'],
  ],
  'github-copilot': [
    ['free', 'Free', 0],
    ['pro', 'Pro', 10],
    ['pro-plus', 'Pro+', 39],
  ],
  figma: [
    ['professional', 'Professional', 15],
    ['professional-yr', 'Professional (annual)', 144, 'annual'],
    ['organization', 'Organization', 45],
  ],
  vercel: [
    ['hobby', 'Hobby', 0],
    ['pro', 'Pro', 20],
  ],
  'apple-developer': [
    ['program', 'Developer Program', 99, 'annual'],
    ['enterprise', 'Enterprise Program', 299, 'annual'],
  ],
  jetbrains: [
    ['all-products', 'All Products Pack', 29.9],
    ['all-products-yr', 'All Products Pack (annual)', 249, 'annual'],
  ],
  'amazon-prime': [
    ['prime', 'Prime', 8.99],
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
    return extras.map(([id, name, price, cycle]) => ({
      id: `${serviceId}-${id}`,
      name,
      price,
      currency: 'EUR',
      billingCycle: cycle ?? defaultCycle,
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
