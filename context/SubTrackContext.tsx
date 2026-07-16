import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { PRESET_SERVICES } from '@/data/services';
import { localeForLanguage, strings } from '@/i18n/strings';
import { Language, Subscription, VatMode } from '@/types/subscription';
import { track } from '@/utils/analytics';
import { CurrencyCode } from '@/utils/currency';
import { scheduleAllReminders } from '@/utils/notifications';
import {
  addEntitlementListener,
  configurePurchases,
  entitlementIsActive,
  fetchCustomerInfo,
  restorePurchases as restorePurchasesRC,
} from '@/utils/purchases';
import { normalizeSubscription } from '@/utils/subscription';

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
  savedTotal: number;
};

const migrateState = (raw: State): State => ({
  ...raw,
  currency: raw.currency ?? 'EUR',
  subscriptions: raw.subscriptions.map(normalizeSubscription),
});

function detectDeviceLanguage(): Language {
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
  savedTotal: 0,
};

export const [SubTrackProvider, useSubTrack] = createContextHook(() => {
  const [state, setState] = useState<State>(initialState);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [addTabResetNonce, setAddTabResetNonce] = useState(0);
  const t = strings[state.language];
  const locale = localeForLanguage(state.language);

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
        .reduce(
          (sum, s) =>
            sum +
            (s.billingCycle === 'annual'
              ? s.defaultPrice / 12
              : s.billingCycle === 'quarterly'
                ? s.defaultPrice / 3
                : s.defaultPrice),
          0,
        ),
    [state.subscriptions],
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
        savedTotal: prev.savedTotal + (prev.subscriptions.find((s) => s.id === id)?.defaultPrice ?? 0),
        subscriptions: prev.subscriptions.map((s) => (s.id === id ? { ...s, isCancelled: true } : s)),
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

  useEffect(() => {
    if (!hasLoaded) return;
    scheduleAllReminders(state.subscriptions, state.reminderDays, t).catch(() => {});
  }, [state.subscriptions, state.reminderDays, hasLoaded, t]);

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
    presetServices: PRESET_SERVICES,
    addTabResetNonce,
    bumpAddTabReset,
  };
});
