import { BlurView } from 'expo-blur';

import { router } from 'expo-router';

import { Lock } from 'lucide-react-native';

import React, { useEffect, useMemo, useRef, useState } from 'react';

import { Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { MomDelta } from '@/components/MomDelta';

import { MonthBreakdownSheet } from '@/components/MonthBreakdownSheet';

import { SavingsCard } from '@/components/SavingsCard';

import { ServiceLogo } from '@/components/ServiceLogo';

import { SubscriptionDiagnosis } from '@/components/SubscriptionDiagnosis';

import { useSubTrack } from '@/context/SubTrackContext';

import { theme } from '@/constants/theme';

import { useFocusedNow } from '@/hooks/useFocusedNow';

import { Strings } from '@/i18n/strings';

import { Category } from '@/types/subscription';

import { currencySymbol, formatMoney } from '@/utils/currency';

import {

  chargeAmountInMonth,
  dailyCost,
  monthly,
  MonthTrendRow,

  spendingBreakdownForMonth,

  spendingTrendForYear,

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

  const {
    subscriptions,
    monthlyTotal,
    t,
    isPro,
    locale,
    currency,
    diagnosisHistory,
    recordDiagnosis,
    convert,
    cancelSubscription,
  } = useSubTrack();

  const money = (n: number) => formatMoney(n, currency);

  const dark = useColorScheme() === 'dark';

  const active = subscriptions.filter((s) => !s.isCancelled);
  const cancelledSubs = subscriptions.filter((s) => s.isCancelled);

  const ranked = [...active].sort((a, b) => monthly(b, convert) - monthly(a, convert));

  // Resynced on focus so the trend chart and month totals don't go stale if the
  // app is left open across a month/year boundary.
  const today = useFocusedNow();
  const thisYear = today.getFullYear();
  const [trendYear, setTrendYear] = useState(thisYear);
  // Tracks the `thisYear` value trendYear was last auto-following, so we only
  // fast-forward trendYear when the user hadn't manually browsed to a past year.
  const followedYearRef = useRef(thisYear);

  useEffect(() => {
    if (thisYear !== followedYearRef.current) {
      setTrendYear((prev) => (prev === followedYearRef.current ? thisYear : prev));
      followedYearRef.current = thisYear;
    }
  }, [thisYear]);

  // Uses the full subscription list (not just `active`) so months before a
  // cancellation's cutoff still show what was actually charged back then.
  const trend = useMemo(
    () => spendingTrendForYear(subscriptions, trendYear, locale, convert),
    [subscriptions, trendYear, locale, convert],
  );
  const maxTrend = Math.max(...trend.map((m) => m.total), 1);

  const lastMonthTotal = useMemo(() => {
    const d = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    return subscriptions.reduce(
      (sum, s) => sum + chargeAmountInMonth(s, d.getFullYear(), d.getMonth(), convert),
      0,
    );
  }, [subscriptions, convert, today]);

  const momPct = lastMonthTotal > 0 ? ((monthlyTotal - lastMonthTotal) / lastMonthTotal) * 100 : null;



  const [breakdownMonth, setBreakdownMonth] = useState<MonthTrendRow | null>(null);

  const [diagnosisOpen, setDiagnosisOpen] = useState(false);



  const breakdownItems = useMemo(() => {

    if (!breakdownMonth) return [];

    return spendingBreakdownForMonth(subscriptions, breakdownMonth.year, breakdownMonth.month, convert);

  }, [subscriptions, breakdownMonth, convert]);



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



      {/* Diagnosis stays free (1 check per subscription; unlimited on Pro — enforced inside
          SubscriptionDiagnosis via diagnosisHistory). Only the analytics below is Pro-gated. */}
      <Pressable style={styles.diagnosisCard} onPress={() => setDiagnosisOpen(true)}>

        <Text style={styles.diagnosisTitle}>{t.diagnosis}</Text>

        <Text style={styles.diagnosisHint}>{t.diagnosisIntro}</Text>

        <Text style={styles.diagnosisCta}>{t.diagnosisOpen} →</Text>

      </Pressable>

      <SavingsCard cancelledSubs={cancelledSubs} currency={currency} convert={convert} t={t} />

      <View style={styles.proSection}>

      <View pointerEvents={isPro ? 'auto' : 'none'} style={styles.proSectionInner}>



      <View style={styles.card}>

        <Text style={styles.cardTitle}>{t.categoryBreakdown}</Text>

        {cats.map((c) => {

          const amount = active.filter((s) => s.category === c).reduce((a, s) => a + monthly(s, convert), 0);

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

          <MomDelta pct={momPct} t={t} />

        </View>

        <View style={styles.mini}>

          <Text style={styles.cardTitle}>{t.lastMonth}</Text>

          <Text style={styles.big}>{money(lastMonthTotal)}</Text>

        </View>

      </View>



      <View style={styles.card}>

        <View style={styles.trendHeader}>

          <Text style={styles.cardTitle}>{t.spendingTrend}</Text>

          <View style={styles.yearNav}>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t.prevYear}
              onPress={() => setTrendYear((y) => y - 1)}
              style={styles.yearBtn}
              hitSlop={8}
            >
              <Text style={styles.yearBtnText}>‹</Text>
            </Pressable>

            <Text style={styles.yearLabel}>{trendYear}</Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t.nextYear}
              onPress={() => setTrendYear((y) => y + 1)}
              disabled={trendYear >= thisYear}
              style={[styles.yearBtn, trendYear >= thisYear && styles.yearBtnDisabled]}
              hitSlop={8}
            >
              <Text style={styles.yearBtnText}>›</Text>
            </Pressable>

          </View>

        </View>

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

              <Text style={[styles.trendAmount, m.total === 0 && styles.trendAmountHidden]} numberOfLines={1}>

                {m.total > 0 ? `${currencySymbol(currency)}${Math.round(m.total)}` : '·'}

              </Text>

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

                  {money(dailyCost(s, convert))}

                  {t.perDay}

                </Text>

              </View>

              <Text style={styles.rankPrice}>{money(monthly(s, convert))}</Text>

            </View>

          ))

        )}

      </View>

      </View>

      {!isPro && (
        <View style={StyleSheet.absoluteFill} pointerEvents="auto">
          <BlurView intensity={60} tint={dark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          <View style={styles.lockOverlay}>
            <View style={styles.lockIconBadge}>
              <Lock size={26} color={theme.accent} strokeWidth={1.75} />
            </View>
            <Text style={[styles.lockTitle, dark && styles.light]}>{t.analyticsLockedTitle}</Text>
            <Text style={styles.lockBody}>{t.analyticsLockedBody}</Text>
            <Pressable
              style={styles.lockCta}
              onPress={() => router.push({ pathname: '/paywall', params: { source: 'analysis-lock' } })}
            >
              <Text style={styles.lockCtaText}>{t.pro}</Text>
            </Pressable>
          </View>
        </View>
      )}

      </View>



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

        locale={locale}

        isPro={isPro}

        diagnosisHistory={diagnosisHistory}

        onRecordDiagnosis={recordDiagnosis}

        onCancelSubscription={cancelSubscription}

        currency={currency}

        convert={convert}

        onOpenPaywall={() => {

          setDiagnosisOpen(false);

          router.push({ pathname: '/paywall', params: { source: 'diagnosis' } });

        }}

      />

    </ScrollView>

  );

}



const styles = StyleSheet.create({

  screen: { flex: 1, backgroundColor: theme.cream },

  proSection: { position: 'relative' },

  proSectionInner: { gap: 16 },

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

  trendHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  yearNav: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  yearBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  yearBtnDisabled: { opacity: 0.35 },

  yearBtnText: { fontSize: 16, fontWeight: '700', color: theme.accent, lineHeight: 18 },

  yearLabel: { fontSize: 14, fontWeight: '700', color: theme.text, minWidth: 40, textAlign: 'center' },

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

  trendAmountHidden: { opacity: 0 },

  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },

  rankNum: { width: 20, fontWeight: '700', color: theme.textMuted, fontSize: 14 },

  rankMain: { flex: 1 },

  rankName: { fontWeight: '600', color: theme.text },

  rankSub: { fontSize: 12, color: theme.textMuted, marginTop: 2 },

  rankPrice: { fontWeight: '700', color: theme.text },

  empty: { color: theme.textMuted },

  lockOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    gap: 10,
  },

  lockIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: theme.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },

  lockTitle: { fontSize: 20, fontWeight: '700', color: theme.text, textAlign: 'center' },

  lockBody: { fontSize: 14, color: theme.textMuted, textAlign: 'center', lineHeight: 20 },

  lockCta: {
    marginTop: 10,
    backgroundColor: theme.accent,
    borderRadius: 9999,
    paddingVertical: 13,
    paddingHorizontal: 30,
  },

  lockCtaText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },

});

