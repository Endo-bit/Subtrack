import { TrendingUp } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { theme, type as t_ } from '@/constants/theme';
import { useSubTrack } from '@/context/SubTrackContext';
import { formatMoney } from '@/utils/currency';

/**
 * Price-hike radar on the dashboard. Streaming prices go up almost every year and people only
 * notice on the statement; this says it plainly and lets them either accept the new price (so
 * totals and reminders stay true) or decide it's time to cancel.
 */
export function PriceHikeCard() {
  const { t, currency, priceHikes, applyPriceHike, dismissPriceHike } = useSubTrack();
  const dark = useColorScheme() === 'dark';
  if (priceHikes.length === 0) return null;
  const money = (n: number) => formatMoney(n, currency);

  return (
    <View style={[styles.card, { backgroundColor: dark ? theme.cardDark : theme.card }]}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <TrendingUp size={18} color="#D64545" />
        </View>
        <Text style={[styles.title, dark && styles.textOnDark]}>{t.hikeCardTitle}</Text>
      </View>
      {priceHikes.map((h) => (
        <View key={h.key} style={styles.row}>
          <Text style={[styles.line, dark && styles.textOnDark]}>
            {t.hikeLine
              .replace('{name}', h.subscription.name)
              .replace('{old}', money(h.trackedPrice))
              .replace('{new}', money(h.currentPrice))
              .replace('{pct}', String(h.pct))}
          </Text>
          <View style={styles.actions}>
            <Pressable onPress={() => applyPriceHike(h)} style={styles.update} accessibilityRole="button">
              <Text style={styles.updateText}>{t.hikeUpdate}</Text>
            </Pressable>
            <Pressable onPress={() => dismissPriceHike(h)} hitSlop={8} accessibilityRole="button">
              <Text style={styles.ignoreText}>{t.hikeIgnore}</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    borderRadius: 18,
    padding: 14,
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(214,69,69,0.35)',
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(214,69,69,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...t_.labelStrong, color: theme.text },
  textOnDark: { color: '#FFFFFF' },
  row: { gap: 6 },
  line: { ...t_.caption, fontSize: 14, color: theme.text },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  update: { backgroundColor: theme.accent, borderRadius: 9999, paddingVertical: 6, paddingHorizontal: 14 },
  updateText: { ...t_.captionBold, color: '#FFF' },
  ignoreText: { ...t_.captionBold, color: theme.textMuted },
});
