import { router } from 'expo-router';

import React, { useMemo, useState } from 'react';

import { Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { MonthBreakdownSheet } from '@/components/MonthBreakdownSheet';

import { ServiceLogo } from '@/components/ServiceLogo';

import { SubscriptionDiagnosis } from '@/components/SubscriptionDiagnosis';

import { useSubTrack } from '@/context/SubTrackContext';

import { theme } from '@/constants/theme';

import { Strings } from '@/i18n/strings';

import { Category } from '@/types/subscription';

import { currencySymbol, formatMoney } from '@/utils/currency';

import {

  dailyCost,
  monthly,
  MonthTrendRow,

  spendingBreakdownForMonth,

  spendingTrendMonths,

} from '@/utils/subscription';



const cats: Category[] = ['streaming', 'music', 'productivity', 'gaming', 'health', 'news', 'other'];

const colors: Record<Category, string> = {

  streaming: '#E85D3A',

  music: '#2F9E6F',

  productivity: '#3B6FD4',

  gaming: '#D4920A',

  health: '#D64545',

  news: '#0E8AB5',

  other: '#7A6E66',

};



const catLabelKey: Record<Category, keyof Strings> = {

  streaming: 'catStreaming',

  music: 'catMusic',

  productivity: 'catProductivity',

  gaming: 'catGaming',

  health: 'catHealth',

  news: 'catNews',

  other: 'catOther',

};



export default function AnalysisScreen() {

  const { subscriptions, monthlyTotal, t, isPro, savedTotal, locale, currency } = useSubTrack();

  const money = (n: number) => formatMoney(n, currency);

  const dark = useColorScheme() === 'dark';

  const active = subscriptions.filter((s) => !s.isCancelled);

  const ranked = [...active].sort((a, b) => monthly(b) - monthly(a));

  const trend = useMemo(() => spendingTrendMonths(active, 12, locale), [active, locale]);

  const maxTrend = Math.max(...trend.map((m) => m.total), 1);

  const lastMonthTotal = trend.length >= 2 ? trend[trend.length - 2].total : 0;



  const [breakdownMonth, setBreakdownMonth] = useState<MonthTrendRow | null>(null);

  const [diagnosisOpen, setDiagnosisOpen] = useState(false);



  const breakdownItems = useMemo(() => {

    if (!breakdownMonth) return [];

    return spendingBreakdownForMonth(active, breakdownMonth.year, breakdownMonth.month);

  }, [active, breakdownMonth]);



  const breakdownTitle = breakdownMonth

    ? new Date(breakdownMonth.year, breakdownMonth.month, 1).toLocaleString(locale, {

        month: 'long',

        year: 'numeric',

      })

    : '';



  return (

    <ScrollView

      style={[styles.screen, dark && styles.dark]}

      contentContainerStyle={styles.content}

    >

      <Text style={[styles.title, dark && styles.light]}>{t.analysis}</Text>



      <Pressable style={styles.diagnosisCard} onPress={() => setDiagnosisOpen(true)}>

        <Text style={styles.diagnosisTitle}>{t.diagnosis}</Text>

        <Text style={styles.diagnosisHint}>{t.diagnosisIntro}</Text>

        <Text style={styles.diagnosisCta}>{t.diagnosisOpen} →</Text>

      </Pressable>



      <View style={styles.card}>

        <Text style={styles.cardTitle}>{t.categoryBreakdown}</Text>

        {cats.map((c) => {

          const amount = active.filter((s) => s.category === c).reduce((a, s) => a + monthly(s), 0);

          const pct = monthlyTotal ? (amount / monthlyTotal) * 100 : 0;

          if (pct === 0) return null;

          return (

            <View key={c} style={styles.barRow}>

              <Text style={styles.cat}>{t[catLabelKey[c]]}</Text>

              <View style={styles.track}>

                <View style={[styles.fill, { width: `${pct}%`, backgroundColor: colors[c] }]} />

              </View>

              <Text style={styles.pct}>{pct.toFixed(0)}%</Text>

            </View>

          );

        })}

      </View>



      <View style={styles.split}>

        <View style={styles.mini}>

          <Text style={styles.cardTitle}>{t.thisMonth}</Text>

          <Text style={styles.big}>{money(monthlyTotal)}</Text>

        </View>

        <View style={styles.mini}>

          <Text style={styles.cardTitle}>{t.lastMonth}</Text>

          <Text style={styles.big}>{money(lastMonthTotal)}</Text>

        </View>

      </View>



      <View style={styles.card}>

        <Text style={styles.cardTitle}>{t.spendingTrend}</Text>

        <Text style={styles.trendHint}>{t.trendTapHint}</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendScroll}>

          {trend.map((m) => (

            <Pressable

              key={`${m.year}-${m.month}`}

              onPress={() => setBreakdownMonth(m)}

              style={styles.trendCol}

            >

              <View

                style={[

                  styles.trendBar,

                  { height: Math.max(8, (m.total / maxTrend) * 100) },

                ]}

              />

              <Text style={styles.trendLabel} numberOfLines={1}>

                {m.label}

              </Text>

              {m.total > 0 && (

                <Text style={styles.trendAmount} numberOfLines={1}>

                  {currencySymbol(currency)}{Math.round(m.total)}

                </Text>

              )}

            </Pressable>

          ))}

        </ScrollView>

      </View>



      <View style={styles.card}>

        <Text style={styles.cardTitle}>{t.topSubscriptions}</Text>

        {ranked.length === 0 ? (

          <Text style={styles.empty}>{t.addSub}</Text>

        ) : (

          ranked.map((s, i) => (

            <View key={s.id} style={styles.rankRow}>

              <Text style={styles.rankNum}>{i + 1}</Text>

              <ServiceLogo service={s} size={32} />

              <View style={styles.rankMain}>

                <Text style={styles.rankName}>{s.name}</Text>

                <Text style={styles.rankSub}>

                  {money(dailyCost(s))}

                  {t.perDay}

                </Text>

              </View>

              <Text style={styles.rankPrice}>{money(monthly(s))}</Text>

            </View>

          ))

        )}

      </View>



      {!isPro && (

        <Pressable style={styles.pro} onPress={() => router.push({ pathname: '/paywall', params: { source: 'analysis' } })}>

          <Text style={styles.proTitle}>{t.pro}</Text>

          <Text style={styles.proText}>{t.proTrendHint}</Text>

        </Pressable>

      )}



      {savedTotal > 0 && (

        <Text style={styles.saved}>

          {t.saved}: {money(savedTotal)}

        </Text>

      )}



      <MonthBreakdownSheet

        visible={breakdownMonth !== null}

        onClose={() => setBreakdownMonth(null)}

        title={breakdownTitle}

        items={breakdownItems}

        total={breakdownMonth?.total ?? 0}

        t={t}

        currency={currency}

      />



      <SubscriptionDiagnosis

        visible={diagnosisOpen}

        onClose={() => setDiagnosisOpen(false)}

        subscriptions={subscriptions}

        t={t}

      />

    </ScrollView>

  );

}



const styles = StyleSheet.create({

  screen: { flex: 1, backgroundColor: theme.cream },

  dark: { backgroundColor: theme.creamDark },

  content: { padding: 20, paddingTop: 62, gap: 16, paddingBottom: 40 },

  title: { fontSize: 28, fontWeight: '700', color: theme.text, letterSpacing: -0.5 },

  light: { color: '#F5EDE8' },

  diagnosisCard: {

    backgroundColor: theme.accentSoft,

    borderRadius: 20,

    padding: 18,

    borderWidth: 1,

    borderColor: theme.accentMuted,

    gap: 6,

  },

  diagnosisTitle: { fontSize: 18, fontWeight: '700', color: theme.text },

  diagnosisHint: { fontSize: 13, color: theme.textMuted, lineHeight: 19 },

  diagnosisCta: { fontSize: 14, fontWeight: '700', color: theme.accent, marginTop: 4 },

  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 18, gap: 12 },

  cardTitle: { fontWeight: '700', color: theme.text, fontSize: 16 },

  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  cat: { width: 88, color: theme.textMuted, fontSize: 12, fontWeight: '600' },

  track: { flex: 1, height: 10, borderRadius: 99, backgroundColor: theme.border, overflow: 'hidden' },

  fill: { height: 10, borderRadius: 99 },

  pct: { width: 36, textAlign: 'right', fontWeight: '700', color: theme.text, fontSize: 12 },

  split: { flexDirection: 'row', gap: 12 },

  mini: { flex: 1, backgroundColor: theme.accentSoft, borderRadius: 18, padding: 16 },

  big: { fontSize: 22, fontWeight: '700', color: theme.accent, marginTop: 6 },

  trendHint: { fontSize: 12, color: theme.textMuted, marginTop: -4 },

  trendScroll: { height: 140, alignItems: 'flex-end', gap: 6, paddingTop: 8, paddingRight: 4 },

  trendCol: { width: 44, alignItems: 'center', gap: 4, justifyContent: 'flex-end', minHeight: 120 },

  trendBar: {

    width: 28,

    backgroundColor: theme.accent,

    borderRadius: 6,

    minHeight: 8,

  },

  trendLabel: { fontSize: 9, color: theme.textMuted, fontWeight: '600' },

  trendAmount: { fontSize: 8, color: theme.text, fontWeight: '700' },

  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },

  rankNum: { width: 20, fontWeight: '700', color: theme.textMuted, fontSize: 14 },

  rankMain: { flex: 1 },

  rankName: { fontWeight: '600', color: theme.text },

  rankSub: { fontSize: 12, color: theme.textMuted, marginTop: 2 },

  rankPrice: { fontWeight: '700', color: theme.text },

  empty: { color: theme.textMuted },

  pro: { backgroundColor: theme.text, borderRadius: 18, padding: 18 },

  proTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },

  proText: { color: '#C4B8B0', marginTop: 6 },

  saved: { fontSize: 18, fontWeight: '700', color: theme.success, textAlign: 'center' },

});

