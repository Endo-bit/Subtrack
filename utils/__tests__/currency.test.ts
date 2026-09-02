import { convertAmount, detectDeviceCurrency, ExchangeRates } from '../currency';

const rates: ExchangeRates = { EUR: 1, USD: 1.08, GBP: 0.86, JPY: 170 };

describe('convertAmount', () => {
  test('returns the amount unchanged when from and to match', () => {
    expect(convertAmount(50, 'EUR', 'EUR', rates)).toBe(50);
  });

  test('converts using EUR-based cross rates', () => {
    expect(convertAmount(10, 'EUR', 'USD', rates)).toBeCloseTo(10.8);
    expect(convertAmount(10.8, 'USD', 'EUR', rates)).toBeCloseTo(10);
  });

  test('converts between two non-EUR currencies via the EUR base', () => {
    const result = convertAmount(100, 'USD', 'GBP', rates);
    expect(result).toBeCloseTo((100 / 1.08) * 0.86);
  });

  test('falls back to the raw amount when rates are missing', () => {
    expect(convertAmount(20, 'EUR', 'USD', null)).toBe(20);
    expect(convertAmount(20, 'EUR', 'USD', undefined)).toBe(20);
  });

  test('falls back to the raw amount when a currency is missing from the rates table', () => {
    const partialRates: ExchangeRates = { EUR: 1, USD: 1.08 };
    expect(convertAmount(20, 'EUR', 'CHF', partialRates)).toBe(20);
  });
});

describe('detectDeviceCurrency', () => {
  const resolvedOptions = Intl.DateTimeFormat.prototype.resolvedOptions;

  const withLocale = (locale: string) => {
    jest
      .spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions')
      .mockReturnValue({ ...resolvedOptions.call(new Intl.DateTimeFormat()), locale });
  };

  afterEach(() => jest.restoreAllMocks());

  test('maps a region to the currency people there actually think in', () => {
    withLocale('en-US');
    expect(detectDeviceCurrency()).toBe('USD');
    withLocale('ja-JP');
    expect(detectDeviceCurrency()).toBe('JPY');
    withLocale('en-GB');
    expect(detectDeviceCurrency()).toBe('GBP');
  });

  test('falls back to EUR for the eurozone and anything unmapped', () => {
    withLocale('de-DE');
    expect(detectDeviceCurrency()).toBe('EUR');
    withLocale('pt-BR');
    expect(detectDeviceCurrency()).toBe('EUR');
  });

  test('falls back to EUR when the locale carries no region at all', () => {
    withLocale('en');
    expect(detectDeviceCurrency()).toBe('EUR');
  });

  test('does not mistake a lowercase extension subtag for a region', () => {
    // The 'ca' here is the calendar extension key, not Canada.
    withLocale('en-u-ca-gregory');
    expect(detectDeviceCurrency()).toBe('EUR');
  });

  test('reads the region past a script subtag', () => {
    withLocale('zh-Hant-TW');
    expect(detectDeviceCurrency()).toBe('EUR');
    withLocale('en-Latn-US');
    expect(detectDeviceCurrency()).toBe('USD');
  });
});
