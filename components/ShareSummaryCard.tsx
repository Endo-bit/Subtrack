import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';
import { Strings } from '@/i18n/strings';
import { CurrencyCode, formatMoney } from '@/utils/currency';
import { diagnosisLabelKey } from '@/utils/diagnosis';
import { ShareSummaryData } from '@/utils/shareSummary';

/** Same tiers as the diagnosis sheet: >=70 keep, >=45 review, below that cancel. */
function verdictTone(score: number): string {
  if (score >= 70) return theme.success;
  if (score >= 45) return '#D4920A';
  return '#D64545';
}

/**
 * The card that actually gets captured to an image. Deliberately fixed-width and self-contained:
 * `captureRef` renders whatever this tree measures to, so it must not depend on the surrounding
 * screen's width or theme.
 */
export function ShareSummaryCard({
  data,
  t,
  currency,
}: {
  data: ShareSummaryData;
  t: Strings;
  currency: CurrencyCode;
}) {
  const money = (n: number) => formatMoney(n, currency);

  return (
    <View style={styles.card} collapsable={false}>
      <LinearGradient
        colors={['#1E1611', '#0D0908']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <Text style={styles.brand}>SubTrack</Text>
        <Text style={styles.heroLabel}>{t.shareTitle.toUpperCase()}</Text>
        <Text style={styles.heroValue}>{money(data.monthlyTotal)}</Text>
        <Text style={styles.heroCaption}>{t.thisMonth}</Text>

        <View style={styles.stats}>
          <Stat label={t.yearly} value={money(data.annualTotal)} />
          <View style={styles.divider} />
          <Stat label={t.shareSubsLabel} value={String(data.activeCount)} />
          <View style={styles.divider} />
          <Stat label={t.dailyCostLabel} value={money(data.dailyTotal)} />
        </View>
      </LinearGradient>

      {data.results.length > 0 && (
        <View style={styles.results}>
          <Text style={styles.resultsTitle}>{t.shareCheckupTitle}</Text>
          {data.results.map((r) => {
            const tone = verdictTone(r.score);
            return (
              <View key={`${r.subscriptionId}-${r.createdAt}`} style={styles.resultRow}>
                <View style={[styles.resultDot, { backgroundColor: tone }]} />
                <Text style={styles.resultName} numberOfLines={1}>
                  {r.subscriptionName}
                </Text>
                <Text style={[styles.resultVerdict, { color: tone }]} numberOfLines={1}>
                  {t[diagnosisLabelKey(r.score)]}
                </Text>
                <View style={[styles.resultScore, { backgroundColor: `${tone}1F` }]}>
                  <Text style={[styles.resultScoreText, { color: tone }]}>{r.score}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <Text style={styles.footer}>{t.shareGeneratedBy}</Text>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 320,
    backgroundColor: theme.cream,
    borderRadius: 24,
    overflow: 'hidden',
  },
  hero: { padding: 22, paddingBottom: 18 },
  brand: { fontSize: 13, fontWeight: '700', color: theme.accent, letterSpacing: 0.2 },
  heroLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 10,
  },
  heroValue: {
    fontSize: 44,
    fontWeight: '700',
    letterSpacing: -1.6,
    color: '#FFFFFF',
    marginTop: 2,
  },
  heroCaption: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.5)' },
  stats: { flexDirection: 'row', alignItems: 'center', marginTop: 18 },
  stat: { flex: 1, alignItems: 'center' },
  statLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.45)',
  },
  statValue: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.92)', marginTop: 3 },
  divider: { width: StyleSheet.hairlineWidth, height: 26, backgroundColor: 'rgba(255,255,255,0.15)' },

  results: { padding: 20, paddingBottom: 8, gap: 10 },
  resultsTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: theme.accent,
  },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  resultDot: { width: 8, height: 8, borderRadius: 4 },
  resultName: { flex: 1, fontSize: 14, fontWeight: '700', color: theme.text },
  resultVerdict: { fontSize: 11, fontWeight: '700', maxWidth: 110, textAlign: 'right' },
  resultScore: { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3, minWidth: 30, alignItems: 'center' },
  resultScoreText: { fontSize: 12, fontWeight: '800' },

  footer: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.textMuted,
    textAlign: 'center',
    paddingVertical: 14,
  },
});
