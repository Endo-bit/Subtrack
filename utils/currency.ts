export type CurrencyCode = 'EUR' | 'USD' | 'GBP' | 'JPY' | 'CHF' | 'CAD' | 'AUD';

export const CURRENCIES: { code: CurrencyCode; symbol: string; label: string }[] = [
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
  { code: 'CHF', symbol: 'CHF', label: 'Swiss Franc' },
  { code: 'CAD', symbol: 'CA$', label: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
];

export function currencySymbol(code: CurrencyCode): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? '€';
}

/** Display-only formatting; does not convert between currencies. */
export function formatMoney(amount: number, code: CurrencyCode): string {
  const symbol = currencySymbol(code);
  const decimals = code === 'JPY' ? 0 : 2;
  const spacer = symbol.length > 1 ? ' ' : '';
  return `${symbol}${spacer}${amount.toFixed(decimals)}`;
}

/** Rates are "1 EUR = rates[code] units of code" (see utils/exchangeRates.ts). */
export type ExchangeRates = Partial<Record<CurrencyCode, number>>;

export function convertAmount(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  rates: ExchangeRates | null | undefined,
): number {
  if (from === to || !rates) return amount;
  const fromRate = rates[from];
  const toRate = rates[to];
  if (!fromRate || !toRate) return amount;
  return (amount / fromRate) * toRate;
}
