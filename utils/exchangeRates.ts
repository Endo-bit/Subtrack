import { CURRENCIES, ExchangeRates } from '@/utils/currency';

/**
 * Frankfurter (European Central Bank reference rates) — free, no API key,
 * updated once per ECB business day. "Real-time" here means "current
 * published rate", not sub-second market ticks.
 */
const RATES_URL = `https://api.frankfurter.app/latest?from=EUR&to=${CURRENCIES.filter((c) => c.code !== 'EUR')
  .map((c) => c.code)
  .join(',')}`;

export async function fetchExchangeRates(): Promise<ExchangeRates | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(RATES_URL, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const json = (await res.json()) as { rates?: Record<string, number> };
    if (!json.rates) return null;
    return { EUR: 1, ...json.rates } as ExchangeRates;
  } catch {
    return null;
  }
}

const STALE_AFTER_MS = 12 * 60 * 60 * 1000; // 12 hours

export function ratesAreStale(updatedAt: string | null): boolean {
  if (!updatedAt) return true;
  return Date.now() - new Date(updatedAt).getTime() > STALE_AFTER_MS;
}
