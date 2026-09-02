import { Href, router } from 'expo-router';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { ServiceLogo } from '@/components/ServiceLogo';
import { theme } from '@/constants/theme';
import { useSubTrack } from '@/context/SubTrackContext';

/**
 * Asked the day after a free trial ends, either because the user tapped the trial follow-up
 * notification or simply because they reopened the app. The notification can't collect an
 * answer on its own, so it only tells them to come back — this is where the answer is recorded.
 *
 * "I'm continuing" hands off to the service screen in plan-update mode, since the trial price
 * (nothing) is never what they're paying now and the real plan has to be picked.
 */
export function TrialFollowUpModal() {
  const { t, pendingTrialFollowUp, answerTrialFollowUp } = useSubTrack();
  const dark = useColorScheme() === 'dark';

  if (!pendingTrialFollowUp) return null;
  const sub = pendingTrialFollowUp;

  const onContinue = () => {
    answerTrialFollowUp(sub.id, 'continuing');
    // Instances are stored as `<presetId>-<timestamp>`; the service screen is keyed by preset.
    const presetId = sub.id.replace(/-\d+$/, '');
    router.push(`/service/${presetId}?continueSubId=${encodeURIComponent(sub.id)}` as Href);
  };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={() => answerTrialFollowUp(sub.id, 'later')}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, dark && styles.sheetDark]}>
          <View style={styles.header}>
            <ServiceLogo service={sub} size={44} />
            <Text style={[styles.title, dark && styles.textLight]}>{t.trialFollowUpTitle}</Text>
          </View>

          <Text style={styles.body}>{t.trialFollowUpBody.replace('{name}', sub.name)}</Text>

          <Pressable style={styles.primary} onPress={onContinue}>
            <Text style={styles.primaryText}>{t.trialFollowUpContinue}</Text>
          </Pressable>

          <Pressable style={styles.secondary} onPress={() => answerTrialFollowUp(sub.id, 'cancelled')}>
            <Text style={styles.secondaryText}>{t.trialFollowUpCancelled}</Text>
          </Pressable>

          <Pressable style={styles.ghost} onPress={() => answerTrialFollowUp(sub.id, 'later')}>
            <Text style={styles.ghostText}>{t.trialFollowUpLater}</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 20, fontWeight: '700', color: theme.text, flex: 1 },
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
  secondary: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D64545',
  },
  secondaryText: { color: '#D64545', fontWeight: '700', fontSize: 16 },
  ghost: { alignItems: 'center', paddingVertical: 10 },
  ghostText: { color: theme.textMuted, fontWeight: '600' },
});
