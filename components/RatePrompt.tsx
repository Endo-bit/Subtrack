import * as StoreReview from 'expo-store-review';
import React from 'react';
import { Linking, Modal, Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { theme } from '@/constants/theme';
import { useSubTrack } from '@/context/SubTrackContext';
import { track } from '@/utils/analytics';

/** Deep link used when the in-app review sheet isn't available (it's rate-limited by iOS). */
const WRITE_REVIEW_URL = 'itms-apps://apps.apple.com/app/id6791565138?action=write-review';

/**
 * Offered once, after the third subscription is added — the first point where someone has
 * clearly got value out of the app. Both buttons are neutral about sentiment: this is a
 * "now is a good moment" nudge, not a filter that routes unhappy users away from the store.
 */
export function RatePrompt() {
  const { t, shouldAskForReview, markReviewAsked, pendingTrialFollowUp } = useSubTrack();
  const dark = useColorScheme() === 'dark';

  // Never stack on top of the post-trial question; that one is time-sensitive, this isn't.
  if (!shouldAskForReview || pendingTrialFollowUp) return null;

  const onRate = async () => {
    markReviewAsked();
    track.reviewPromptAnswered(true);
    try {
      if (await StoreReview.isAvailableAsync()) {
        await StoreReview.requestReview();
        return;
      }
    } catch {
      /* fall through to the store link */
    }
    Linking.openURL(WRITE_REVIEW_URL).catch(() => {});
  };

  const dismiss = () => {
    markReviewAsked();
    track.reviewPromptAnswered(false);
  };

  return (
    <Modal visible animationType="fade" transparent onRequestClose={dismiss}>
      <View style={styles.overlay}>
        <View style={[styles.card, dark && styles.cardDark]}>
          <Text style={[styles.title, dark && styles.textLight]}>{t.rateTitle}</Text>
          <Text style={styles.body}>{t.rateBody}</Text>

          <Pressable style={styles.primary} onPress={onRate}>
            <Text style={styles.primaryText}>{t.rateNow}</Text>
          </Pressable>
          <Pressable style={styles.ghost} onPress={dismiss}>
            <Text style={styles.ghostText}>{t.rateLater}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(45,36,32,0.5)',
    justifyContent: 'center',
    padding: 28,
  },
  card: { backgroundColor: theme.cream, borderRadius: 24, padding: 24, gap: 10 },
  cardDark: { backgroundColor: theme.creamDark },
  title: { fontSize: 20, fontWeight: '700', color: theme.text },
  textLight: { color: '#F5EDE8' },
  body: { fontSize: 15, lineHeight: 22, color: theme.textMuted },
  primary: {
    backgroundColor: theme.accent,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 6,
  },
  primaryText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  ghost: { alignItems: 'center', paddingVertical: 8 },
  ghostText: { color: theme.textMuted, fontWeight: '600' },
});
