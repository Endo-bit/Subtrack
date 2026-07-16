import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Strings } from '@/i18n/strings';
import { Subscription } from '@/types/subscription';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

let permissionRequested = false;

async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (permissionRequested) return false;
  permissionRequested = true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

/** Cancels all scheduled reminders and reschedules one per active subscription. */
export async function scheduleAllReminders(
  subscriptions: Subscription[],
  reminderDays: 0 | 1 | 3 | 7,
  t: Strings,
): Promise<void> {
  if (Platform.OS === 'web') return;

  await Notifications.cancelAllScheduledNotificationsAsync();
  if (reminderDays === 0) return;

  const granted = await ensurePermission();
  if (!granted) return;

  const active = subscriptions.filter((s) => !s.isCancelled);
  for (const sub of active) {
    const triggerDate = new Date(sub.nextBillingDate);
    triggerDate.setDate(triggerDate.getDate() - reminderDays);
    triggerDate.setHours(9, 0, 0, 0);
    if (triggerDate.getTime() <= Date.now()) continue;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: sub.name,
        body: t.reminderNotificationBody.replace('{name}', sub.name),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
  }
}
