/**
 * Dashboard — Apple × Revolut design language
 *
 * Revolut: heroBalance 56px/600 with letterSpacing -2.5, true-black dark, surface-elevated cards
 * Apple:   parchment bg, body 16px/400, label 17px/600, rounded 18px cards, subtle hairlines
 */
import { LinearGradient } from 'expo-linear-gradient';
import { Href, router } from 'expo-router';
import { PackageOpen, Trash2 } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { MomDelta } from '@/components/MomDelta';
import { ServiceLogo } from '@/components/ServiceLogo';
import { TutorialSlides } from '@/components/TutorialSlides';
import { useSubTrack } from '@/context/SubTrackContext';
import { theme, type as t_ } from '@/constants/theme';
import { useFocusedNow } from '@/hooks/useFocusedNow';
import { track } from '@/utils/analytics';
import { BillingCycle, Category, SortMode, Subscription } from '@/types/subscription';
import { formatMoney } from '@/utils/currency';
import { chargeAmountInMonth, dailyCost, isInTrial, monthly, subscriptionStartedAt } from '@/utils/subscription';

type CycleFilter = 'all' | BillingCycle;

const categoryColor: Record<Category, string> = {
  streaming: '#FF3B30',
  music: '#30D158',
  productivity: '#007AFF',
  gaming: '#FF9F0A',
  health: '#FF2D55',
  news: '#32ADE6',
  other: '#8E8E93',
};

export default function DashboardScreen() {
  const {
    t,
    locale,
    currency,
    monthlyTotal,
    annualTotal,
    subscriptions,
    hasSeenOnboarding,
    updateSettings,
    removeSubscription,
    convert,
  } = useSubTrack();
  const money = (n: number) => formatMoney(n, currency);
  const [sort, setSort] = useState<SortMode>('date');
  const [cycleFilter, setCycleFilter] = useState<CycleFilter>('all');
  const scheme = useColorScheme();
  const dark = scheme === 'dark';

  // `active` powers the hero totals (always the true overall numbers).
  // `visible` is the cycle-filtered subset shown in the list below.
  const active = subscriptions.filter((s) => !s.isCancelled);
  const visible = active.filter((s) => cycleFilter === 'all' || s.billingCycle === cycleFilter);

  // Resynced on focus so this doesn't go stale if the app stays open across a month boundary.
  const today = useFocusedNow();
  const lastMonthTotal = useMemo(() => {
    const d = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    return subscriptions.reduce(
      (sum, s) => sum + chargeAmountInMonth(s, d.getFullYear(), d.getMonth(), convert),
      0,
    );
  }, [subscriptions, convert, today]);
  const momPct = lastMonthTotal > 0 ? ((monthlyTotal - lastMonthTotal) / lastMonthTotal) * 100 : null;
  const sorted = useMemo(
    () =>
      [...visible].sort((a, b) =>
        sort === 'cost'
          ? monthly(b, convert) - monthly(a, convert)
          : sort === 'alpha'
            ? a.name.localeCompare(b.name)
            : new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime(),
      ),
    [visible, sort, convert],
  );

  const confirmDelete = (s: Subscription) => {
    Alert.alert(t.deleteTitle, t.deleteMessage.replace('{name}', s.name), [
      { text: t.cancel, style: 'cancel' },
      { text: t.delete, style: 'destructive', onPress: () => removeSubscription(s.id) },
    ]);
  };

  if (!hasSeenOnboarding) {
    return (
      <TutorialSlides
        onDone={() => {
          track.onboardingCompleted();
          updateSettings({ hasSeenOnboarding: true });
        }}
      />
    );
  }

  const bg = dark ? theme.creamDark : theme.cream;

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: bg }]}
      contentContainerStyle={styles.content}
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <Image
              source={require('@/assets/images/icon.png')}
              style={styles.brandMarkImage}
              accessibilityIgnoresInvertColors
            />
          </View>
          <View>
            {/* Apple display-md, SubTrack brand */}
            <Text style={[styles.brand, dark && styles.textOnDark]}>SubTrack</Text>
            <Text style={styles.tagline}>{t.tagline}</Text>
          </View>
        </View>
        <Pressable style={styles.addPill} onPress={() => router.push('/add')}>
          <Text style={styles.addPillText}>+ {t.add}</Text>
        </Pressable>
      </View>

      {/* ── Hero — Revolut dark balance card ── */}
      {/* Revolut heroBalance: 56px/600/letterSpacing -2.5, true-black surface */}
      <LinearGradient
        colors={dark ? ['#17120F', '#0A0807'] : ['#1E1611', '#0D0908']}
        locations={[0, 1]}
        style={styles.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Revolut caption-style label */}
        <Text style={styles.heroLabel}>{t.monthly}</Text>

        {/* Revolut display-xl adapted: 56px 600 with tight letter-spacing */}
        <Text style={styles.heroValue}>{money(monthlyTotal)}</Text>
        <View style={styles.heroMomRow}>
          <MomDelta pct={momPct} t={t} variant="dark" />
        </View>

        {/* Three stats in a row (Apple hairline dividers) */}
        <View style={styles.heroStats}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatLabel}>{t.yearly}</Text>
            <Text style={styles.heroStatValue}>{money(annualTotal)}</Text>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatLabel}>{t.active}</Text>
            <Text style={styles.heroStatValue}>{active.length}</Text>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatLabel}>{t.dailyCostLabel}</Text>
            <Text style={styles.heroStatValue}>
              {money(active.reduce((s, sub) => s + dailyCost(sub, convert), 0))}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* ── Sort chips — Apple configurator-option-chip style ── */}
      <View style={styles.sortRow}>
        {(
          [
            ['date', t.sortDate],
            ['cost', t.sortCost],
            ['alpha', t.sortAlpha],
          ] as [SortMode, string][]
        ).map(([m, label]) => (
          <Pressable
            key={m}
            onPress={() => setSort(m)}
            style={[
              styles.chip,
              { backgroundColor: dark ? theme.cardDark : theme.card },
              sort === m && styles.chipActive,
            ]}
          >
            <Text style={[styles.chipText, sort === m && styles.chipTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {/* ── Billing-cycle filter — monthly vs. yearly view ── */}
      <View style={styles.sortRow}>
        {(
          [
            ['all', t.filterAll],
            ['monthly', t.cycleMonthly],
            ['quarterly', t.cycleQuarterly],
            ['annual', t.cycleAnnual],
          ] as [CycleFilter, string][]
        ).map(([c, label]) => (
          <Pressable
            key={c}
            onPress={() => setCycleFilter(c)}
            style={[
              styles.chip,
              { backgroundColor: dark ? theme.cardDark : theme.card },
              cycleFilter === c && styles.chipActive,
            ]}
          >
            <Text style={[styles.chipText, cycleFilter === c && styles.chipTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {/* ── Empty state ── */}
      {visible.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: dark ? theme.cardDark : theme.card }]}>
          <View style={styles.emptyIconBadge}>
            <PackageOpen size={26} color={theme.accent} strokeWidth={1.75} />
          </View>
          <Text style={[styles.emptyTitle, dark && styles.textOnDark]}>{t.emptyHomeTitle}</Text>
          <Text style={[styles.emptyBody]}>{t.emptyHomeBody}</Text>
          <Pressable style={styles.emptyCta} onPress={() => router.push('/add')}>
            <Text style={styles.emptyCtaText}>{t.addSub}</Text>
          </Pressable>
        </View>
      ) : (
        /* ── Subscription list — Apple store-utility-card style ── */
        sorted.map((s) => {
          const msUntil = new Date(s.nextBillingDate).getTime() - today.getTime();
          const daysUntil = msUntil / 86400000;
          const isDueSoon = daysUntil < 7 && daysUntil >= 0;
          return (
            <Pressable
              key={s.id}
              onPress={() => router.push(`/subscription/${s.id}` as Href)}
              style={[styles.row, { backgroundColor: dark ? theme.cardDark : theme.card }]}
            >
              {/* Revolut category accent strip */}
              <View style={[styles.rowAccent, { backgroundColor: categoryColor[s.category] }]} />

              <ServiceLogo service={s} size={40} />

              <View style={styles.rowMain}>
                <View style={styles.rowNameRow}>
                  <Text
                    style={[styles.rowName, dark && styles.textOnDark]}
                    numberOfLines={1}
                  >
                    {s.name}
                  </Text>
                  {isInTrial(s) && (
                    <View style={styles.trialBadge}>
                      <Text style={styles.trialBadgeText}>{t.freeTrialBadge}</Text>
                    </View>
                  )}
                  {isDueSoon && (
                    <View style={styles.dueBadge}>
                      <Text style={styles.dueBadgeText}>
                        {Math.ceil(daysUntil) === 0 ? 'Today' : `${Math.ceil(daysUntil)}d`}
                      </Text>
                    </View>
                  )}
                </View>
                {/* Apple caption style */}
                <Text style={styles.rowMeta}>
                  {subscriptionStartedAt(s).toLocaleDateString(locale)} ·{' '}
                  {money(dailyCost(s, convert))}{t.perDay}
                </Text>
              </View>

              <View style={styles.rowRight}>
                <Text style={[styles.rowCost, dark && styles.textOnDark]}>
                  {money(monthly(s, convert))}
                </Text>
                <Text style={styles.rowCostSub}>/mo</Text>
              </View>

              <Pressable
                onPress={(e) => { e.stopPropagation?.(); confirmDelete(s); }}
                hitSlop={12}
                style={styles.deleteBtn}
                accessibilityRole="button"
                accessibilityLabel={`${t.delete}: ${s.name}`}
              >
                <Trash2 size={15} color={theme.textMuted} />
              </Pressable>
            </Pressable>
          );
        })
      )}
    </ScrollView>
  );
}

/* ─────────────────────────────────────────────────────────────────── Styles ── */
const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingTop: 58, paddingBottom: 32, gap: 10 },

  // Header — Apple sub-nav style
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 2,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: theme.accent,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  brandMarkImage: {
    width: '100%',
    height: '100%',
  },
  brand: {
    ...t_.displayMd,
    fontSize: 26,
    color: theme.text,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0,
    color: theme.accent,
    marginTop: 1,
  },
  textOnDark: { color: '#FFFFFF' },
  // Revolut button-primary (inverted: brand orange pill)
  addPill: {
    backgroundColor: theme.accent,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 9999,
  },
  addPillText: {
    ...t_.captionBold,
    color: '#FFFFFF',
    fontSize: 14,
  },

  // Hero — Revolut hero-band-dark adapted
  hero: {
    marginHorizontal: 20,
    borderRadius: 20,  // Revolut rounded.lg
    padding: 22,
    paddingBottom: 20,
  },
  // Revolut caption style
  heroLabel: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.5)',
  },
  // Revolut display-xl adapted for mobile: heroBalance scale
  heroValue: {
    ...t_.heroBalance,
    color: '#FFFFFF',
    marginTop: 6,
    marginBottom: 6,
  },
  heroMomRow: { minHeight: 14, marginBottom: 6 },
  heroStats: { flexDirection: 'row', alignItems: 'center' },
  heroStat: { flex: 1, alignItems: 'center' },
  // Apple caption: 13px/400
  heroStatLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.45)',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  // Revolut body-md-bold
  heroStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 3,
  },
  // Revolut hairline-dark
  heroDivider: {
    width: StyleSheet.hairlineWidth,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  // Sort — Apple configurator-option-chip
  sortRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20 },
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 9999,  // Revolut rounded.full
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
  chipActive: { backgroundColor: theme.accent },
  chipText: { ...t_.captionBold, color: theme.textMuted },
  chipTextActive: { color: '#FFFFFF' },

  // Rows — Apple store-utility-card + Revolut feature-card-dark
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    borderRadius: 18,  // Apple rounded.lg
    padding: 14,
    paddingLeft: 0,
    overflow: 'hidden',
    // Apple: hairline border instead of shadow
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.07)',
  },
  rowAccent: { width: 3.5, alignSelf: 'stretch', borderRadius: 2 },
  rowMain: { flex: 1, gap: 2 },
  rowNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  // Apple body-strong: 17px/600
  rowName: { ...t_.labelStrong, color: theme.text, flex: 1 },
  // Apple caption: 13px/400
  rowMeta: { ...t_.caption, color: theme.textMuted },
  rowRight: { alignItems: 'flex-end', gap: 1 },
  // Revolut heading-sm adapted
  rowCost: { fontSize: 17, fontWeight: '700', letterSpacing: -0.3, color: theme.text },
  rowCostSub: { ...t_.caption, color: theme.textMuted },
  dueBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dueBadgeText: { fontSize: 10, fontWeight: '700', color: '#FFF' },
  trialBadge: {
    backgroundColor: theme.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  trialBadgeText: { fontSize: 10, fontWeight: '700', color: '#FFF' },
  deleteBtn: { padding: 4, marginLeft: 2 },

  // Empty
  empty: {
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    borderRadius: 18,
    padding: 32,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
  },
  emptyIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: theme.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { ...t_.sectionHead, color: theme.text },
  emptyBody: { ...t_.body, color: theme.textMuted, textAlign: 'center' },
  emptyCta: {
    marginTop: 6,
    backgroundColor: theme.accent,
    paddingVertical: 13,
    paddingHorizontal: 28,
    borderRadius: 9999,  // Revolut pill
  },
  emptyCtaText: { ...t_.button, color: '#FFF' },
});
