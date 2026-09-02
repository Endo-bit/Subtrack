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

/**
 * Region → supported display currency. Only regions whose currency SubTrack can actually
 * display are listed; everything else falls back to EUR, which is also the right answer for
 * the whole eurozone.
 */
const REGION_CURRENCY: Record<string, CurrencyCode> = {
  US: 'USD', PR: 'USD', GU: 'USD', VI: 'USD', EC: 'USD', SV: 'USD', PA: 'USD',
  GB: 'GBP', IM: 'GBP', JE: 'GBP', GG: 'GBP',
  JP: 'JPY',
  CH: 'CHF', LI: 'CHF',
  CA: 'CAD',
  AU: 'AUD', CX: 'AUD', CC: 'AUD', NF: 'AUD', KI: 'AUD', NR: 'AUD', TV: 'AUD',
};

/**
 * Best guess at the currency the device's owner thinks in, used as the initial display
 * currency on a fresh install so a US or Japanese user doesn't open the app to euros.
 * Only ever a default — Settings still lets them pick any supported currency.
 */
export function detectDeviceCurrency(): CurrencyCode {
  try {
    const { locale } = Intl.DateTimeFormat().resolvedOptions();
    // Canonicalised BCP-47 looks like 'en-US', 'zh-Hant-TW' or 'de-DE-u-ca-gregory'. The region
    // is an uppercase 2-letter subtag in position 1 or 2 (position 2 only when a script tag
    // precedes it); anything later is an extension. Matching case-sensitively keeps lowercase
    // extension keys like the 'ca' in '-u-ca-gregory' from being read as Canada.
    const parts = locale.split('-');
    const region = [parts[1], parts[2]].find((part) => !!part && /^[A-Z]{2}$/.test(part));
    return (region && REGION_CURRENCY[region]) || 'EUR';
  } catch {
    return 'EUR';
  }
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
