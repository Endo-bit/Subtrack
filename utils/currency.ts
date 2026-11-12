export type CurrencyCode =
  | 'EUR' | 'USD' | 'GBP' | 'JPY' | 'CHF' | 'CAD' | 'AUD'
  | 'MXN' | 'BRL' | 'SEK' | 'DKK' | 'NOK' | 'PLN' | 'CZK' | 'TRY' | 'KRW' | 'CNY' | 'HKD' | 'INR';

export const CURRENCIES: { code: CurrencyCode; symbol: string; label: string }[] = [
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
  { code: 'CHF', symbol: 'CHF', label: 'Swiss Franc' },
  { code: 'CAD', symbol: 'CA$', label: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
  // Every currency below is in the ECB reference set, so utils/exchangeRates.ts can price it.
  { code: 'MXN', symbol: 'MX$', label: 'Mexican Peso' },
  { code: 'BRL', symbol: 'R$', label: 'Brazilian Real' },
  { code: 'SEK', symbol: 'kr', label: 'Swedish Krona' },
  { code: 'DKK', symbol: 'kr.', label: 'Danish Krone' },
  { code: 'NOK', symbol: 'kr', label: 'Norwegian Krone' },
  { code: 'PLN', symbol: 'zł', label: 'Polish Złoty' },
  { code: 'CZK', symbol: 'Kč', label: 'Czech Koruna' },
  { code: 'TRY', symbol: '₺', label: 'Turkish Lira' },
  { code: 'KRW', symbol: '₩', label: 'South Korean Won' },
  { code: 'CNY', symbol: 'CN¥', label: 'Chinese Yuan' },
  { code: 'HKD', symbol: 'HK$', label: 'Hong Kong Dollar' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
];

/** Currencies people never write with minor units. */
const ZERO_DECIMAL = new Set<CurrencyCode>(['JPY', 'KRW']);
/** Currencies whose symbol follows the amount ("99.00 kr", "49.90 zł"). */
const SYMBOL_AFTER = new Set<CurrencyCode>(['SEK', 'DKK', 'NOK', 'PLN', 'CZK']);

export const currencyDecimals = (code: CurrencyCode): number => (ZERO_DECIMAL.has(code) ? 0 : 2);

/** Rounds a converted amount to what the currency actually uses. */
export function roundForCurrency(amount: number, code: CurrencyCode): number {
  const f = 10 ** currencyDecimals(code);
  return Math.round(amount * f) / f;
}

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
  MX: 'MXN', BR: 'BRL', SE: 'SEK', DK: 'DKK', FO: 'DKK', GL: 'DKK', NO: 'NOK', SJ: 'NOK',
  PL: 'PLN', CZ: 'CZK', TR: 'TRY', KR: 'KRW', CN: 'CNY', HK: 'HKD', IN: 'INR',
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
  const decimals = currencyDecimals(code);
  // Thousands separators keep "¥11,429" and "₩152,000" readable; the decimal point stays a dot
  // as everywhere else in the app.
  const number = amount.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  if (SYMBOL_AFTER.has(code)) return `${number} ${symbol}`;
  const spacer = symbol.length > 1 ? ' ' : '';
  return `${symbol}${spacer}${number}`;
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
