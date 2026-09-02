import { Platform } from 'react-native';
import { Subscription } from '@/types/subscription';
import { CurrencyCode, formatMoney } from '@/utils/currency';
import { chargeAmountInMonth, ConvertFn } from '@/utils/subscription';
import { isWidgetBridgeAvailable, readWidgetPayload, setWidgetPayload } from '@/modules/subtrack-widget';

/**
 * App Group the app and its widget extension share. Must match, byte for byte:
 *   - `ios.entitlements` in app.json (the app's side)
 *   - `entitlements` in targets/widget/expo-target.config.js (the widget's side)
 *   - the identifier registered in the Apple Developer portal
 * A mismatch fails silently — `UserDefaults(suiteName:)` just returns nil and the widget
 * renders its placeholder forever.
 */
export const WIDGET_APP_GROUP = 'group.com.cutedogstoryai.subtrack';

/** How many upcoming charges the widget shows at its largest size. */
const UPCOMING_COUNT = 3;

/** Mirrors `WidgetPayload` in targets/widget/index.swift — keep the two in step. */
export type WidgetPayload = {
  monthLabel: string;
  monthTotal: string;
  upcoming: {
    name: string;
    initials: string;
    /** Hex, e.g. `#FF5C35` — the widget parses this into a SwiftUI Color. */
    color: string;
    dateLabel: string;
    amount: string;
  }[];
  updatedAt: string;
};

export function buildWidgetPayload(
  subscriptions: Subscription[],
  currency: CurrencyCode,
  locale: string,
  convert: ConvertFn,
  now: Date = new Date(),
): WidgetPayload {
  // "Spend this month" means what actually gets charged between the 1st and the 31st — not the
  // normalised monthly run rate — so an annual plan only counts in its renewal month.
  const monthTotal = subscriptions.reduce(
    (sum, s) => sum + chargeAmountInMonth(s, now.getFullYear(), now.getMonth(), convert),
    0,
  );

  const upcoming = subscriptions
    .filter((s) => !s.isCancelled)
    .sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime())
    .slice(0, UPCOMING_COUNT)
    .map((s) => ({
      name: s.name,
      initials: s.initials,
      color: s.color,
      dateLabel: new Date(s.nextBillingDate).toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
      }),
      amount: formatMoney(convert(s.defaultPrice, s.currency), currency),
    }));

  return {
    monthLabel: now.toLocaleDateString(locale, { month: 'long' }),
    monthTotal: formatMoney(monthTotal, currency),
    upcoming,
    updatedAt: now.toISOString(),
  };
}

/**
 * Pushes the current numbers into the shared App Group and asks WidgetKit to redraw. Amounts are
 * written pre-formatted because the widget process has no access to the user's currency setting
 * or FX rates — the app is the only place that can turn a subscription into a display string.
 *
 * No-ops off iOS and in Expo Go, where the native module isn't linked.
 */
export async function syncWidgetData(
  subscriptions: Subscription[],
  currency: CurrencyCode,
  locale: string,
  convert: ConvertFn,
): Promise<void> {
  if (Platform.OS !== 'ios') return;
  const payload = buildWidgetPayload(subscriptions, currency, locale, convert);
  setWidgetPayload(WIDGET_APP_GROUP, JSON.stringify(payload));
}

/**
 * Where a "the widget shows nothing" report actually comes from. The three states are different
 * faults with different fixes, and none of them is visible from inside the widget:
 *   missing     - the native module is not in this build at all (autolinking / Expo Go)
 *   unreachable - the App Group entitlement is wrong, so even the app cannot open the container
 *   empty       - the app has never written a payload
 *   ok          - the app wrote data and can read it back; any remaining fault is the extension's
 */
export type WidgetDiagnostics = {
  state: 'not-ios' | 'missing' | 'unreachable' | 'empty' | 'ok';
  monthTotal?: string;
  upcomingCount?: number;
};

export function widgetDiagnostics(): WidgetDiagnostics {
  if (Platform.OS !== 'ios') return { state: 'not-ios' };
  if (!isWidgetBridgeAvailable) return { state: 'missing' };
  const raw = readWidgetPayload(WIDGET_APP_GROUP);
  if (raw === null) return { state: 'unreachable' };
  try {
    const parsed = JSON.parse(raw) as WidgetPayload;
    return {
      state: 'ok',
      monthTotal: parsed.monthTotal,
      upcomingCount: parsed.upcoming?.length ?? 0,
    };
  } catch {
    return { state: 'empty' };
  }
}
