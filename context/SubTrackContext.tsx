import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Appearance, AppState } from 'react-native';
import { PRESET_SERVICES } from '@/data/services';
import { localeForLanguage, strings } from '@/i18n/strings';
import { Language, LANGUAGES, LocalPrices, Subscription, VatMode } from '@/types/subscription';
import { posthog, track } from '@/utils/analytics';
import { convertAmount, CurrencyCode, detectDeviceCurrency, ExchangeRates } from '@/utils/currency';
import { exportBackupFile, exportCsvFile, pickBackupFile } from '@/utils/dataExport';
import { DiagnosisRecord } from '@/utils/diagnosis';
import { fetchExchangeRates, ratesAreStale } from '@/utils/exchangeRates';
import { detectPriceHikes, PriceHike } from '@/utils/insights';
import {
  getNotificationPermissionStatus,
  NotificationPermissionStatus,
  requestNotificationPermission,
  scheduleAllReminders,
} from '@/utils/notifications';
import { STATE_STORAGE_KEY as storageKey } from '@/utils/persistedState';
import { syncWidgetData } from '@/utils/widget';
import {
  addEntitlementListener,
  configurePurchases,
  entitlementIsActive,
  fetchCustomerInfo,
  fetchProPriceOptions,
  linkAnalyticsUser,
  ProPriceOption,
  restorePurchases as restorePurchasesRC,
} from '@/utils/purchases';
import {
  computeCancelEffectiveMonth,
  ConvertFn,
  makeConvert,
  monthly,
  normalizeSubscription,
} from '@/utils/subscription';


/**
 * A catalogue price ready to display. `exact` is false when it came from converting the euro
 * price rather than from that market's published one, so the UI can mark it as approximate.
 */
export type CatalogPrice = { amount: number; currency: CurrencyCode; exact: boolean };

/** How long after a free trial ends the "did you cancel?" prompt stays worth asking. */
const TRIAL_FOLLOW_UP_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * The pre-permission ("primer") sheet is asked at most this many times, this far apart. iOS shows
 * its own notification prompt exactly once — a "Don't Allow" there is permanent — so the system
 * prompt is only ever raised after someone has said yes to ours.
 */
const PRIMER_MAX_ASKS = 3;
const PRIMER_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000;

// On web, use localStorage directly so data survives tab close.
// On native, AsyncStorage is persistent already.
const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';

const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (isWeb) return window.localStorage.getItem(key);
    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (isWeb) { window.localStorage.setItem(key, value); return; }
    return AsyncStorage.setItem(key, value);
  },
};

/** 'system' follows the phone; the others pin the app regardless of the phone's setting. */
export type ThemeMode = 'system' | 'light' | 'dark';

type State = {
  subscriptions: Subscription[];
  language: Language;
  vatMode: VatMode;
  currency: CurrencyCode;
  reminderDays: 0 | 1 | 3 | 7;
  hasSeenOnboarding: boolean;
  isPro: boolean;
  diagnosisHistory: DiagnosisRecord[];
  exchangeRates: ExchangeRates | null;
  exchangeRatesUpdatedAt: string | null;
  /** Lifetime count of subscriptions ever added — gates the "rate the app" prompt. */
  subscriptionsAdded: number;
  /** Set once the App Store review prompt has been offered, so it's never shown twice. */
  hasAskedForReview: boolean;
  /** Times the reminder primer was dismissed with "Not now". */
  notificationPrimerAskCount: number;
  /** ISO timestamp of the last "Not now" on the reminder primer. */
  notificationPrimerLastAskedAt: string | null;
  /** The Home Screen widget tip on the dashboard was dismissed. */
  widgetTipDismissed: boolean;
  /** Optional, for the receipt's "hours of work" line. Never leaves the device. */
  hourlyWage: number | null;
  /** PriceHike keys the user chose to ignore; a later, different price shows again. */
  dismissedPriceHikes: string[];
  themeMode: ThemeMode;
};

const migrateState = (raw: State): State => ({
  ...raw,
  currency: raw.currency ?? detectDeviceCurrency(),
  diagnosisHistory: raw.diagnosisHistory ?? [],
  exchangeRates: raw.exchangeRates ?? null,
  exchangeRatesUpdatedAt: raw.exchangeRatesUpdatedAt ?? null,
  // Installs from before this counter existed have no history to count, so seed it from the
  // subscriptions they already have: someone who has been tracking five of them has long since
  // passed the bar the review prompt is looking for.
  subscriptionsAdded: raw.subscriptionsAdded ?? raw.subscriptions.length,
  hasAskedForReview: raw.hasAskedForReview ?? false,
  notificationPrimerAskCount: raw.notificationPrimerAskCount ?? 0,
  notificationPrimerLastAskedAt: raw.notificationPrimerLastAskedAt ?? null,
  widgetTipDismissed: raw.widgetTipDismissed ?? false,
  hourlyWage: raw.hourlyWage ?? null,
  dismissedPriceHikes: raw.dismissedPriceHikes ?? [],
  themeMode: raw.themeMode ?? 'system',
  subscriptions: raw.subscriptions.map(normalizeSubscription),
});

export function detectDeviceLanguage(): Language {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    const lang = locale.split(/[-_]/)[0].toLowerCase();
    // Traditional script is what Taiwan, Hong Kong and Macau read, whether or not the locale
    // spells out the script.
    if (lang === 'zh') return /Hant|TW|HK|MO/i.test(locale) ? 'zh-Hant' : 'zh-Hans';
    // Norwegian arrives as "no", "nb" or "nn"; Bokmål is the written standard most people use.
    if (lang === 'no' || lang === 'nn') return 'nb';
    return (LANGUAGES as readonly string[]).includes(lang) ? (lang as Language) : 'en';
  } catch {
    return 'en';
  }
}

function detectVatMode(lang: Language): VatMode {
  if (lang === 'de') return 'de';
  if (lang === 'fr') return 'fr';
  return 'none';
}

const detectedLang = detectDeviceLanguage();

const initialState: State = {
  subscriptions: [],
  language: detectedLang,
  vatMode: detectVatMode(detectedLang),
  currency: detectDeviceCurrency(),
  reminderDays: 3,
  hasSeenOnboarding: false,
  isPro: false,
  diagnosisHistory: [],
  exchangeRates: null,
  exchangeRatesUpdatedAt: null,
  subscriptionsAdded: 0,
  hasAskedForReview: false,
  notificationPrimerAskCount: 0,
  notificationPrimerLastAskedAt: null,
  widgetTipDismissed: false,
  hourlyWage: null,
  dismissedPriceHikes: [],
  themeMode: 'system',
};

export const [SubTrackProvider, useSubTrack] = createContextHook(() => {
  const [state, setState] = useState<State>(initialState);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [addTabResetNonce, setAddTabResetNonce] = useState(0);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermissionStatus>('undetermined');
  const [proPriceOptions, setProPriceOptions] = useState<ProPriceOption[]>([]);
  // Subscriptions whose post-trial prompt the user dismissed with "ask me later". Session-only
  // on purpose: "later" should mean the next launch, not never.
  const [deferredTrialFollowUps, setDeferredTrialFollowUps] = useState<string[]>([]);
  // The primer stays down for the rest of the session once answered, whatever the cooldown says.
  const [primerAnsweredThisSession, setPrimerAnsweredThisSession] = useState(false);
  const t = strings[state.language];
  const locale = localeForLanguage(state.language);

  const convert: ConvertFn = useMemo(
    () => makeConvert(state.isPro, state.currency, state.exchangeRates),
    [state.isPro, state.currency, state.exchangeRates],
  );

  useEffect(() => {
    const load = async () => {
      try {
        const v2 = await storage.getItem(storageKey);
        if (v2) {
          setState(migrateState(JSON.parse(v2) as State));
          return;
        }
        const v1 = await storage.getItem('subtrack-eu-state-v1');
        if (v1) {
          const parsed = migrateState(JSON.parse(v1) as State);
          const withoutDemo = {
            ...parsed,
            subscriptions: parsed.subscriptions.filter((s) => !s.id.endsWith('-demo')),
          };
          setState(withoutDemo);
        }
      } catch {
        /* keep defaults */
      } finally {
        setHasLoaded(true);
      }
    };
    load().catch(() => {});
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    storage.setItem(storageKey, JSON.stringify(state)).catch(() => {});
  }, [state, hasLoaded]);

  // Every screen reads useColorScheme(), so overriding the app-level scheme here re-themes the
  // whole app at once; null hands control back to the phone's own setting.
  useEffect(() => {
    if (!hasLoaded) return;
    Appearance.setColorScheme(state.themeMode === 'system' ? null : state.themeMode);
  }, [hasLoaded, state.themeMode]);

  const monthlyTotal = useMemo(
    () =>
      state.subscriptions
        .filter((s) => !s.isCancelled)
        .reduce((sum, s) => sum + monthly(s, convert), 0),
    [state.subscriptions, convert],
  );

  const bumpAddTabReset = useCallback(() => {
    setAddTabResetNonce((n) => n + 1);
  }, []);

  const addSubscription = useCallback(
    (sub: Subscription): boolean => {
      if (!state.isPro && state.subscriptions.filter((s) => !s.isCancelled).length >= 5) return false;
      const startedAt = sub.startedAt ?? new Date().toISOString();
      setState((prev) => ({
        ...prev,
        subscriptionsAdded: prev.subscriptionsAdded + 1,
        subscriptions: [
          normalizeSubscription({ ...sub, id: `${sub.id}-${Date.now()}`, startedAt }),
          ...prev.subscriptions,
        ],
      }));
      bumpAddTabReset();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      track.subscriptionAdded({
        name: sub.name,
        category: sub.category,
        billingCycle: sub.billingCycle,
        price: sub.defaultPrice,
        isFirst: state.subscriptionsAdded === 0,
      });
      return true;
    },
    [state.isPro, state.subscriptions, state.subscriptionsAdded, bumpAddTabReset],
  );

  const updateSubscription = useCallback((id: string, patch: Partial<Subscription>) => {
    setState((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.map((s) =>
        s.id === id ? normalizeSubscription({ ...s, ...patch, id: s.id }) : s,
      ),
    }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, []);

  const cancelSubscription = useCallback(
    (id: string) =>
      setState((prev) => ({
        ...prev,
        subscriptions: prev.subscriptions.map((s) =>
          s.id === id
            ? { ...s, isCancelled: true, cancelEffectiveMonth: computeCancelEffectiveMonth(s) }
            : s,
        ),
      })),
    [],
  );

  const removeSubscription = useCallback((id: string) => {
    setState((prev) => {
      const sub = prev.subscriptions.find((s) => s.id === id);
      if (sub) track.subscriptionRemoved({ name: sub.name, category: sub.category });
      return { ...prev, subscriptions: prev.subscriptions.filter((s) => s.id !== id) };
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  }, []);

  const updateSettings = useCallback((patch: Partial<Omit<State, 'isPro'>>) => {
    if (patch.language) track.languageChanged(patch.language);
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const refreshNotificationPermission = useCallback(async (): Promise<NotificationPermissionStatus> => {
    const status = await getNotificationPermissionStatus();
    setNotificationPermission(status);
    return status;
  }, []);

  useEffect(() => {
    refreshNotificationPermission().catch(() => {});
    const sub = AppState.addEventListener('change', (appState) => {
      if (appState === 'active') refreshNotificationPermission().catch(() => {});
    });
    return () => sub.remove();
  }, [refreshNotificationPermission]);

  useEffect(() => {
    if (!hasLoaded) return;
    scheduleAllReminders(state.subscriptions, state.reminderDays, t, locale, state.currency, convert).catch(() => {});
  }, [state.subscriptions, state.reminderDays, hasLoaded, t, notificationPermission, locale, state.currency, convert]);


  // Keep the Home Screen widget in step with whatever the app is showing.
  useEffect(() => {
    if (!hasLoaded) return;
    syncWidgetData(state.subscriptions, state.currency, locale, convert, t.monthly, t.freeTrialBadge).catch(() => {});
  }, [hasLoaded, state.subscriptions, state.currency, locale, convert, t.monthly, t.freeTrialBadge]);

  const enableNotifications = useCallback(
    async (source: 'primer' | 'banner' | 'settings' = 'settings'): Promise<NotificationPermissionStatus> => {
      await requestNotificationPermission();
      const status = await refreshNotificationPermission();
      track.notificationPermissionResult(status, source);
      return status;
    },
    [refreshNotificationPermission],
  );

  // Reconcile local isPro flag with the store's actual entitlement.
  useEffect(() => {
    configurePurchases();
    linkAnalyticsUser(posthog.getDistinctId());
    fetchCustomerInfo().then((info) => {
      if (info) setState((prev) => ({ ...prev, isPro: entitlementIsActive(info) }));
    });
    return addEntitlementListener((isPro) => setState((prev) => ({ ...prev, isPro })));
  }, []);

  // Prices are never hardcoded in copy: StoreKit / Play returns them already formatted for the
  // user's storefront currency, which is the only source that stays correct in every territory.
  useEffect(() => {
    fetchProPriceOptions().then(setProPriceOptions).catch(() => {});
  }, []);

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    const restored = await restorePurchasesRC();
    if (restored) setState((prev) => ({ ...prev, isPro: true }));
    return restored;
  }, []);

  const exportCsv = useCallback(async (): Promise<void> => {
    await exportCsvFile(state.subscriptions, state.currency, t);
  }, [state.subscriptions, state.currency, t]);

  const exportBackup = useCallback(async (): Promise<void> => {
    await exportBackupFile(state);
  }, [state]);

  const importBackup = useCallback(async (): Promise<'success' | 'cancelled' | 'invalid'> => {
    const json = await pickBackupFile();
    if (json === null) return 'cancelled';
    try {
      const parsed = JSON.parse(json);
      if (!Array.isArray(parsed.subscriptions)) return 'invalid';
      setState((prev) => migrateState({ ...initialState, ...parsed, isPro: prev.isPro }));
      return 'success';
    } catch {
      return 'invalid';
    }
  }, []);

  const resetAllData = useCallback(() => {
    setState((prev) => ({ ...prev, subscriptions: [] }));
  }, []);

  /**
   * The subscription whose free trial has ended and whose "did you cancel or continue?" prompt
   * is still unanswered. Oldest first, so a backlog is worked through in the order it built up.
   */
  const pendingTrialFollowUp = useMemo(() => {
    const now = Date.now();
    return (
      state.subscriptions
        .filter((s) => {
          if (!s.trialEndsAt || s.trialFollowUpAnsweredAt || s.isCancelled) return false;
          if (deferredTrialFollowUps.includes(s.id)) return false;
          const endedAgo = now - new Date(s.trialEndsAt).getTime();
          // Only ask about trials that ended recently. Anything older the user has long since
          // dealt with in real life, and asking would just be a queue of stale questions on
          // first launch after this feature ships.
          return endedAgo >= 0 && endedAgo <= TRIAL_FOLLOW_UP_WINDOW_MS;
        })
        .sort((a, b) => new Date(a.trialEndsAt!).getTime() - new Date(b.trialEndsAt!).getTime())[0] ?? null
    );
  }, [state.subscriptions, deferredTrialFollowUps]);

  const answerTrialFollowUp = useCallback(
    (id: string, answer: 'cancelled' | 'continuing' | 'later') => {
      if (answer === 'later') {
        setDeferredTrialFollowUps((prev) => (prev.includes(id) ? prev : [...prev, id]));
        return;
      }
      const answeredAt = new Date().toISOString();
      const sub = state.subscriptions.find((s) => s.id === id);
      if (sub) track.trialFollowUpAnswered({ name: sub.name, answer });
      setState((prev) => ({
        ...prev,
        subscriptions: prev.subscriptions.map((s) =>
          s.id !== id
            ? s
            : answer === 'cancelled'
              ? {
                  ...s,
                  trialFollowUpAnsweredAt: answeredAt,
                  isCancelled: true,
                  cancelEffectiveMonth: computeCancelEffectiveMonth(s),
                }
              : { ...s, trialFollowUpAnsweredAt: answeredAt },
        ),
      }));
    },
    [state.subscriptions],
  );

  /**
   * Reminders are the only thing that brings anyone back to a subscription tracker, so the
   * permission is asked for right after the first subscription is added — but through our own
   * sheet first, which explains what they'll get and can be dismissed without consequence.
   */
  const shouldShowNotificationPrimer = useMemo(() => {
    if (!hasLoaded || primerAnsweredThisSession || pendingTrialFollowUp) return false;
    if (notificationPermission !== 'undetermined' || state.reminderDays === 0) return false;
    if (!state.subscriptions.some((s) => !s.isCancelled)) return false;
    if (state.notificationPrimerAskCount >= PRIMER_MAX_ASKS) return false;
    const last = state.notificationPrimerLastAskedAt;
    return !last || Date.now() - new Date(last).getTime() >= PRIMER_COOLDOWN_MS;
  }, [
    hasLoaded,
    primerAnsweredThisSession,
    pendingTrialFollowUp,
    notificationPermission,
    state.reminderDays,
    state.subscriptions,
    state.notificationPrimerAskCount,
    state.notificationPrimerLastAskedAt,
  ]);

  const answerNotificationPrimer = useCallback(
    async (accepted: boolean): Promise<void> => {
      setPrimerAnsweredThisSession(true);
      track.notificationPrimerAnswered(accepted);
      if (accepted) {
        await enableNotifications('primer');
        return;
      }
      setState((prev) => ({
        ...prev,
        notificationPrimerAskCount: prev.notificationPrimerAskCount + 1,
        notificationPrimerLastAskedAt: new Date().toISOString(),
      }));
    },
    [enableNotifications],
  );

  const dismissWidgetTip = useCallback(() => {
    track.widgetTipDismissed();
    setState((prev) => ({ ...prev, widgetTipDismissed: true }));
  }, []);

  const markReviewAsked = useCallback(() => {
    setState((prev) => ({ ...prev, hasAskedForReview: true }));
  }, []);

  const recordDiagnosis = useCallback((record: DiagnosisRecord) => {
    setState((prev) => ({ ...prev, diagnosisHistory: [record, ...prev.diagnosisHistory] }));
  }, []);

  const refreshExchangeRates = useCallback(async (): Promise<void> => {
    const rates = await fetchExchangeRates();
    if (rates) {
      setState((prev) => ({ ...prev, exchangeRates: rates, exchangeRatesUpdatedAt: new Date().toISOString() }));
    }
  }, []);

  /**
   * Switching the display currency used to just relabel every amount with the new symbol — a
   * subscription typed in as €20 read as "¥20" the moment someone switched to yen, because
   * `defaultPrice` for a subscription with no explicit `currency` is stored *in whatever the
   * display currency was when it was added*, not in a fixed unit. Only subscriptions with their
   * own explicit `currency` (the Pro per-subscription billing-currency feature) are genuinely
   * billed in another currency and are left untouched here — `convert()` already retargets those
   * correctly on every render.
   */
  const changeCurrency = useCallback(
    async (code: CurrencyCode): Promise<'ok' | 'requires-pro' | 'rates-unavailable'> => {
      if (code === state.currency) return 'ok';
      if (!state.isPro && code !== 'EUR' && code !== 'USD') return 'requires-pro';

      // "Real-time" per the user's own request — always try a fresh rate rather than settling
      // for whatever was cached up to 12h ago, but fall back to the cache if the fetch fails so
      // a flaky connection doesn't block the change outright.
      const fresh = await fetchExchangeRates();
      const rates = fresh ?? state.exchangeRates;
      if (!rates) return 'rates-unavailable';

      const from = state.currency;
      setState((prev) => ({
        ...prev,
        currency: code,
        exchangeRates: rates,
        exchangeRatesUpdatedAt: fresh ? new Date().toISOString() : prev.exchangeRatesUpdatedAt,
        subscriptions: prev.subscriptions.map((s) => {
          if (s.currency) return s;
          const converted = convertAmount(s.defaultPrice, from, code, rates);
          const rounded = code === 'JPY' ? Math.round(converted) : Math.round(converted * 100) / 100;
          return { ...s, defaultPrice: rounded };
        }),
      }));
      return 'ok';
    },
    [state.currency, state.isPro, state.exchangeRates],
  );

  // Rates are fetched for everyone, not just Pro: the preset catalogue is priced in EUR, so
  // without them a JPY user browsing Add sees "EUR 20" rendered as a bare 20 with a yen sign.
  // Pro still gates per-subscription FX (see `convert`); this only makes the catalogue honest.
  useEffect(() => {
    if (!hasLoaded) return;
    if (ratesAreStale(state.exchangeRatesUpdatedAt)) {
      refreshExchangeRates().catch(() => {});
    }
  }, [hasLoaded, state.exchangeRatesUpdatedAt, refreshExchangeRates]);

  /**
   * Converts a preset catalogue price (always EUR — see data/servicePlans.ts) into the display
   * currency. Returns the currency actually used, because when no rate is available it is far
   * better to show a true "EUR 19.99" than a false "JPY 19.99".
   */
  const catalogPrice = useCallback(
    (eurAmount: number, localPrices?: LocalPrices): CatalogPrice => {
      // What the vendor actually charges in that market beats anything an exchange rate can
      // produce: Netflix Standard is EUR 13.99 / USD 19.99 / JPY 1590, and no rate maps between
      // them. Only fall back to converting when that market's price isn't known.
      const local = localPrices?.[state.currency];
      if (local !== undefined) return { amount: local, currency: state.currency, exact: true };

      const rate = state.exchangeRates?.[state.currency];
      if (state.currency === 'EUR' || !rate) return { amount: eurAmount, currency: 'EUR', exact: true };
      const converted = convertAmount(eurAmount, 'EUR', state.currency, state.exchangeRates);
      // Currencies without minor units read as noise at two decimals.
      const rounded = state.currency === 'JPY' ? Math.round(converted) : Math.round(converted * 100) / 100;
      return { amount: rounded, currency: state.currency, exact: false };
    },
    [state.currency, state.exchangeRates],
  );

  const priceHikes = useMemo(
    () =>
      detectPriceHikes(state.subscriptions, PRESET_SERVICES, catalogPrice, state.currency, state.dismissedPriceHikes),
    [state.subscriptions, catalogPrice, state.currency, state.dismissedPriceHikes],
  );

  /** Moves a subscription onto its plan's new price from today on. */
  const applyPriceHike = useCallback((hike: PriceHike) => {
    track.priceHikeAnswered(hike.subscription.name, hike.pct, true);
    setState((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.map((s) =>
        s.id === hike.subscription.id
          ? normalizeSubscription({ ...s, defaultPrice: hike.currentPrice, planChangedAt: new Date().toISOString() })
          : s,
      ),
    }));
  }, []);

  const dismissPriceHike = useCallback((hike: PriceHike) => {
    track.priceHikeAnswered(hike.subscription.name, hike.pct, false);
    setState((prev) => ({ ...prev, dismissedPriceHikes: [...prev.dismissedPriceHikes, hike.key] }));
  }, []);

  return {
    ...state,
    t,
    locale,
    monthlyTotal,
    annualTotal: monthlyTotal * 12,
    addSubscription,
    updateSubscription,
    cancelSubscription,
    removeSubscription,
    updateSettings,
    changeCurrency,
    restorePurchases,
    exportCsv,
    exportBackup,
    importBackup,
    resetAllData,
    recordDiagnosis,
    convert,
    catalogPrice,
    refreshExchangeRates,
    notificationPermission,
    enableNotifications,
    shouldShowNotificationPrimer,
    answerNotificationPrimer,
    dismissWidgetTip,
    priceHikes,
    applyPriceHike,
    dismissPriceHike,
    proPriceOptions,
    pendingTrialFollowUp,
    answerTrialFollowUp,
    shouldAskForReview: state.subscriptionsAdded >= 3 && !state.hasAskedForReview,
    markReviewAsked,
    presetServices: PRESET_SERVICES,
    addTabResetNonce,
    bumpAddTabReset,
  };
});
