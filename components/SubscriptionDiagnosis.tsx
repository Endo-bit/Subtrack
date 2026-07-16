import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ServiceLogo } from '@/components/ServiceLogo';
import { theme } from '@/constants/theme';
import { Strings } from '@/i18n/strings';
import { Subscription } from '@/types/subscription';
import {
  buildSession,
  diagnosisLabelKey,
  DiagnosisAnswers,
  DiagnosisSession,
  emptyAnswers,
  recommendsCancellation,
} from '@/utils/diagnosis';

type Props = {
  visible: boolean;
  onClose: () => void;
  subscriptions: Subscription[];
  t: Strings;
};

type Step = 'intro' | 'questions' | 'summary';

export function SubscriptionDiagnosis({ visible, onClose, subscriptions, t }: Props) {
  const active = useMemo(() => subscriptions.filter((s) => !s.isCancelled), [subscriptions]);
  const [step, setStep] = useState<Step>('intro');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<DiagnosisAnswers>(emptyAnswers);
  const [sessions, setSessions] = useState<DiagnosisSession[]>([]);

  const current = active[index];
  const progress = active.length ? `${index + 1} / ${active.length}` : '0 / 0';

  const reset = () => {
    setStep('intro');
    setIndex(0);
    setAnswers(emptyAnswers());
    setSessions([]);
  };

  const close = () => {
    reset();
    onClose();
  };

  const finishSub = () => {
    if (!current) return;
    const session = buildSession(current, answers);
    const nextSessions = [...sessions, session];
    setSessions(nextSessions);
    setAnswers(emptyAnswers());
    if (index + 1 < active.length) {
      setIndex(index + 1);
    } else {
      setStep('summary');
    }
  };

  const renderOption = (label: string, onPress: () => void, selected?: boolean) => (
    <Pressable key={label} onPress={onPress} style={[styles.option, selected && styles.optionActive]}>
      <Text style={[styles.optionText, selected && styles.optionTextActive]}>{label}</Text>
    </Pressable>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={close}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <ScrollView contentContainerStyle={styles.content}>
            {step === 'intro' && (
              <>
                <Text style={styles.heading}>{t.diagnosis}</Text>
                <Text style={styles.body}>{t.diagnosisIntro}</Text>
                {active.length === 0 ? (
                  <Text style={styles.muted}>{t.diagnosisEmpty}</Text>
                ) : (
                  <Pressable style={styles.primary} onPress={() => setStep('questions')}>
                    <Text style={styles.primaryText}>{t.diagnosisStart}</Text>
                  </Pressable>
                )}
              </>
            )}

            {step === 'questions' && current && (
              <>
                <Text style={styles.progress}>
                  {t.diagnosisProgress.replace('{progress}', progress)}
                </Text>
                <View style={styles.subHeader}>
                  <ServiceLogo service={current} size={48} />
                  <Text style={styles.subName}>{current.name}</Text>
                </View>

                <Text style={styles.q}>{t.diagnosisQUsage}</Text>
                <View style={styles.opts}>
                  {renderOption(t.diagnosisUsageDaily, () => setAnswers((a) => ({ ...a, usage: 3 })), answers.usage === 3)}
                  {renderOption(t.diagnosisUsageWeekly, () => setAnswers((a) => ({ ...a, usage: 2 })), answers.usage === 2)}
                  {renderOption(t.diagnosisUsageRare, () => setAnswers((a) => ({ ...a, usage: 0 })), answers.usage === 0)}
                </View>

                <Text style={styles.q}>{t.diagnosisQDuplicate}</Text>
                <View style={styles.opts}>
                  {renderOption(t.diagnosisYes, () => setAnswers((a) => ({ ...a, duplicate: true })), answers.duplicate)}
                  {renderOption(t.diagnosisNo, () => setAnswers((a) => ({ ...a, duplicate: false })), !answers.duplicate)}
                </View>

                <Text style={styles.q}>{t.diagnosisQWorth}</Text>
                <View style={styles.opts}>
                  {renderOption(t.diagnosisWorthYes, () => setAnswers((a) => ({ ...a, worthPrice: 2 })), answers.worthPrice === 2)}
                  {renderOption(t.diagnosisWorthMaybe, () => setAnswers((a) => ({ ...a, worthPrice: 1 })), answers.worthPrice === 1)}
                  {renderOption(t.diagnosisWorthNo, () => setAnswers((a) => ({ ...a, worthPrice: 0 })), answers.worthPrice === 0)}
                </View>

                <Text style={styles.q}>{t.diagnosisQForgot}</Text>
                <View style={styles.opts}>
                  {renderOption(t.diagnosisYes, () => setAnswers((a) => ({ ...a, forgot: true })), answers.forgot)}
                  {renderOption(t.diagnosisNo, () => setAnswers((a) => ({ ...a, forgot: false })), !answers.forgot)}
                </View>

                <Text style={styles.q}>{t.diagnosisQMiss}</Text>
                <View style={styles.opts}>
                  {renderOption(t.diagnosisMissYes, () => setAnswers((a) => ({ ...a, wouldMiss: 2 })), answers.wouldMiss === 2)}
                  {renderOption(t.diagnosisMissMaybe, () => setAnswers((a) => ({ ...a, wouldMiss: 1 })), answers.wouldMiss === 1)}
                  {renderOption(t.diagnosisMissNo, () => setAnswers((a) => ({ ...a, wouldMiss: 0 })), answers.wouldMiss === 0)}
                </View>

                <Pressable style={styles.primary} onPress={finishSub}>
                  <Text style={styles.primaryText}>
                    {index + 1 < active.length ? t.diagnosisNext : t.diagnosisFinish}
                  </Text>
                </Pressable>
              </>
            )}

            {step === 'summary' && (
              <>
                <Text style={styles.heading}>{t.diagnosisSummaryTitle}</Text>
                {sessions.map((s) => {
                  const labelKey = diagnosisLabelKey(s.score);
                  const cancel = recommendsCancellation(s.score);
                  return (
                    <View key={s.subscription.id} style={[styles.resultCard, cancel && styles.resultWarn]}>
                      <View style={styles.resultRow}>
                        <ServiceLogo service={s.subscription} size={36} />
                        <View style={styles.resultMain}>
                          <Text style={styles.subName}>{s.subscription.name}</Text>
                          <Text style={styles.score}>
                            {t.diagnosisScore}: {s.score}/100
                          </Text>
                          <Text style={[styles.verdict, cancel && styles.verdictWarn]}>{t[labelKey]}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
                <Pressable style={styles.primary} onPress={close}>
                  <Text style={styles.primaryText}>{t.billingDone}</Text>
                </Pressable>
              </>
            )}
          </ScrollView>
          <Pressable style={styles.ghost} onPress={close}>
            <Text style={styles.ghostText}>{t.cancel}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(45,36,32,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: theme.cream,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 12,
  },
  content: { padding: 20, gap: 14, paddingBottom: 8 },
  heading: { fontSize: 22, fontWeight: '700', color: theme.text },
  body: { fontSize: 15, color: theme.textMuted, lineHeight: 22 },
  muted: { color: theme.textMuted, fontStyle: 'italic' },
  progress: { fontSize: 13, fontWeight: '600', color: theme.accent },
  subHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  subName: { fontSize: 18, fontWeight: '700', color: theme.text, flex: 1 },
  q: { fontWeight: '700', color: theme.text, marginTop: 4 },
  opts: { gap: 8 },
  option: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.border,
  },
  optionActive: { borderColor: theme.accent, backgroundColor: theme.accentSoft },
  optionText: { fontWeight: '600', color: theme.text },
  optionTextActive: { color: theme.accent },
  primary: {
    backgroundColor: theme.text,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  resultCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.border,
  },
  resultWarn: { borderColor: theme.accent, backgroundColor: theme.accentSoft },
  resultRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  resultMain: { flex: 1, gap: 4 },
  score: { fontSize: 13, color: theme.textMuted, fontWeight: '600' },
  verdict: { fontSize: 14, fontWeight: '700', color: theme.success },
  verdictWarn: { color: theme.accent },
  ghost: { alignItems: 'center', padding: 10 },
  ghostText: { color: theme.textMuted, fontWeight: '600' },
});
