import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BillingDatePicker } from '@/components/BillingDatePicker';
import { ServiceLogo } from '@/components/ServiceLogo';
import { theme } from '@/constants/theme';
import { useSubTrack } from '@/context/SubTrackContext';
import { Strings } from '@/i18n/strings';
import { BillingCycle, Category, PresetService, ServicePlan, Subscription } from '@/types/subscription';
import { computeNextBillingFromStart, dailyCost, monthly } from '@/utils/subscription';

type Props = {
  visible: boolean;
  service: PresetService | null;
  onClose: () => void;
  onSaved: () => void;
};

export function ServiceAddSheet({ visible, service, onClose, onSaved }: Props) {
  const { t, locale, addSubscription } = useSubTrack();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [customMode, setCustomMode] = useState(false);
  const [price, setPrice] = useState('');
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [category, setCategory] = useState<Category>('other');
  const [name, setName] = useState('');
  const [contractStart, setContractStart] = useState(() => startOfDay(new Date()));
  const [note, setNote] = useState('');

  const isManual = service?.id === 'manual';

  useEffect(() => {
    if (!service || !visible) return;
    const defaultPlan = service.plans[0];
    setSelectedPlanId(defaultPlan?.id ?? null);
    setCustomMode(false);
    setName(service.name);
    setPrice(String(defaultPlan?.price ?? service.defaultPrice));
    setCycle(defaultPlan?.billingCycle ?? service.billingCycle);
    setCategory(service.category);
    setContractStart(startOfDay(new Date()));
    setNote('');
  }, [service, visible]);

  if (!service) return null;

  const plans = service.plans.length ? service.plans : [];
  const selectedPlan = plans.find((p) => p.id === selectedPlanId) ?? plans[0];

  const pickPlan = (plan: ServicePlan) => {
    setSelectedPlanId(plan.id);
    setCustomMode(false);
    setPrice(String(plan.price));
    setCycle(plan.billingCycle ?? service.billingCycle);
  };

  const draftSub = (): Subscription | null => {
    const amount = Number(price.replace(',', '.'));
    if (!name.trim() || Number.isNaN(amount)) return null;
    const startedAt = contractStart.toISOString();
    const base: Subscription = {
      ...service,
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
    };
    return base;
  };

  const preview = draftSub();
  const previewDaily = preview ? dailyCost(preview) : 0;
  const previewMonthly = preview ? monthly(preview) : 0;

  const save = () => {
    const sub = draftSub();
    if (!sub) {
      Alert.alert(t.validationTitle, t.validationBody);
      return;
    }
    const ok = addSubscription(sub);
    if (!ok) Alert.alert(t.pro, t.limit);
    else {
      onSaved();
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <ServiceLogo service={service} size={48} />
              <Text style={styles.title}>{isManual ? t.manual : service.name}</Text>
              <Pressable onPress={onClose} hitSlop={12}>
                <Text style={styles.close}>✕</Text>
              </Pressable>
            </View>

            {isManual && (
              <>
                <Label t={t} text={t.name} />
                <TextInput value={name} onChangeText={setName} style={styles.input} placeholder={t.name} />
              </>
            )}

            {!isManual && plans.length > 0 && (
              <>
                <Label t={t} text={t.selectPlan} />
                <View style={styles.planList}>
                  {plans.map((plan) => (
                    <Pressable
                      key={plan.id}
                      onPress={() => pickPlan(plan)}
                      style={[
                        styles.planRow,
                        selectedPlanId === plan.id && !customMode && styles.planRowActive,
                      ]}
                    >
                      <Text style={styles.planName}>{plan.name}</Text>
                      <Text style={styles.planPrice}>€{plan.price.toFixed(2)}</Text>
                    </Pressable>
                  ))}
                  <Pressable
                    onPress={() => setCustomMode(true)}
                    style={[styles.planRow, customMode && styles.planRowActive]}
                  >
                    <Text style={styles.planName}>{t.customPrice}</Text>
                  </Pressable>
                </View>
              </>
            )}

            {(customMode || isManual) && (
              <>
                <Label t={t} text={`${t.price} (€)`} />
                <TextInput
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  style={styles.input}
                />
              </>
            )}

            {isManual && (
              <>
                <Label t={t} text={t.cycle} />
                <CycleChips cycle={cycle} setCycle={setCycle} t={t} />
                <Label t={t} text={t.category} />
                <CategoryChips category={category} setCategory={setCategory} t={t} />
              </>
            )}

            <BillingDatePicker value={contractStart} onChange={setContractStart} t={t} locale={locale} />

            {preview && (
              <View style={styles.costPreview}>
                <CostPill label={t.dailyCostLabel} value={`€${previewDaily.toFixed(2)}${t.perDay}`} />
                <CostPill label={t.monthlyCostLabel} value={`€${previewMonthly.toFixed(2)}`} />
              </View>
            )}

            <Label t={t} text={t.note} />
            <TextInput value={note} onChangeText={setNote} style={styles.input} />

            <Pressable style={styles.save} onPress={save}>
              <Text style={styles.saveText}>{t.save}</Text>
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x;
}

function Label({ text }: { t: Strings; text: string }) {
  return <Text style={styles.label}>{text}</Text>;
}

function CostPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.costPill}>
      <Text style={styles.costPillLabel}>{label}</Text>
      <Text style={styles.costPillValue}>{value}</Text>
    </View>
  );
}

function CycleChips({
  cycle,
  setCycle,
  t,
}: {
  cycle: BillingCycle;
  setCycle: (c: BillingCycle) => void;
  t: Strings;
}) {
  const cycles: { key: BillingCycle; label: string }[] = [
    { key: 'monthly', label: t.cycleMonthly },
    { key: 'quarterly', label: t.cycleQuarterly },
    { key: 'annual', label: t.cycleAnnual },
  ];
  return (
    <View style={styles.chips}>
      {cycles.map((c) => (
        <Pressable
          key={c.key}
          onPress={() => setCycle(c.key)}
          style={[styles.chip, cycle === c.key && styles.chipActive]}
        >
          <Text style={[styles.chipText, cycle === c.key && styles.chipTextActive]}>{c.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function CategoryChips({
  category,
  setCategory,
  t,
}: {
  category: Category;
  setCategory: (c: Category) => void;
  t: Strings;
}) {
  const cats: { key: Category; label: string }[] = [
    { key: 'streaming', label: t.catStreaming },
    { key: 'music', label: t.catMusic },
    { key: 'productivity', label: t.catProductivity },
    { key: 'gaming', label: t.catGaming },
    { key: 'health', label: t.catHealth },
    { key: 'news', label: t.catNews },
    { key: 'other', label: t.catOther },
  ];
  return (
    <View style={styles.chips}>
      {cats.map((c) => (
        <Pressable
          key={c.key}
          onPress={() => setCategory(c.key)}
          style={[styles.chip, category === c.key && styles.chipActive]}
        >
          <Text style={[styles.chipText, category === c.key && styles.chipTextActive]}>{c.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(45,36,32,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: theme.cream,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
  },
  content: { padding: 20, paddingBottom: 36, gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  title: { flex: 1, fontSize: 20, fontWeight: '700', color: theme.text },
  close: { fontSize: 22, color: theme.textMuted, padding: 4 },
  label: { fontWeight: '600', color: theme.text, marginTop: 6 },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    color: theme.text,
    borderWidth: 1,
    borderColor: theme.border,
  },
  planList: { gap: 8 },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: theme.border,
  },
  planRowActive: { borderColor: theme.accent, borderWidth: 2 },
  planName: { fontWeight: '600', color: theme.text },
  planPrice: { fontWeight: '700', color: theme.accent },
  costPreview: { flexDirection: 'row', gap: 10, marginTop: 4 },
  costPill: {
    flex: 1,
    backgroundColor: theme.accentSoft,
    borderRadius: 14,
    padding: 12,
  },
  costPillLabel: { fontSize: 12, color: theme.textMuted, fontWeight: '600' },
  costPillValue: { fontSize: 16, fontWeight: '700', color: theme.text, marginTop: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 9, paddingHorizontal: 13, borderRadius: 999, backgroundColor: '#FFF' },
  chipActive: { backgroundColor: theme.accent },
  chipText: { color: theme.textMuted, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  save: {
    backgroundColor: theme.text,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
