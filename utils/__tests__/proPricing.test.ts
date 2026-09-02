import { strings } from '../../i18n/strings';
import { ProPriceOption } from '../purchases';
import { durationLabel, isLifetimeOption, proPriceSummary } from '../proPricing';

const t = strings.en;

const option = (o: Partial<ProPriceOption> = {}): ProPriceOption => ({
  identifier: '$rc_monthly',
  productIdentifier: 'com.SubTrack.monthly',
  packageType: 'MONTHLY',
  priceString: '$1.99',
  ...o,
});

describe('isLifetimeOption', () => {
  test('recognises the reserved package type', () => {
    expect(isLifetimeOption(option({ packageType: 'LIFETIME' }))).toBe(true);
  });

  test('also recognises a CUSTOM package whose identifiers say lifetime', () => {
    // The real offering maps com.SubTrack.lifetime as CUSTOM rather than $rc_lifetime.
    expect(
      isLifetimeOption(
        option({ packageType: 'CUSTOM', identifier: 'pro', productIdentifier: 'com.SubTrack.lifetime' }),
      ),
    ).toBe(true);
  });

  test('leaves recurring packages alone', () => {
    expect(isLifetimeOption(option({ packageType: 'ANNUAL' }))).toBe(false);
  });
});

describe('durationLabel', () => {
  test('names the subscription length required by App Store guideline 3.1.2', () => {
    expect(durationLabel(option({ packageType: 'MONTHLY' }), t)).toBe('Monthly');
    expect(durationLabel(option({ packageType: 'ANNUAL' }), t)).toBe('Yearly');
    expect(durationLabel(option({ packageType: 'LIFETIME' }), t)).toBe('Lifetime');
  });

  test('returns null for a package type with no meaningful duration', () => {
    expect(durationLabel(option({ packageType: 'WEEKLY' }), t)).toBeNull();
  });
});

describe('proPriceSummary', () => {
  test("uses the store's own price strings verbatim, whatever the storefront currency", () => {
    const summary = proPriceSummary(
      [
        option({ packageType: 'MONTHLY', priceString: '¥300' }),
        option({ packageType: 'LIFETIME', identifier: '$rc_lifetime', priceString: '¥4,000' }),
      ],
      t,
    );
    expect(summary).toBe('Monthly ¥300 · Lifetime ¥4,000');
    // The whole point of this module: nothing invents a currency of its own.
    expect(summary).not.toContain('€');
  });

  test('returns null when no offering has loaded, so callers fall back to price-free copy', () => {
    expect(proPriceSummary([], t)).toBeNull();
  });

  test('falls back to the bare price when the package type has no duration label', () => {
    expect(proPriceSummary([option({ packageType: 'WEEKLY', priceString: '£0.99' })], t)).toBe('£0.99');
  });
});
