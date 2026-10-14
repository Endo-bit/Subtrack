import { BellRing } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { theme } from '@/constants/theme';
import { useSubTrack } from '@/context/SubTrackContext';
import { track } from '@/utils/analytics';

/**
 * Our own "can we remind you?" sheet, shown before the one-shot iOS prompt. Previously the system
 * prompt fired unannounced the instant subscription #1 was saved; a reflexive "Don't Allow" there
 * can never be asked again, and without notifications nothing brings anyone back. Saying
 * "Not now" here costs nothing — it is asked again a few days later.
 */
export function NotificationPrimer() {
  const { t, shouldShowNotificationPrimer, answerNotificationPrimer, subscriptions, reminderDays, notificationPrimerAskCount } =
    useSubTrack();
  const dark = useColorScheme() === 'dark';

  useEffect(() => {
    if (shouldShowNotificationPrimer) track.notificationPrimerShown(notificationPrimerAskCount + 1);
  }, [shouldShowNotificationPrimer, notificationPrimerAskCount]);

  if (!shouldShowNotificationPrimer) return null;
  // Newest first: the subscription just added is the one the user has in mind right now.
  const example = subscriptions.find((s) => !s.isCancelled);

  return (
    <Modal visible animationType="slide" transparent onRequestClose={() => answerNotificationPrimer(false)}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, dark && styles.sheetDark]}>
          <View style={styles.iconBadge}>
            <BellRing size={28} color={theme.accent} strokeWidth={1.75} />
          </View>
          <Text style={[styles.title, dark && styles.textLight]}>{t.primerTitle}</Text>
          <Text style={styles.body}>
            {t.primerBody.replace('{days}', String(reminderDays)).replace('{name}', example?.name ?? 'SubTrack')}
          </Text>
          <Pressable style={styles.primary} onPress={() => answerNotificationPrimer(true)} accessibilityRole="button">
            <Text style={styles.primaryText}>{t.primerEnable}</Text>
          </Pressable>
          <Pressable style={styles.ghost} onPress={() => answerNotificationPrimer(false)} accessibilityRole="button">
            <Text style={styles.ghostText}>{t.primerLater}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(45,36,32,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: theme.cream,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    paddingBottom: 30,
    gap: 12,
  },
  sheetDark: { backgroundColor: theme.creamDark },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: theme.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 22, fontWeight: '700', color: theme.text },
  textLight: { color: '#F5EDE8' },
  body: { fontSize: 15, lineHeight: 22, color: theme.textMuted },
  primary: {
    backgroundColor: theme.accent,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  ghost: { alignItems: 'center', paddingVertical: 10 },
  ghostText: { color: theme.textMuted, fontWeight: '600' },
});
