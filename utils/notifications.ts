import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Strings } from '@/i18n/strings';
import { Subscription } from '@/types/subscription';
import { CurrencyCode } from '@/utils/currency';
import {
  buildReminderCandidates,
  dayKey,
  selectReminders,
} from '@/utils/reminderSchedule';
import { ConvertFn } from '@/utils/subscription';

export {
  parseReminderPayload,
  type ReminderKind,
  type ReminderPayload,
} from '@/utils/reminderSchedule';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const REMINDER_CHANNEL_ID = 'reminders';

/** Android 8+ requires a channel with real importance or notifications post silently/invisibly. */
async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: 'Billing reminders',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 200],
  });
}

/** 'granted' | 'denied' | 'undetermined' | 'unsupported' (web). */
export type NotificationPermissionStatus = 'granted' | 'denied' | 'undetermined' | 'unsupported';

export async function getNotificationPermissionStatus(): Promise<NotificationPermissionStatus> {
  if (Platform.OS === 'web') return 'unsupported';
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return 'granted';
  return current.canAskAgain ? 'undetermined' : 'denied';
}

/** Shows the OS prompt. Only works while status is 'undetermined' — once denied, iOS/Android won't re-prompt. */
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

/* ── Catch-up ledger ──────────────────────────────────────────────────────
 * scheduleAllReminders() cancels and rebuilds every pending notification on every call —
 * including calls triggered by an unrelated subscription being edited. Without a record of
 * which missed slots have already fired, every rebuild would re-fire the catch-up for every
 * slot missed today, spamming the user each time they touch anything. The ledger is persisted
 * rather than in-memory because reopening the app is exactly when a rebuild happens — an
 * in-memory set resets on every launch and so suppresses nothing in practice.
 */
const CATCH_UP_STORAGE_KEY = 'subtrack-catchup-fired-v1';
/** Entries are keyed by calendar day; anything older than this can never re-fire, so drop it. */
const CATCH_UP_RETENTION_DAYS = 45;

let catchUpCache: Set<string> | null = null;

async function loadCatchUpLedger(): Promise<Set<string>> {
  if (catchUpCache) return catchUpCache;
  try {
    const raw = await AsyncStorage.getItem(CATCH_UP_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    catchUpCache = new Set(Array.isArray(parsed) ? (parsed as string[]) : []);
  } catch {
    catchUpCache = new Set();
  }
  return catchUpCache;
}

async function saveCatchUpLedger(ledger: Set<string>): Promise<void> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - CATCH_UP_RETENTION_DAYS);
  const cutoffKey = dayKey(cutoff);
  // Key format is `id|kind|YYYY-MM-DD`, so the trailing segment compares as a date.
  const kept = Array.from(ledger).filter((k) => (k.split('|')[2] ?? '') >= cutoffKey);
  catchUpCache = new Set(kept);
  try {
    await AsyncStorage.setItem(CATCH_UP_STORAGE_KEY, JSON.stringify(kept));
  } catch {
    /* the ledger is an optimisation, not correctness-critical */
  }
}

/**
 * Cancels all scheduled reminders and reschedules the soonest ones across every active
 * subscription: the user's chosen days-before reminder, the billing day itself, and — for a
 * free trial — a warning, a last-day alert, and the next-day "did you cancel?" follow-up.
 *
 * These are OS-scheduled one-shot triggers, so they keep arriving whether or not the app is
 * ever reopened; this call only ever refreshes the queue.
 */
export async function scheduleAllReminders(
  subscriptions: Subscription[],
  reminderDays: 0 | 1 | 3 | 7,
  t: Strings,
  locale: string,
  displayCurrency: CurrencyCode,
  convert: ConvertFn,
): Promise<void> {
  if (Platform.OS === 'web') return;

  await Notifications.cancelAllScheduledNotificationsAsync();
  if (reminderDays === 0) return;

  const status = await getNotificationPermissionStatus();
  if (status !== 'granted') return;

  await ensureAndroidChannel();

  const ledger = await loadCatchUpLedger();
  const now = Date.now();
  const candidates = buildReminderCandidates(
    subscriptions,
    reminderDays,
    t,
    locale,
    displayCurrency,
    convert,
  );
  const { scheduled, catchUpKeys } = selectReminders(candidates, ledger, now);

  for (const c of scheduled) {
    const isCatchUp = c.date.getTime() <= now;
    await Notifications.scheduleNotificationAsync({
      content: { title: c.title, body: c.body, data: c.data },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        // Overdue slots can't be scheduled in the past — fire them in a few seconds instead.
        date: isCatchUp ? new Date(now + 15000) : c.date,
        channelId: REMINDER_CHANNEL_ID,
      },
    });
  }

  if (catchUpKeys.length > 0) {
    for (const key of catchUpKeys) ledger.add(key);
    await saveCatchUpLedger(ledger);
  }
}
