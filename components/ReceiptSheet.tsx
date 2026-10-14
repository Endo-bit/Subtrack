import * as Sharing from 'expo-sharing';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { ReceiptCard, ReceiptData } from '@/components/ReceiptCard';
import { theme } from '@/constants/theme';
import { useSubTrack } from '@/context/SubTrackContext';
import { track } from '@/utils/analytics';
import { totalLifetimeSpend, workHours } from '@/utils/insights';
import { monthly } from '@/utils/subscription';

/**
 * "What's on your receipt?" — the share format people already post by hand ("I pay for these 8
 * subscriptions, ~$100/month"). Preview and exported image are the same component.
 */
export function ReceiptSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t, currency, locale, subscriptions, convert, hourlyWage, updateSettings } = useSubTrack();
  const dark = useColorScheme() === 'dark';
  const cardRef = useRef<View>(null);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wageText, setWageText] = useState(hourlyWage ? String(hourlyWage) : '');

  useEffect(() => {
    if (visible) track.receiptOpened();
  }, [visible]);

  const data: ReceiptData = useMemo(() => {
    const items = subscriptions
      .filter((s) => !s.isCancelled)
      .sort((a, b) => monthly(b, convert) - monthly(a, convert));
    const monthlyTotal = items.reduce((sum, s) => sum + monthly(s, convert), 0);
    return {
      items,
      monthlyTotal,
      yearlyTotal: monthlyTotal * 12,
      lifetimeTotal: totalLifetimeSpend(items, convert),
      workHours: workHours(monthlyTotal * 12, hourlyWage),
    };
  }, [subscriptions, convert, hourlyWage]);

  const onWageChange = (text: string) => {
    setWageText(text);
    const n = Number(text.replace(',', '.'));
    updateSettings({ hourlyWage: text.trim() === '' || Number.isNaN(n) || n <= 0 ? null : n });
  };

  const onShare = async () => {
    setSharing(true);
    setError(null);
    try {
      const uri = await captureRef(cardRef, { format: 'png', quality: 1, result: 'tmpfile' });
      if (!(await Sharing.isAvailableAsync())) {
        setError(t.shareUnavailable);
        return;
      }
      await Sharing.shareAsync(uri, { mimeType: 'image/png', UTI: 'public.png' });
      track.receiptShared({
        subscriptions: data.items.length,
        yearly: Math.round(data.yearlyTotal),
        hasWage: data.workHours !== null,
      });
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
          <ScrollView
            style={styles.previewScroll}
            contentContainerStyle={styles.preview}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View ref={cardRef} collapsable={false} style={styles.capture}>
              <ReceiptCard data={data} t={t} currency={currency} locale={locale} convert={convert} />
            </View>
          </ScrollView>

          <Text style={styles.wageLabel}>{t.receiptWageLabel}</Text>
          <TextInput
            value={wageText}
            onChangeText={onWageChange}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={theme.textMuted}
            style={[styles.input, dark && styles.inputDark]}
          />

          {!!error && <Text style={styles.error}>{error}</Text>}

          <Pressable style={styles.primary} onPress={onShare} disabled={sharing} accessibilityRole="button">
            {sharing ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryText}>{t.receiptShare}</Text>}
          </Pressable>
          <Pressable style={styles.ghost} onPress={onClose} accessibilityRole="button">
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
    maxHeight: '94%',
    gap: 6,
  },
  sheetDark: { backgroundColor: theme.creamDark },
  previewScroll: { flexShrink: 1 },
  preview: { alignItems: 'center', paddingVertical: 10 },
  // A dark backdrop behind the paper so the captured image reads as a receipt on any feed.
  capture: { backgroundColor: '#1D140E', padding: 18, borderRadius: 4 },
  wageLabel: { fontSize: 13, color: theme.textMuted, marginTop: 4 },
  input: {
    backgroundColor: theme.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.text,
  },
  inputDark: { backgroundColor: theme.cardDark, color: '#FFF' },
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
