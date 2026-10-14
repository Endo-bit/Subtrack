import { router, useLocalSearchParams } from 'expo-router';
import { ExternalLink, Globe, Sparkles, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { BillingDatePicker } from '@/components/BillingDatePicker';
import { ServiceLogo } from '@/components/ServiceLogo';
import { useSubTrack } from '@/context/SubTrackContext';
import { AlternativeKind, ALTERNATIVES } from '@/data/alternatives';
import { theme } from '@/constants/theme';
import { track } from '@/utils/analytics';
import { BillingCycle, ServicePlan } from '@/types/subscription';
import { formatMoney } from '@/utils/currency';
import { lifetimeSpend } from '@/utils/insights';
import {
  computeNextBillingFromStart,
  dailyCost,
  isInTrial,
  monthly,
  subscriptionStartedAt,
  yearly,
} from '@/utils/subscription';

export default function SubscriptionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    t,
    locale,
    currency,
    subscriptions,
    presetServices,
    updateSubscription,
    removeSubscription,
    convert,
    priceHikes,
    applyPriceHike,
  } = useSubTrack();
  const dark = useColorScheme() === 'dark';
  const sub = subscriptions.find((s) => s.id === id);

  const [editingPlan, setEditingPlan] = useState(false);
  const [customPrice, setCustomPrice] = useState('');
  const [planEffective, setPlanEffective] = useState(() => new Date());

  if (!sub) {
    return (
      <View style={[styles.screen, dark && styles.dark]}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={[styles.missing, dark && styles.textLight]}>—</Text>
      </View>
    );
  }

  const presetId = sub.id.replace(/-\d+$/, '');
  const preset = presetServices.find((p) => p.id === presetId);
  const plans = sub.plans?.length ? sub.plans : preset?.plans ?? [];
  const cancelUrl = sub.cancelUrl ?? preset?.cancelUrl;

  const openCancel = () => {
    if (!cancelUrl) return;
    track.cancelPageOpened(sub.name);
    Linking.openURL(cancelUrl).catch(() => {});
  };

  const confirmDelete = () => {
    Alert.alert(t.deleteTitle, t.deleteMessage.replace('{name}', sub.name), [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.delete,
        style: 'destructive',
        onPress: () => {
          removeSubscription(sub.id);
          router.replace('/');
        },
      },
    ]);
  };

  const applyPlan = (plan: ServicePlan | null, priceOverride?: number) => {
    const amount = priceOverride ?? plan?.price;
    if (amount === undefined || Number.isNaN(amount)) return;
    const effective = planEffective.toISOString();
    updateSubscription(sub.id, {
      defaultPrice: amount,
      billingCycle: plan?.billingCycle ?? sub.billingCycle,
      planName: plan?.name ?? t.customPlan,
      customPrice: !plan,
      planChangedAt: effective,
      nextBillingDate: computeNextBillingFromStart(
        subscriptionStartedAt(sub),
        plan?.billingCycle ?? sub.billingCycle,
      ).toISOString(),
    });
    track.planChanged({ name: sub.name, plan: plan?.name ?? t.customPlan, price: amount });
    setEditingPlan(false);
  };

  const started = subscriptionStartedAt(sub);
  const money = (n: number) => formatMoney(n, currency);
  const paidSoFar = lifetimeSpend(sub, convert);
  const hike = priceHikes.find((h) => h.subscription.id === sub.id);
  const alternatives = ALTERNATIVES[presetId] ?? [];
  const altLabel: Record<AlternativeKind, string> = {
    free: t.altFree,
    freeTier: t.altFreeTier,
    library: t.altLibrary,
    family: t.altFamily,
    cheaper: t.altCheaper,
  };

  return (
    <ScrollView style={[styles.screen, dark && styles.dark]} contentContainerStyle={styles.content}>
      <Pressable
        onPress={() => router.back()}
        style={styles.back}
        accessibilityRole="button"
        accessibilityLabel={t.back}
      >
        <Text style={[styles.backText, dark && styles.textLight]}>←</Text>
      </Pressable>
      <Text style={[styles.pageTitle, dark && styles.textLight]}>{t.subscriptionDetail}</Text>

      <View style={[styles.hero, dark && styles.cardDark]}>
        <ServiceLogo service={sub} size={56} />
        <Text style={[styles.name, dark && styles.textLight]}>{sub.name}</Text>
        {sub.planName && <Text style={styles.planName}>{sub.planName}</Text>}
      </View>

      <View style={[styles.card, dark && styles.cardDark]}>
        <Row label={t.contractStart} value={started.toLocaleDateString(locale)} dark={dark} />
        {isInTrial(sub) && (
          <Row
            label={t.freeTrialEndsLabel}
            value={new Date(sub.trialEndsAt as string).toLocaleDateString(locale)}
            dark={dark}
          />
        )}
        <Row label={t.dailyCostLabel} value={`${money(dailyCost(sub, convert))}${t.perDay}`} dark={dark} />
        <Row label={t.monthlyCostLabel} value={money(monthly(sub, convert))} dark={dark} />
        <Row label={t.yearlyCostLabel} value={money(yearly(sub, convert))} dark={dark} />
        {paidSoFar > 0 && <Row label={t.lifetimeLabel} value={money(paidSoFar)} dark={dark} />}
        {sub.planChangedAt && (
          <Row
            label={t.planEffectiveDate}
            value={new Date(sub.planChangedAt).toLocaleDateString(locale)}
            dark={dark}
          />
        )}
      </View>

      {hike && (
        <Pressable style={styles.hikeBox} onPress={() => applyPriceHike(hike)} accessibilityRole="button">
          <Text style={styles.hikeText}>
            {t.hikeCardTitle} ·{' '}
            {t.hikeLine
              .replace('{name}', sub.name)
              .replace('{old}', money(hike.trackedPrice))
              .replace('{new}', money(hike.currentPrice))
              .replace('{pct}', String(hike.pct))}
          </Text>
          <Text style={styles.hikeCta}>{t.hikeUpdate} →</Text>
        </Pressable>
      )}

      {sub.note && (
        <View style={[styles.card, dark && styles.cardDark]}>
          <Text style={[styles.rowLabel, dark && styles.mutedLight]}>{t.note}</Text>
          <Text style={[styles.noteText, dark && styles.textLight]}>{sub.note}</Text>
        </View>
      )}

      {cancelUrl ? (
        <Pressable style={styles.cancelBtn} onPress={openCancel}>
          <ExternalLink size={18} color={theme.accent} />
          <Text style={styles.cancelBtnText}>{t.openCancelPage}</Text>
        </Pressable>
      ) : (
        <View style={styles.cancelNotice}>
          <Globe size={18} color={theme.textMuted} />
          <Text style={styles.cancelNoticeText}>
            {t.cancelPageUnavailable.replaceAll('{name}', sub.name)}
          </Text>
        </View>
      )}

      {alternatives.length > 0 && (
        <View style={[styles.card, dark && styles.cardDark]}>
          <View style={styles.altHeader}>
            <Sparkles size={16} color={theme.accent} />
            <Text style={[styles.sectionTitle, dark && styles.textLight]}>{t.alternativesTitle}</Text>
          </View>
          {alternatives.map((alt) => (
            <Pressable
              key={alt.name}
              style={styles.altRow}
              onPress={() => track.alternativeTapped(sub.name, alt.name)}
            >
              <Text style={[styles.altName, dark && styles.textLight]}>{alt.name}</Text>
              <Text style={styles.altKind}>{altLabel[alt.kind]}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <Pressable
        style={[styles.card, dark && styles.cardDark]}
        onPress={() =>
          setEditingPlan((v) => {
            const next = !v;
            if (next) setCustomPrice(String(sub.defaultPrice));
            return next;
          })
        }
      >
        <Text style={[styles.sectionTitle, dark && styles.textLight]}>{t.editPlan}</Text>
      </Pressable>

      {editingPlan && (
        <View style={[styles.card, dark && styles.cardDark]}>
          {plans.map((plan) => {
            const isCurrent = !sub.customPrice && sub.planName === plan.name;
            return (
              <Pressable key={plan.id} style={styles.planRow} onPress={() => applyPlan(plan)}>
                <Text style={[styles.planLabel, dark && styles.textLight]}>
                  {plan.name}
                  {isCurrent ? ` · ${t.currentPlanLabel}` : ''}
                </Text>
                <Text style={styles.planPrice}>{money(plan.price)}</Text>
              </Pressable>
            );
          })}
          <Text style={[styles.label, dark && styles.textLight]}>{t.customPrice}</Text>
          <TextInput
            value={customPrice}
            onChangeText={setCustomPrice}
            keyboardType="decimal-pad"
            placeholder="0.00"
            style={[styles.input, dark && styles.inputDark]}
          />
          <BillingDatePicker value={planEffective} onChange={setPlanEffective} t={t} locale={locale} dark={dark} />
          <Pressable
            style={styles.savePlan}
            onPress={() => {
              const amount = Number(customPrice.replace(',', '.'));
              if (!Number.isNaN(amount)) applyPlan(null, amount);
            }}
          >
            <Text style={styles.savePlanText}>{t.save}</Text>
          </Pressable>
        </View>
      )}

      <Pressable onPress={confirmDelete} style={styles.deleteRow}>
        <Trash2 size={18} color="#DC2626" />
        <Text style={styles.deleteText}>{t.delete}</Text>
      </Pressable>
    </ScrollView>
  );
}

function Row({ label, value, dark }: { label: string; value: string; dark: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, dark && styles.mutedLight]}>{label}</Text>
      <Text style={[styles.rowValue, dark && styles.textLight]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hikeBox: {
    borderRadius: 16,
    padding: 14,
    gap: 4,
    backgroundColor: 'rgba(214,69,69,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(214,69,69,0.3)',
  },
  hikeText: { fontSize: 14, fontWeight: '600', color: '#B83232' },
  hikeCta: { fontSize: 13, fontWeight: '700', color: theme.accent },
  altHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  altRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, gap: 12 },
  altName: { fontSize: 15, fontWeight: '600', color: theme.text, flexShrink: 1 },
  altKind: { fontSize: 12, fontWeight: '700', color: theme.success },
  screen: { flex: 1, backgroundColor: theme.cream },
  dark: { backgroundColor: theme.creamDark },
  content: { padding: 20, paddingTop: 56, paddingBottom: 48, gap: 14 },
  back: { marginBottom: 4 },
  backText: { fontSize: 28, fontWeight: '600', color: theme.text },
  pageTitle: { fontSize: 26, fontWeight: '800', color: theme.text, letterSpacing: -0.5 },
  missing: { fontSize: 18, marginTop: 40, textAlign: 'center' },
  hero: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  cardDark: { backgroundColor: theme.cardDark },
  name: { fontSize: 24, fontWeight: '800', color: theme.text, letterSpacing: -0.3 },
  planName: { color: theme.textMuted, fontWeight: '600', fontSize: 13 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    gap: 0,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.border,
  },
  rowLabel: { color: theme.textMuted, fontWeight: '500', fontSize: 14 },
  rowValue: { color: theme.text, fontWeight: '700', fontSize: 15 },
  noteText: { color: theme.text, fontSize: 15, lineHeight: 21, marginTop: 6 },
  mutedLight: { color: '#6B6B6B' },
  textLight: { color: '#FFFFFF' },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#FF3B300F',
    borderWidth: 1,
    borderColor: '#FF3B3040',
  },
  cancelBtnText: { color: '#FF3B30', fontWeight: '700', fontSize: 15 },
  cancelNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 16,
    borderRadius: 18,
    backgroundColor: theme.accentSoft,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cancelNoticeText: { flex: 1, color: theme.textMuted, fontWeight: '500', fontSize: 13, lineHeight: 19 },
  sectionTitle: { fontWeight: '700', fontSize: 16, color: theme.text },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.border,
  },
  planLabel: { fontWeight: '600', color: theme.text },
  planPrice: { fontWeight: '700', color: theme.accent },
  label: { fontWeight: '600', color: theme.text, marginTop: 8, fontSize: 14 },
  input: {
    backgroundColor: theme.cream,
    borderRadius: 12,
    padding: 13,
    borderWidth: 1,
    borderColor: theme.border,
    fontSize: 16,
    color: theme.text,
  },
  inputDark: { backgroundColor: '#1C1C1E', borderColor: theme.borderDark, color: '#fff' },
  savePlan: {
    backgroundColor: theme.accent,
    borderRadius: 14,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  savePlanText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    padding: 14,
  },
  deleteText: { color: '#FF3B30', fontWeight: '700', fontSize: 15 },
});
