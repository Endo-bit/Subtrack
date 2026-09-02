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
import { track } from '@/utils/analytics';
import { BillingCycle, Category, PresetService, ServicePlan, Subscription } from '@/types/subscription';
import { CURRENCIES, currencySymbol, formatMoney } from '@/utils/currency';
import { pickCustomIcon } from '@/utils/iconPicker';
import { computeNextBillingFromStart, dailyCost, monthly } from '@/utils/subscription';

const TRIAL_DAY_OPTIONS = [7, 14, 30, 60, 90] as const;

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
  // `continueSubId` arrives from the post-trial prompt: instead of creating a subscription, this
  // screen then re-prices an existing one onto the paid plan the user has moved to.
  const { id, continueSubId } = useLocalSearchParams<{ id: string; continueSubId?: string }>();
  const {
    t,
    locale,
    currency,
    isPro,
    addSubscription,
    updateSubscription,
    subscriptions,
    presetServices,
    convert,
    catalogPrice,
  } = useSubTrack();
  const dark = useColorScheme() === 'dark';

  const continuingSub = continueSubId
    ? subscriptions.find((sub) => sub.id === continueSubId)
    : undefined;

  const isManual = id === 'manual';
  const service: PresetService = isManual
    ? MANUAL_SERVICE
    : (presetServices.find((s) => s.id === id) ?? MANUAL_SERVICE);

  const plans = service.plans ?? [];
  const defaultPlan = plans[0];

  // The plan the subscription was already on, so "continue" opens with it preselected rather
  // than silently resetting the user to the cheapest tier.
  const continuingPlan = continuingSub
    ? plans.find((p) => p.name === continuingSub.planName)
    : undefined;

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(
    continuingPlan?.id ?? defaultPlan?.id ?? null,
  );
  const [customMode, setCustomMode] = useState(
    isManual || plans.length === 0 || (!!continuingSub && !continuingPlan),
  );
  // Catalogue prices are EUR; the field is denominated in `subCurrency`, so convert on the way
  // in. An existing subscription's price is already in its own currency and passes through.
  const [price, setPrice] = useState(
    String(
      continuingSub?.defaultPrice ??
        catalogPrice(defaultPlan?.price ?? service.defaultPrice).amount,
    ),
  );
  const [cycle, setCycle] = useState<BillingCycle>(
    continuingSub?.billingCycle ?? defaultPlan?.billingCycle ?? service.billingCycle,
  );
  const [category, setCategory] = useState<Category>(continuingSub?.category ?? service.category);
  const [name, setName] = useState(continuingSub?.name ?? service.name);
  const [contractStart, setContractStart] = useState(() =>
    startOfDay(continuingSub ? new Date(continuingSub.startedAt) : new Date()),
  );
  const [note, setNote] = useState(continuingSub?.note ?? '');
  const [customLogo, setCustomLogo] = useState<string | undefined>(continuingSub?.logo);
  // The trial being over is the whole reason this screen is open, so never re-offer one here.
  const [freeTrial, setFreeTrial] = useState(false);
  const [trialDays, setTrialDays] = useState<number>(7);
  const [subCurrency, setSubCurrency] = useState(continuingSub?.currency ?? currency);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);
  const displayService: PresetService = { ...service, logo: customLogo ?? service.logo };

  const pickPlan = (plan: ServicePlan) => {
    setSelectedPlanId(plan.id);
    setCustomMode(false);
    setPrice(String(catalogPrice(plan.price).amount));
    setCycle(plan.billingCycle ?? service.billingCycle);
  };

  const cycleMonths = (c: BillingCycle) => (c === 'annual' ? 12 : c === 'quarterly' ? 3 : 1);

  /** Re-prices a plan for a different billing cycle via its monthly-equivalent (e.g. 9.99/mo → 119.88/yr). */
  const priceForCycle = (basePrice: number, baseCycle: BillingCycle, newCycle: BillingCycle) => {
    const monthlyEquivalent = basePrice / cycleMonths(baseCycle);
    return Math.round(monthlyEquivalent * cycleMonths(newCycle) * 100) / 100;
  };

  const pickCycle = (next: BillingCycle) => {
    if (next === cycle) return;
    const numeric = Number(price.replace(',', '.')) || 0;
    setPrice(String(priceForCycle(numeric, cycle, next)));
    setCycle(next);
    // Preset plans don't carry annual/quarterly pricing — once the user picks a
    // different cycle, the price becomes an editable estimate (customMode).
    if (!isManual && !customMode) {
      setCustomMode(true);
      setSelectedPlanId(null);
    }
  };

  const pickIcon = async () => {
    if (!isPro) {
      router.push({ pathname: '/paywall', params: { source: 'custom-icon' } });
      return;
    }
    const result = await pickCustomIcon();
    if (result.status === 'picked') setCustomLogo(result.uri);
    else if (result.status === 'denied') Alert.alert(t.photoPermissionDenied);
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
      logo: customLogo ?? service.logo,
      trialEndsAt: freeTrial
        ? new Date(contractStart.getTime() + trialDays * 86400000).toISOString()
        : undefined,
      currency: isPro ? subCurrency : undefined,
    };
  };

  const preview = draftSub();
  const previewDaily = preview ? dailyCost(preview, convert) : 0;
  const previewMonthly = preview ? monthly(preview, convert) : 0;
  const money = (n: number) => formatMoney(n, currency);

  const save = () => {
    const sub = draftSub();
    if (!sub) {
      Alert.alert(t.validationTitle, t.validationBody);
      return;
    }

    if (continuingSub) {
      updateSubscription(continuingSub.id, {
        name: sub.name,
        defaultPrice: sub.defaultPrice,
        billingCycle: sub.billingCycle,
        category: sub.category,
        planName: sub.planName,
        customPrice: sub.customPrice,
        currency: sub.currency,
        note: sub.note,
        startedAt: sub.startedAt,
        planChangedAt: new Date().toISOString(),
        // The trial is spent and the user is staying: clearing it resumes normal billing and
        // makes reminders start counting real charges again.
        trialEndsAt: undefined,
        trialFollowUpAnsweredAt: new Date().toISOString(),
      });
      track.planChanged({ name: sub.name, plan: sub.planName ?? t.customPlan, price: sub.defaultPrice });
      router.replace('/');
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

      {!!continuingSub && (
        <View style={styles.continueBanner}>
          <Text style={styles.continueBannerTitle}>{t.continuePlanTitle}</Text>
          <Text style={styles.continueBannerBody}>
            {t.continuePlanBody.replace('{name}', continuingSub.name)}
          </Text>
        </View>
      )}

      <View style={[styles.hero, dark && styles.cardDark]}>
        <ServiceLogo service={displayService} size={56} />
        <Text style={[styles.heroName, dark && styles.textLight]}>
          {isManual ? t.manual : service.name}
        </Text>
        {isManual && (
          <Pressable onPress={pickIcon} accessibilityRole="button" accessibilityLabel={t.choosePhoto}>
            <Text style={styles.choosePhotoText}>
              {t.choosePhoto}
              {!isPro ? ` · ${t.pro}` : ''}
            </Text>
          </Pressable>
        )}
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
                <Text style={styles.planPrice}>
                  {(({ amount, currency: c }) => formatMoney(amount, c))(catalogPrice(plan.price))}
                </Text>
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
          <Text style={[styles.label, dark && styles.textLight]}>{`${t.price} (${currencySymbol(subCurrency)})`}</Text>
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

      <View style={styles.section}>
        <Text style={[styles.label, dark && styles.textLight]}>
          {t.currency}
          {!isPro ? ` · ${t.pro}` : ''}
        </Text>
        <View style={styles.chips}>
          {CURRENCIES.map((c) => (
            <Pressable
              key={c.code}
              onPress={() => {
                if (!isPro) {
                  router.push({ pathname: '/paywall', params: { source: 'currency' } });
                  return;
                }
                setSubCurrency(c.code);
              }}
              style={[styles.chip, subCurrency === c.code && styles.chipActive]}
            >
              <Text style={[styles.chipText, subCurrency === c.code && styles.chipTextActive]}>
                {c.symbol} {c.code}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

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
              onPress={() => pickCycle(c.key)}
              style={[styles.chip, cycle === c.key && styles.chipActive]}
            >
              <Text style={[styles.chipText, cycle === c.key && styles.chipTextActive]}>
                {c.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {isManual && (
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
      )}

      <BillingDatePicker
        value={contractStart}
        onChange={setContractStart}
        t={t}
        locale={locale}
        dark={dark}
      />

      {!continuingSub && (
      <View style={styles.section}>
        <Pressable
          style={styles.trialToggle}
          onPress={() => setFreeTrial((v) => !v)}
          accessibilityRole="switch"
          accessibilityState={{ checked: freeTrial }}
        >
          <View style={[styles.checkbox, freeTrial && styles.checkboxActive]}>
            {freeTrial && <Text style={styles.checkboxMark}>✓</Text>}
          </View>
          <Text style={[styles.label, dark && styles.textLight]}>{t.freeTrial}</Text>
        </Pressable>
        {freeTrial && (
          <>
            <Text style={[styles.label, dark && styles.textLight]}>{t.freeTrialDuration}</Text>
            <View style={styles.chips}>
              {TRIAL_DAY_OPTIONS.map((d) => (
                <Pressable
                  key={d}
                  onPress={() => setTrialDays(d)}
                  style={[styles.chip, trialDays === d && styles.chipActive]}
                >
                  <Text style={[styles.chipText, trialDays === d && styles.chipTextActive]}>
                    {d} {t.freeTrialDaysUnit}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </View>
      )}

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
        <Text style={styles.saveText}>{continuingSub ? t.continuePlanSave : t.save}</Text>
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
  continueBanner: {
    backgroundColor: theme.accentSoft,
    borderRadius: 18,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: theme.accent,
  },
  continueBannerTitle: { fontSize: 16, fontWeight: '700', color: theme.accent },
  continueBannerBody: { fontSize: 14, lineHeight: 20, color: theme.text },
  heroName: { fontSize: 22, fontWeight: '700', color: theme.text },
  choosePhotoText: { color: theme.accent, fontWeight: '600', fontSize: 13 },
  trialToggle: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: theme.accent, borderColor: theme.accent },
  checkboxMark: { color: '#FFF', fontSize: 13, fontWeight: '800' },
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
