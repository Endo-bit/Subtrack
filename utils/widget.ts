import { Platform } from 'react-native';
import { Subscription } from '@/types/subscription';
import { CurrencyCode, formatMoney } from '@/utils/currency';
import { ConvertFn, isInTrial, monthly, nextRelevantDate } from '@/utils/subscription';
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
  /** Localized word for the headline figure, matching the dashboard's own label. */
  totalLabel: string;
  monthTotal: string;
  upcoming: {
    name: string;
    initials: string;
    /** Hex, e.g. `#FF5C35` — the widget parses this into a SwiftUI Color. */
    color: string;
    dateLabel: string;
    amount: string;
    /** Remote icon URL; the widget falls back to the initials chip when absent or unreachable. */
    logo?: string;
  }[];
  updatedAt: string;
};

export function buildWidgetPayload(
  subscriptions: Subscription[],
  currency: CurrencyCode,
  locale: string,
  convert: ConvertFn,
  totalLabel: string,
  /** Short trial-badge word (e.g. "Trial") shown instead of a price while a subscription's free trial hasn't ended. */
  trialLabel: string,
  now: Date = new Date(),
): WidgetPayload {
  // Must be the same figure the dashboard shows. This used to sum what actually gets charged in
  // the current calendar month, which is a defensible metric on its own but made an annual plan
  // count as zero in eleven months out of twelve — so the widget and the home screen disagreed
  // under the same label. Whichever metric is better, showing two of them is the bug.
  const monthTotal = subscriptions
    .filter((s) => !s.isCancelled)
    .reduce((sum, s) => sum + monthly(s, convert), 0);

  const upcoming = subscriptions
    .filter((s) => !s.isCancelled)
    .sort((a, b) => nextRelevantDate(a, now).getTime() - nextRelevantDate(b, now).getTime())
    .slice(0, UPCOMING_COUNT)
    .map((s) => ({
      name: s.name,
      initials: s.initials,
      color: s.color,
      dateLabel: nextRelevantDate(s, now).toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
      }),
      // A trial never actually charges, so the widget must not show its real plan price — that
      // reads as a bill about to hit. Show the trial badge instead; the date above is already
      // the trial's end, not some interim cycle date that happens to fall inside it.
      amount: isInTrial(s, now) ? trialLabel : formatMoney(convert(s.defaultPrice, s.currency), currency),
      logo: s.logo,
    }));

  return {
    totalLabel,
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
  totalLabel: string,
  trialLabel: string,
): Promise<void> {
  if (Platform.OS !== 'ios') return;
  const payload = buildWidgetPayload(subscriptions, currency, locale, convert, totalLabel, trialLabel);
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
