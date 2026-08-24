import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';
import { PRESET_SERVICES } from '@/data/services';
import { localeForLanguage, strings } from '@/i18n/strings';
import { Language, Subscription, VatMode } from '@/types/subscription';
import { track } from '@/utils/analytics';
import { convertAmount, CurrencyCode, ExchangeRates } from '@/utils/currency';
import { exportBackupFile, exportCsvFile, pickBackupFile } from '@/utils/dataExport';
import { DiagnosisRecord } from '@/utils/diagnosis';
import { fetchExchangeRates, ratesAreStale } from '@/utils/exchangeRates';
import {
  getNotificationPermissionStatus,
  NotificationPermissionStatus,
  requestNotificationPermission,
  scheduleAllReminders,
} from '@/utils/notifications';
import {
  addEntitlementListener,
  configurePurchases,
  entitlementIsActive,
  fetchCustomerInfo,
  restorePurchases as restorePurchasesRC,
} from '@/utils/purchases';
import { computeCancelEffectiveMonth, ConvertFn, monthly, normalizeSubscription } from '@/utils/subscription';

const storageKey = 'subtrack-eu-state-v2';

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
};

const migrateState = (raw: State): State => ({
  ...raw,
  currency: raw.currency ?? 'EUR',
  diagnosisHistory: raw.diagnosisHistory ?? [],
  exchangeRates: raw.exchangeRates ?? null,
  exchangeRatesUpdatedAt: raw.exchangeRatesUpdatedAt ?? null,
  subscriptions: raw.subscriptions.map(normalizeSubscription),
});

export function detectDeviceLanguage(): Language {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    const lang = locale.split(/[-_]/)[0].toLowerCase();
    if (lang === 'de') return 'de';
    if (lang === 'fr') return 'fr';
    if (lang === 'es') return 'es';
    return 'en';
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
  currency: 'EUR',
  reminderDays: 3,
  hasSeenOnboarding: false,
  isPro: false,
  diagnosisHistory: [],
  exchangeRates: null,
  exchangeRatesUpdatedAt: null,
};

export const [SubTrackProvider, useSubTrack] = createContextHook(() => {
  const [state, setState] = useState<State>(initialState);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [addTabResetNonce, setAddTabResetNonce] = useState(0);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermissionStatus>('undetermined');
  const t = strings[state.language];
  const locale = localeForLanguage(state.language);

  // Real-time FX conversion is a Pro perk; everyone else sees native amounts unconverted.
  const convert: ConvertFn = useCallback(
    (amount: number, fromCurrency?: CurrencyCode) => {
      const from = fromCurrency ?? state.currency;
      if (!state.isPro || from === state.currency) return amount;
      return convertAmount(amount, from, state.currency, state.exchangeRates);
    },
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
      });
      return true;
    },
    [state.isPro, state.subscriptions, bumpAddTabReset],
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

  const enableNotifications = useCallback(async (): Promise<NotificationPermissionStatus> => {
    await requestNotificationPermission();
    return refreshNotificationPermission();
  }, [refreshNotificationPermission]);

  // Reconcile local isPro flag with the store's actual entitlement.
  useEffect(() => {
    configurePurchases();
    fetchCustomerInfo().then((info) => {
      if (info) setState((prev) => ({ ...prev, isPro: entitlementIsActive(info) }));
    });
    return addEntitlementListener((isPro) => setState((prev) => ({ ...prev, isPro })));
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

  const recordDiagnosis = useCallback((record: DiagnosisRecord) => {
    setState((prev) => ({ ...prev, diagnosisHistory: [record, ...prev.diagnosisHistory] }));
  }, []);

  const refreshExchangeRates = useCallback(async (): Promise<void> => {
    const rates = await fetchExchangeRates();
    if (rates) {
      setState((prev) => ({ ...prev, exchangeRates: rates, exchangeRatesUpdatedAt: new Date().toISOString() }));
    }
  }, []);

  // Pro-only: keep FX rates fresh so converted totals stay accurate.
  useEffect(() => {
    if (!hasLoaded || !state.isPro) return;
    if (ratesAreStale(state.exchangeRatesUpdatedAt)) {
      refreshExchangeRates().catch(() => {});
    }
  }, [hasLoaded, state.isPro, state.exchangeRatesUpdatedAt, refreshExchangeRates]);

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
    restorePurchases,
    exportCsv,
    exportBackup,
    importBackup,
    resetAllData,
    recordDiagnosis,
    convert,
    refreshExchangeRates,
    notificationPermission,
    enableNotifications,
    presetServices: PRESET_SERVICES,
    addTabResetNonce,
    bumpAddTabReset,
  };
});
