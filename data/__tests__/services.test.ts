import { PRESET_SERVICES } from '../services';

const byId = (id: string) => {
  const s = PRESET_SERVICES.find((x) => x.id === id);
  if (!s) throw new Error(`preset service '${id}' is missing from the catalogue`);
  return s;
};

const monthlyEquivalent = (price: number, cycle: string) =>
  cycle === 'annual' ? price / 12 : cycle === 'quarterly' ? price / 3 : price;

describe('preset catalogue', () => {
  test('every plan price is denominated in EUR', () => {
    // utils/widget.ts and the Add screen both convert from EUR; a plan in any other currency
    // would be silently mis-converted.
    const offenders = PRESET_SERVICES.flatMap((s) =>
      s.plans.filter((p) => p.currency !== 'EUR').map((p) => `${s.id}/${p.id}=${p.currency}`),
    );
    expect(offenders).toEqual([]);
  });

  test('plan ids are unique within a service', () => {
    for (const s of PRESET_SERVICES) {
      expect(new Set(s.plans.map((p) => p.id)).size).toBe(s.plans.length);
    }
  });

  test('the browse headline is a monthly price whenever the service has a monthly tier', () => {
    // Taking the last plan outright would surface Claude's annual 200 as its headline and read
    // as a monthly price next to every other row in the list.
    for (const s of PRESET_SERVICES) {
      const hasMonthly = s.plans.some((p) => (p.billingCycle ?? s.billingCycle) === 'monthly');
      if (hasMonthly) expect(s.billingCycle).toBe('monthly');
    }
  });

  test('Claude offers a monthly and an annual Pro tier, and annual is the cheaper one', () => {
    const claude = byId('claude');
    const monthly = claude.plans.find((p) => p.name === 'Pro')!;
    const annual = claude.plans.find((p) => p.name === 'Pro (annual)')!;
    expect(monthly.billingCycle).toBe('monthly');
    expect(annual.billingCycle).toBe('annual');
    expect(monthlyEquivalent(annual.price, 'annual')).toBeLessThan(
      monthlyEquivalent(monthly.price, 'monthly'),
    );
    expect(claude.defaultPrice).toBe(20);
  });

  test('ChatGPT carries the full tier ladder, not just two plans', () => {
    const names = byId('chatgpt').plans.map((p) => p.name);
    expect(names).toEqual(
      expect.arrayContaining(['Go', 'Plus', 'Pro', 'Business', 'Business (annual)']),
    );
  });

  test('annual-only services keep an annual headline', () => {
    const apple = byId('apple-developer');
    expect(apple.billingCycle).toBe('annual');
    expect(apple.defaultPrice).toBe(99);
    expect(apple.plans.every((p) => p.billingCycle === 'annual')).toBe(true);
  });

  test('developer tooling the user asked for is present', () => {
    for (const id of ['vercel', 'apple-developer', 'jetbrains', 'github-copilot', 'figma']) {
      expect(byId(id).plans.length).toBeGreaterThan(0);
    }
  });

  test('Duolingo exposes its annual tiers alongside the monthly one', () => {
    const plans = byId('duolingo').plans;
    expect(plans.some((p) => p.billingCycle === 'annual')).toBe(true);
    expect(plans.some((p) => p.billingCycle === 'monthly')).toBe(true);
  });
});
