import { convertAmount, ExchangeRates } from '../currency';

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
