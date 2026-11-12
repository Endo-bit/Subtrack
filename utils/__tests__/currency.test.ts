import { convertAmount, detectDeviceCurrency, ExchangeRates, formatMoney, roundForCurrency } from '../currency';

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
    withLocale('ru-RU');
    expect(detectDeviceCurrency()).toBe('EUR');
  });

  test('picks the local currency where the app supports it', () => {
    withLocale('es-MX');
    expect(detectDeviceCurrency()).toBe('MXN');
    withLocale('pt-BR');
    expect(detectDeviceCurrency()).toBe('BRL');
    withLocale('ko-KR');
    expect(detectDeviceCurrency()).toBe('KRW');
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

describe('formatMoney', () => {
  test('groups thousands and drops minor units where the currency has none', () => {
    expect(formatMoney(11429, 'JPY')).toBe('¥11,429');
    expect(formatMoney(152000, 'KRW')).toBe('₩152,000');
    expect(formatMoney(1234.5, 'USD')).toBe('$1,234.50');
  });

  test('puts Nordic, Polish and Czech symbols after the amount', () => {
    expect(formatMoney(99, 'SEK')).toBe('99.00 kr');
    expect(formatMoney(49.9, 'PLN')).toBe('49.90 zł');
  });

  test('rounds converted amounts to the currency', () => {
    expect(roundForCurrency(1234.567, 'KRW')).toBe(1235);
    expect(roundForCurrency(12.345, 'MXN')).toBeCloseTo(12.35);
  });
});
