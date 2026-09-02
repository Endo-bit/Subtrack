import { Strings } from '@/i18n/strings';
import { ProPriceOption } from '@/utils/purchases';

/**
 * Prefer RevenueCat's reserved "lifetime" package type, but also match a custom package or
 * product identifier containing "lifetime", in case the offering wasn't set up with the
 * reserved $rc_lifetime identifier (e.g. product id com.SubTrack.lifetime mapped as CUSTOM).
 * Mirrors the same check in app/paywall.tsx.
 */
export function isLifetimeOption(option: Pick<ProPriceOption, 'packageType' | 'identifier' | 'productIdentifier'>): boolean {
  return (
    option.packageType === 'LIFETIME' ||
    option.identifier.toLowerCase().includes('lifetime') ||
    option.productIdentifier.toLowerCase().includes('lifetime')
  );
}

/**
 * App Store guideline 3.1.2 requires the subscription length to be visible alongside its title
 * and price, and the App Store Connect display name isn't guaranteed to spell that out — so it's
 * derived from the package type instead.
 */
export function durationLabel(
  option: Pick<ProPriceOption, 'packageType' | 'identifier' | 'productIdentifier'>,
  t: Strings,
): string | null {
  if (isLifetimeOption(option)) return t.paywallDurationLifetime;
  if (option.packageType === 'ANNUAL') return t.paywallDurationYearly;
  if (option.packageType === 'MONTHLY') return t.paywallDurationMonthly;
  return null;
}

/**
 * A one-line teaser like "Monthly €1.99 · Lifetime €29.99", built entirely from the store's own
 * `priceString` values so it is always in the viewer's storefront currency at the price Apple
 * actually charges there. Returns null when no offering has loaded — callers should fall back to
 * price-free copy rather than inventing a number.
 */
export function proPriceSummary(options: ProPriceOption[], t: Strings): string | null {
  if (options.length === 0) return null;
  const parts = options.map((option) => {
    const duration = durationLabel(option, t);
    return duration ? `${duration} ${option.priceString}` : option.priceString;
  });
  return parts.join(' · ');
}
