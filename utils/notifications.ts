import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Strings } from '@/i18n/strings';
import { Subscription } from '@/types/subscription';
import { CurrencyCode, formatMoney } from '@/utils/currency';
import { computeNextBillingFromStart, ConvertFn } from '@/utils/subscription';

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

/** A billing/trial date to remind about, `daysBefore` days ahead at 9am local time. */
function resolveTriggerDate(target: Date, daysBefore: number): { date: Date; isCatchUp: boolean } | null {
  if (target.getTime() <= Date.now()) return null;
  const trigger = new Date(target);
  trigger.setDate(trigger.getDate() - daysBefore);
  trigger.setHours(9, 0, 0, 0);
  // The 9am reminder slot already passed today, but the billing/trial date itself
  // hasn't — fire soon instead of silently dropping the reminder for this cycle.
  if (trigger.getTime() <= Date.now()) return { date: new Date(Date.now() + 5000), isCatchUp: true };
  return { date: trigger, isCatchUp: false };
}

// scheduleAllReminders cancels and rebuilds every pending notification on every call — including
// ones fired just because an unrelated subscription was added/edited/removed. Without this guard,
// any occurrence whose reminder slot already passed today would re-trigger the "fire soon" catch-up
// above on every single rebuild, spamming a notification for every upcoming payment each time the
// user touches any subscription. Keyed per occurrence so it only suppresses re-firing the exact same
// one; resets on app restart, matching the original once-per-reopen intent.
const catchUpFired = new Set<string>();

// How many future billing occurrences to pre-schedule per subscription. Local notifications are
// one-shot DATE triggers, and rescheduling only happens when the app is reopened (see
// SubTrackContext's load effect) — without pre-scheduling several cycles ahead, a subscription's
// reminder would silently stop firing after the first cycle if the user doesn't reopen the app
// in between billing dates.
const MAX_OCCURRENCES_PER_SUB = 6;
// iOS caps pending local notifications at 64; stay comfortably under that across all subscriptions.
const MAX_TOTAL_NOTIFICATIONS = 60;

/** Cancels all scheduled reminders and reschedules up to a few cycles ahead per active subscription. */
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

  const active = subscriptions.filter((s) => !s.isCancelled);
  let scheduledCount = 0;

  for (const sub of active) {
    if (scheduledCount >= MAX_TOTAL_NOTIFICATIONS) break;

    const price = formatMoney(convert(sub.defaultPrice, sub.currency), displayCurrency);
    const trialEndsAt = sub.trialEndsAt ? new Date(sub.trialEndsAt) : null;

    const anchor = new Date(sub.startedAt ?? sub.nextBillingDate);
    let occurrence = new Date(sub.nextBillingDate);
    for (let i = 0; i < MAX_OCCURRENCES_PER_SUB && scheduledCount < MAX_TOTAL_NOTIFICATIONS; i++) {
      // Skip occurrences that fall inside the free trial — nothing is actually charged then;
      // the trial-ending notification below covers that transition instead.
      const inTrial = trialEndsAt !== null && occurrence.getTime() < trialEndsAt.getTime();
      const resolved = inTrial ? null : resolveTriggerDate(occurrence, reminderDays);
      const occurrenceKey = `${sub.id}|${occurrence.toISOString().slice(0, 10)}`;
      if (resolved && !(resolved.isCatchUp && catchUpFired.has(occurrenceKey))) {
        if (resolved.isCatchUp) catchUpFired.add(occurrenceKey);
        await Notifications.scheduleNotificationAsync({
          content: {
            title: t.reminderNotificationTitle.replace('{name}', sub.name).replace('{days}', String(reminderDays)),
            body: t.reminderNotificationBody.replace('{price}', price),
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: resolved.date,
            channelId: REMINDER_CHANNEL_ID,
          },
        });
        scheduledCount++;
      }
      // Walk forward to the following billing occurrence for this subscription's cycle.
      occurrence = computeNextBillingFromStart(
        anchor,
        sub.billingCycle,
        new Date(occurrence.getTime() + 86400000),
      );
    }

    if (trialEndsAt && scheduledCount < MAX_TOTAL_NOTIFICATIONS) {
      const resolvedTrial = resolveTriggerDate(trialEndsAt, reminderDays);
      const trialKey = `${sub.id}|trial|${trialEndsAt.toISOString().slice(0, 10)}`;
      if (resolvedTrial && !(resolvedTrial.isCatchUp && catchUpFired.has(trialKey))) {
        if (resolvedTrial.isCatchUp) catchUpFired.add(trialKey);
        await Notifications.scheduleNotificationAsync({
          content: {
            title: t.trialEndingNotificationTitle
              .replace('{name}', sub.name)
              .replace('{date}', trialEndsAt.toLocaleDateString(locale)),
            body: t.trialEndingNotificationBody.replace('{price}', price),
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: resolvedTrial.date,
            channelId: REMINDER_CHANNEL_ID,
          },
        });
        scheduledCount++;
      }
    }
  }
}
