import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Strings } from '@/i18n/strings';

type Props = {
  /** Percent change vs. last month; null when there's no prior-month baseline to compare against. */
  pct: number | null;
  t: Strings;
  /** 'dark' for use on the near-black hero card, 'light' for use on white/cream cards. */
  variant?: 'light' | 'dark';
};

/** Small "+12% vs last month" indicator. Spending up = warning tone, spending down = success tone. */
export function MomDelta({ pct, t, variant = 'light' }: Props) {
  if (pct === null || Math.abs(pct) < 0.5) return null;
  const up = pct > 0;
  const dark = variant === 'dark';
  const color = up ? (dark ? '#FF8A75' : '#D64545') : dark ? '#7CE0A8' : '#30D158';
  const sign = up ? '+' : '';

  return (
    <View style={styles.row}>
      <Text style={[styles.text, { color }]}>
        {sign}
        {Math.round(pct)}% {t.momVsLastMonth}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  text: { fontSize: 12, fontWeight: '700' },
});
