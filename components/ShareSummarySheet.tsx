import * as Sharing from 'expo-sharing';
import React, { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { ShareSummaryCard } from '@/components/ShareSummaryCard';
import { theme } from '@/constants/theme';
import { useSubTrack } from '@/context/SubTrackContext';
import { track } from '@/utils/analytics';
import { buildShareSummary } from '@/utils/shareSummary';

/**
 * Shows a live preview of the shareable card and hands the captured PNG to the system share
 * sheet. The preview and the exported image are the same component, so what the user sees is
 * exactly what gets shared.
 *
 * `source` is only for analytics — it distinguishes the Settings entry point from the one
 * offered at the end of a check-in.
 */
export function ShareSummarySheet({
  visible,
  onClose,
  source,
}: {
  visible: boolean;
  onClose: () => void;
  source: string;
}) {
  const { t, currency, subscriptions, diagnosisHistory, convert } = useSubTrack();
  const dark = useColorScheme() === 'dark';
  const cardRef = useRef<View>(null);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const data = useMemo(
    () => buildShareSummary(subscriptions, diagnosisHistory, convert),
    [subscriptions, diagnosisHistory, convert],
  );

  const onShare = async () => {
    setSharing(true);
    setError(null);
    try {
      // captureRef needs the view mounted and laid out, which it is — the card is the visible
      // preview above the button, not an offscreen clone.
      const uri = await captureRef(cardRef, { format: 'png', quality: 1, result: 'tmpfile' });
      if (!(await Sharing.isAvailableAsync())) {
        setError(t.shareUnavailable);
        return;
      }
      await Sharing.shareAsync(uri, { mimeType: 'image/png', UTI: 'public.png' });
      track.summaryShared(source);
      onClose();
    } catch {
      setError(t.shareUnavailable);
    } finally {
      setSharing(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, dark && styles.sheetDark]}>
          <Text style={[styles.title, dark && styles.textLight]}>{t.shareTitle}</Text>
          <Text style={styles.subtitle}>{t.shareSubtitle}</Text>

          <ScrollView
            style={styles.previewScroll}
            contentContainerStyle={styles.preview}
            showsVerticalScrollIndicator={false}
          >
            <View ref={cardRef} collapsable={false}>
              <ShareSummaryCard data={data} t={t} currency={currency} />
            </View>
          </ScrollView>

          {!!error && <Text style={styles.error}>{error}</Text>}

          <Pressable style={styles.primary} onPress={onShare} disabled={sharing}>
            {sharing ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.primaryText}>{t.shareCta}</Text>
            )}
          </Pressable>
          <Pressable style={styles.ghost} onPress={onClose}>
            <Text style={styles.ghostText}>{t.cancel}</Text>
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
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    maxHeight: '92%',
    gap: 6,
  },
  sheetDark: { backgroundColor: theme.creamDark },
  title: { fontSize: 22, fontWeight: '700', color: theme.text },
  textLight: { color: '#F5EDE8' },
  subtitle: { fontSize: 14, color: theme.textMuted },
  // Without flexShrink the ScrollView sizes to its content and pushes the share button off the
  // bottom of the sheet instead of scrolling inside the remaining space.
  previewScroll: { flexShrink: 1 },
  preview: { alignItems: 'center', paddingVertical: 14 },
  error: { color: '#D64545', fontWeight: '600', fontSize: 13, textAlign: 'center' },
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
