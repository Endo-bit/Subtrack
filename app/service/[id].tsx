import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
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
import { theme } from '@/constants/theme';
import { BillingCycle, Category, PresetService, ServicePlan, Subscription } from '@/types/subscription';
import { currencySymbol, formatMoney } from '@/utils/currency';
import { computeNextBillingFromStart, dailyCost, monthly } from '@/utils/subscription';

const MANUAL_SERVICE: PresetService = {
  id: 'manual',
  name: '',
  initials: '?',
  color: theme.accent,
  defaultPrice: 0,
  category: 'other',
  billingCycle: 'monthly',
  plans: [],
};

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x;
}

export default function ServiceAddScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, locale, currency, addSubscription, presetServices } = useSubTrack();
  const dark = useColorScheme() === 'dark';

  const isManual = id === 'manual';
  const service: PresetService = isManual
    ? MANUAL_SERVICE
    : (presetServices.find((s) => s.id === id) ?? MANUAL_SERVICE);

  const plans = service.plans ?? [];
  const defaultPlan = plans[0];

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(defaultPlan?.id ?? null);
  const [customMode, setCustomMode] = useState(isManual || plans.length === 0);
  const [price, setPrice] = useState(String(defaultPlan?.price ?? service.defaultPrice));
  const [cycle, setCycle] = useState<BillingCycle>(
    defaultPlan?.billingCycle ?? service.billingCycle,
  );
  const [category, setCategory] = useState<Category>(service.category);
  const [name, setName] = useState(service.name);
  const [contractStart, setContractStart] = useState(() => startOfDay(new Date()));
  const [note, setNote] = useState('');

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  const pickPlan = (plan: ServicePlan) => {
    setSelectedPlanId(plan.id);
    setCustomMode(false);
    setPrice(String(plan.price));
    setCycle(plan.billingCycle ?? service.billingCycle);
  };

  const draftSub = (): Subscription | null => {
    const amount = Number(price.replace(',', '.'));
    if (!name.trim() || Number.isNaN(amount) || amount < 0) return null;
    const startedAt = contractStart.toISOString();
    return {
      ...service,
      id: service.id,
      name: name.trim(),
      defaultPrice: amount,
      category,
      billingCycle: cycle,
      startedAt,
      nextBillingDate: computeNextBillingFromStart(contractStart, cycle).toISOString(),
      note,
      planName: customMode ? t.customPlan : selectedPlan?.name,
      customPrice: customMode,
      planChangedAt: startedAt,
      plans: service.plans,
    };
  };

  const preview = draftSub();
  const previewDaily = preview ? dailyCost(preview) : 0;
  const previewMonthly = preview ? monthly(preview) : 0;
  const money = (n: number) => formatMoney(n, currency);

  const save = () => {
    const sub = draftSub();
    if (!sub) {
      Alert.alert(t.validationTitle, t.validationBody);
      return;
    }
    const ok = addSubscription(sub);
    if (!ok) {
      Alert.alert(t.pro, t.limit, [
        { text: t.cancel, style: 'cancel' },
        { text: t.pro, onPress: () => router.push({ pathname: '/paywall', params: { source: 'limit' } }) },
      ]);
    } else {
      router.replace('/');
    }
  };

  return (
    <ScrollView
      style={[styles.screen, dark && styles.dark]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Text style={[styles.backText, dark && styles.textLight]}>←</Text>
      </Pressable>

      <View style={[styles.hero, dark && styles.cardDark]}>
        <ServiceLogo service={service} size={56} />
        <Text style={[styles.heroName, dark && styles.textLight]}>
          {isManual ? t.manual : service.name}
        </Text>
      </View>

      {isManual && (
        <View style={styles.section}>
          <Text style={[styles.label, dark && styles.textLight]}>{t.name}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={[styles.input, dark && styles.inputDark]}
            placeholder={t.name}
            placeholderTextColor={theme.textMuted}
          />
        </View>
      )}

      {!isManual && plans.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.label, dark && styles.textLight]}>{t.selectPlan}</Text>
          <View style={styles.planList}>
            {plans.map((plan) => (
              <Pressable
                key={plan.id}
                onPress={() => pickPlan(plan)}
                style={[
                  styles.planCard,
                  dark && styles.planCardDark,
                  selectedPlanId === plan.id && !customMode && styles.planCardActive,
                ]}
              >
                <View style={styles.planCardInner}>
                  <Text style={[styles.planName, dark && styles.textLight]}>{plan.name}</Text>
                  {plan.billingCycle && plan.billingCycle !== 'monthly' && (
                    <Text style={styles.planCycleTag}>
                      {plan.billingCycle === 'annual' ? t.cycleAnnual : t.cycleQuarterly}
                    </Text>
                  )}
                </View>
                <Text style={styles.planPrice}>{money(plan.price)}</Text>
              </Pressable>
            ))}
            <Pressable
              onPress={() => {
                setCustomMode(true);
                setSelectedPlanId(null);
              }}
              style={[
                styles.planCard,
                dark && styles.planCardDark,
                customMode && styles.planCardActive,
              ]}
            >
              <Text style={[styles.planName, dark && styles.textLight]}>{t.customPrice}</Text>
            </Pressable>
          </View>
        </View>
      )}

      {(customMode || isManual) && (
        <View style={styles.section}>
          <Text style={[styles.label, dark && styles.textLight]}>{`${t.price} (${currencySymbol(currency)})`}</Text>
          <TextInput
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
            style={[styles.input, dark && styles.inputDark]}
            placeholder="0.00"
            placeholderTextColor={theme.textMuted}
          />
        </View>
      )}

      {isManual && (
        <>
          <View style={styles.section}>
            <Text style={[styles.label, dark && styles.textLight]}>{t.cycle}</Text>
            <View style={styles.chips}>
              {(
                [
                  { key: 'monthly', label: t.cycleMonthly },
                  { key: 'quarterly', label: t.cycleQuarterly },
                  { key: 'annual', label: t.cycleAnnual },
                ] as { key: BillingCycle; label: string }[]
              ).map((c) => (
                <Pressable
                  key={c.key}
                  onPress={() => setCycle(c.key)}
                  style={[styles.chip, cycle === c.key && styles.chipActive]}
                >
                  <Text style={[styles.chipText, cycle === c.key && styles.chipTextActive]}>
                    {c.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={styles.section}>
            <Text style={[styles.label, dark && styles.textLight]}>{t.category}</Text>
            <View style={styles.chips}>
              {(
                [
                  { key: 'streaming', label: t.catStreaming },
                  { key: 'music', label: t.catMusic },
                  { key: 'productivity', label: t.catProductivity },
                  { key: 'gaming', label: t.catGaming },
                  { key: 'health', label: t.catHealth },
                  { key: 'news', label: t.catNews },
                  { key: 'other', label: t.catOther },
                ] as { key: Category; label: string }[]
              ).map((c) => (
                <Pressable
                  key={c.key}
                  onPress={() => setCategory(c.key)}
                  style={[styles.chip, category === c.key && styles.chipActive]}
                >
                  <Text style={[styles.chipText, category === c.key && styles.chipTextActive]}>
                    {c.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </>
      )}

      <BillingDatePicker
        value={contractStart}
        onChange={setContractStart}
        t={t}
        locale={locale}
        dark={dark}
      />

      {preview && (
        <View style={styles.costRow}>
          <View style={styles.costPill}>
            <Text style={styles.costPillLabel}>{t.dailyCostLabel}</Text>
            <Text style={styles.costPillValue}>
              {money(previewDaily)}
              {t.perDay}
            </Text>
          </View>
          <View style={styles.costPill}>
            <Text style={styles.costPillLabel}>{t.monthlyCostLabel}</Text>
            <Text style={styles.costPillValue}>{money(previewMonthly)}</Text>
          </View>
          <View style={styles.costPill}>
            <Text style={styles.costPillLabel}>{t.yearlyCostLabel}</Text>
            <Text style={styles.costPillValue}>{money(previewMonthly * 12)}</Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.label, dark && styles.textLight]}>{t.note}</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          style={[styles.input, dark && styles.inputDark]}
          placeholderTextColor={theme.textMuted}
        />
      </View>

      <Pressable style={styles.save} onPress={save}>
        <Text style={styles.saveText}>{t.save}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.cream },
  dark: { backgroundColor: theme.creamDark },
  content: { padding: 20, paddingTop: 56, paddingBottom: 48, gap: 16 },
  back: { marginBottom: 4 },
  backText: { fontSize: 28, fontWeight: '600', color: theme.text },
  hero: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    gap: 10,
  },
  cardDark: { backgroundColor: theme.cardDark },
  heroName: { fontSize: 22, fontWeight: '700', color: theme.text },
  textLight: { color: '#F5EDE8' },
  section: { gap: 8 },
  label: { fontWeight: '600', color: theme.text, fontSize: 14 },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    color: theme.text,
    borderWidth: 1,
    borderColor: theme.border,
  },
  inputDark: { backgroundColor: theme.cardDark, borderColor: theme.borderDark, color: '#fff' },
  planList: { gap: 10 },
  planCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: theme.border,
  },
  planCardDark: { backgroundColor: theme.cardDark, borderColor: theme.borderDark },
  planCardActive: { borderColor: theme.accent, borderWidth: 2 },
  planCardInner: { gap: 2 },
  planName: { fontWeight: '600', color: theme.text, fontSize: 15 },
  planCycleTag: { fontSize: 11, color: theme.textMuted, fontWeight: '600' },
  planPrice: { fontWeight: '700', color: theme.accent, fontSize: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 999,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: theme.border,
  },
  chipActive: { backgroundColor: theme.accent, borderColor: theme.accent },
  chipText: { color: theme.textMuted, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  costRow: { flexDirection: 'row', gap: 8 },
  costPill: {
    flex: 1,
    backgroundColor: theme.accentSoft,
    borderRadius: 14,
    padding: 12,
  },
  costPillLabel: { fontSize: 11, color: theme.textMuted, fontWeight: '600' },
  costPillValue: { fontSize: 13, fontWeight: '700', color: theme.text, marginTop: 4 },
  save: {
    backgroundColor: theme.text,
    padding: 18,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 4,
  },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 17 },
});
