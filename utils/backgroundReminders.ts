import AsyncStorage from '@react-native-async-storage/async-storage';
import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import { localeForLanguage, strings } from '@/i18n/strings';
import { Language, Subscription } from '@/types/subscription';
import { CurrencyCode, detectDeviceCurrency, ExchangeRates } from '@/utils/currency';
import { scheduleAllReminders } from '@/utils/notifications';
import { STATE_STORAGE_KEY } from '@/utils/persistedState';
import { makeConvert, normalizeSubscription } from '@/utils/subscription';

/**
 * Reminders are OS-scheduled, so they arrive with the app closed — but iOS holds at most 64
 * pending ones, so the queue only reaches so far ahead. This task tops it up in the background
 * (iOS/Android decide exactly when; typically about once a day) so reminders keep arriving for
 * people who never reopen the app. The refill notice in utils/notifications.ts is the fallback
 * for when the OS doesn't run it in time.
 */
export const REMINDER_REFRESH_TASK = 'subtrack-reminder-refresh';

/** The slice of the persisted app state that rebuilding reminders needs. */
type PersistedReminderState = {
  subscriptions?: Subscription[];
  language?: Language;
  currency?: CurrencyCode;
  reminderDays?: 0 | 1 | 3 | 7;
  isPro?: boolean;
  exchangeRates?: ExchangeRates | null;
};

/** Rebuilds the reminder queue from saved state, exactly as the app does on launch. */
export async function refreshRemindersFromStorage(): Promise<void> {
  const raw = await AsyncStorage.getItem(STATE_STORAGE_KEY);
  if (!raw) return;
  const state = JSON.parse(raw) as PersistedReminderState;
  const language = state.language ?? 'en';
  const currency = state.currency ?? detectDeviceCurrency();
  await scheduleAllReminders(
    (state.subscriptions ?? []).map(normalizeSubscription),
    state.reminderDays ?? 3,
    strings[language],
    localeForLanguage(language),
    currency,
    makeConvert(state.isPro ?? false, currency, state.exchangeRates ?? null),
  );
}

// Must be defined at module scope: the OS can launch the app headless just to run this.
if (Platform.OS !== 'web') {
  TaskManager.defineTask(REMINDER_REFRESH_TASK, async () => {
    try {
      await refreshRemindersFromStorage();
      return BackgroundTask.BackgroundTaskResult.Success;
    } catch {
      return BackgroundTask.BackgroundTaskResult.Failed;
    }
  });
}

/** Registers the periodic refresh once; registration persists across launches. */
export async function ensureReminderRefreshRegistered(): Promise<void> {
  if (Platform.OS === 'web') return;
  const status = await BackgroundTask.getStatusAsync();
  if (status !== BackgroundTask.BackgroundTaskStatus.Available) return;
  if (await TaskManager.isTaskRegisteredAsync(REMINDER_REFRESH_TASK)) return;
  // Minutes. A floor, not a schedule — the OS picks the actual time.
  await BackgroundTask.registerTaskAsync(REMINDER_REFRESH_TASK, { minimumInterval: 12 * 60 });
}
