import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SavingsCard } from '@/components/SavingsCard';
import { ServiceLogo } from '@/components/ServiceLogo';
import { ShareSummarySheet } from '@/components/ShareSummarySheet';
import { theme } from '@/constants/theme';
import { Strings } from '@/i18n/strings';
import { PresetService, Subscription } from '@/types/subscription';
import { CurrencyCode } from '@/utils/currency';
import {
  buildSession,
  diagnosisLabelKey,
  DiagnosisAnswers,
  DiagnosisRecord,
  DiagnosisSession,
  emptyAnswers,
  toDiagnosisRecord,
} from '@/utils/diagnosis';
import { ConvertFn } from '@/utils/subscription';

type HistoryGroup = {
  dateKey: string;
  dateLabel: string;
  records: DiagnosisRecord[];
};

/** Groups diagnosis records by local calendar date, newest first — each group becomes its own results page. */
function groupHistoryByDate(history: DiagnosisRecord[], locale: string): HistoryGroup[] {
  const map = new Map<string, DiagnosisRecord[]>();
  for (const r of history) {
    const d = new Date(r.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(r);
  }
  return Array.from(map.entries())
    .map(([dateKey, records]) => ({
      dateKey,
      dateLabel: new Date(records[0].createdAt).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      records,
    }))
    .sort((a, b) => new Date(b.records[0].createdAt).getTime() - new Date(a.records[0].createdAt).getTime());
}

/** Score-tier colors: >=70 keep (green), >=45 review (amber), below cancel (red). */
function verdictTone(score: number): string {
  if (score >= 70) return theme.success;
  if (score >= 45) return '#D4920A';
  return '#D64545';
}

function ResultCard({
  service,
  name,
  score,
  verdictText,
  scoreLabel,
  dateLabel,
  isCancelled,
  onCancel,
  cancelLabel,
  cancelledLabel,
}: {
  service: Pick<PresetService, 'name' | 'initials' | 'color' | 'logo'>;
  name: string;
  score: number;
  verdictText: string;
  scoreLabel: string;
  dateLabel?: string;
  isCancelled?: boolean;
  onCancel?: () => void;
  cancelLabel?: string;
  cancelledLabel?: string;
}) {
  const tone = verdictTone(score);
  return (
    <View style={styles.resultCard}>
      <View style={styles.resultTopRow}>
        <ServiceLogo service={service} size={40} />
        <View style={styles.resultMain}>
          <Text style={styles.subName} numberOfLines={1}>{name}</Text>
          {!!dateLabel && <Text style={styles.resultDate}>{dateLabel}</Text>}
        </View>
        <View style={[styles.scorePill, { backgroundColor: `${tone}1F` }]}>
          <Text style={[styles.scorePillText, { color: tone }]}>{score}</Text>
          <Text style={[styles.scorePillLabel, { color: tone }]}>{scoreLabel}</Text>
        </View>
      </View>
      <View style={styles.scoreTrack}>
        <View style={[styles.scoreFill, { width: `${score}%`, backgroundColor: tone }]} />
      </View>
      <Text style={[styles.verdict, { color: tone }]}>{verdictText}</Text>
      {!!onCancel &&
        (isCancelled ? (
          <View style={styles.cancelledBadge}>
            <Text style={styles.cancelledBadgeText}>{cancelledLabel}</Text>
          </View>
        ) : (
          <Pressable
            style={styles.cancelBtn}
            onPress={onCancel}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={cancelLabel}
          >
            <Text style={styles.cancelBtnText}>{cancelLabel}</Text>
          </Pressable>
        ))}
    </View>
  );
}

type Props = {
  visible: boolean;
  onClose: () => void;
  subscriptions: Subscription[];
  t: Strings;
  locale: string;
  isPro: boolean;
  diagnosisHistory: DiagnosisRecord[];
  onRecordDiagnosis: (record: DiagnosisRecord) => void;
  onOpenPaywall: () => void;
  onCancelSubscription: (id: string) => void;
  currency: CurrencyCode;
  convert?: ConvertFn;
};

type Step = 'intro' | 'questions' | 'summary' | 'history' | 'historyDetail';

export function SubscriptionDiagnosis({
  visible,
  onClose,
  subscriptions,
  t,
  locale,
  isPro,
  diagnosisHistory,
  onRecordDiagnosis,
  onOpenPaywall,
  onCancelSubscription,
  currency,
  convert,
}: Props) {
  const active = useMemo(() => subscriptions.filter((s) => !s.isCancelled), [subscriptions]);
  const cancelledSubs = useMemo(() => subscriptions.filter((s) => s.isCancelled), [subscriptions]);
  const historyGroups = useMemo(
    () => groupHistoryByDate(diagnosisHistory, locale),
    [diagnosisHistory, locale],
  );
  const diagnosedIds = useMemo(
    () => new Set(diagnosisHistory.map((r) => r.subscriptionId)),
    [diagnosisHistory],
  );
  // Live list — recomputes as diagnosisHistory grows, used only to decide what's
  // eligible before a run starts (shown on the 'intro' step).
  const diagnosable = useMemo(
    () => active.filter((s) => isPro || !diagnosedIds.has(s.id)),
    [active, isPro, diagnosedIds],
  );

  const [step, setStep] = useState<Step>('intro');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<DiagnosisAnswers>(emptyAnswers);
  const [sessions, setSessions] = useState<DiagnosisSession[]>([]);
  // Frozen snapshot of the subs being diagnosed in the current run. `diagnosable`
  // shrinks the moment a sub is recorded (diagnosisHistory updates immediately),
  // so indexing into it live mid-run desyncs `index` and can skip a subscription
  // or land on `undefined` (rendering a blank screen). Freezing it at the start
  // of the run keeps the list stable until the user finishes or closes.
  const [sessionSubs, setSessionSubs] = useState<Subscription[]>([]);
  const [selectedHistoryDate, setSelectedHistoryDate] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const current = sessionSubs[index];
  const progress = sessionSubs.length ? `${index + 1} / ${sessionSubs.length}` : '0 / 0';
  const selectedGroup = useMemo(
    () => historyGroups.find((g) => g.dateKey === selectedHistoryDate) ?? null,
    [historyGroups, selectedHistoryDate],
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [step, index]);

  const reset = () => {
    setStep('intro');
    setIndex(0);
    setAnswers(emptyAnswers());
    setSessions([]);
    setSessionSubs([]);
    setSelectedHistoryDate(null);
    setShareOpen(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  const start = () => {
    setSessionSubs(diagnosable);
    setStep('questions');
  };

  const finishSub = () => {
    if (!current) return;
    const session = buildSession(current, answers);
    setSessions((prev) => [...prev, session]);
    onRecordDiagnosis(toDiagnosisRecord(session));
    setAnswers(emptyAnswers());
    if (index + 1 < sessionSubs.length) {
      setIndex(index + 1);
    } else {
      setStep('summary');
    }
  };

  const confirmCancel = (sub: Pick<Subscription, 'id' | 'name'>) => {
    Alert.alert(
      t.diagnosisCancelConfirmTitle,
      t.diagnosisCancelConfirmBody.replace('{name}', sub.name),
      [
        { text: t.cancel, style: 'cancel' },
        { text: t.diagnosisCancelConfirm, style: 'destructive', onPress: () => onCancelSubscription(sub.id) },
      ],
    );
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
          <ScrollView ref={scrollRef} style={styles.scrollArea} contentContainerStyle={styles.content}>
            {step === 'intro' && (
              <>
                <Text style={styles.heading}>{t.diagnosis}</Text>
                <Text style={styles.body}>{t.diagnosisIntro}</Text>
                {active.length === 0 ? (
                  <Text style={styles.muted}>{t.diagnosisEmpty}</Text>
                ) : diagnosable.length === 0 ? (
                  <>
                    <Text style={styles.subName}>{t.diagnosisAlreadyDoneTitle}</Text>
                    <Text style={styles.body}>{t.diagnosisAlreadyDoneBody}</Text>
                    <Pressable style={styles.primary} onPress={onOpenPaywall}>
                      <Text style={styles.primaryText}>{t.pro}</Text>
                    </Pressable>
                  </>
                ) : (
                  <Pressable style={styles.primary} onPress={start}>
                    <Text style={styles.primaryText}>{t.diagnosisStart}</Text>
                  </Pressable>
                )}
                {diagnosisHistory.length > 0 && (
                  <Pressable style={styles.ghost} onPress={() => setStep('history')}>
                    <Text style={styles.ghostText}>{t.diagnosisViewHistory}</Text>
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
                    {index + 1 < sessionSubs.length ? t.diagnosisNext : t.diagnosisFinish}
                  </Text>
                </Pressable>
              </>
            )}

            {step === 'summary' && (
              <>
                <Text style={styles.heading}>{t.diagnosisSummaryTitle}</Text>
                {sessions.map((s) => {
                  const live = subscriptions.find((sub) => sub.id === s.subscription.id);
                  return (
                    <ResultCard
                      key={s.subscription.id}
                      service={s.subscription}
                      name={s.subscription.name}
                      score={s.score}
                      verdictText={t[diagnosisLabelKey(s.score)]}
                      scoreLabel={t.diagnosisScore}
                      isCancelled={live?.isCancelled}
                      onCancel={() => confirmCancel(live ?? s.subscription)}
                      cancelLabel={t.diagnosisCancelButton}
                      cancelledLabel={t.diagnosisCancelled}
                    />
                  );
                })}
                <SavingsCard cancelledSubs={cancelledSubs} currency={currency} convert={convert} t={t} />
                <Pressable style={styles.shareBtn} onPress={() => setShareOpen(true)}>
                  <Text style={styles.shareBtnText}>{t.shareDiagnosisPrompt}</Text>
                </Pressable>
                <Pressable style={styles.primary} onPress={close}>
                  <Text style={styles.primaryText}>{t.billingDone}</Text>
                </Pressable>
              </>
            )}

            {step === 'history' && (
              <>
                <Text style={styles.heading}>{t.diagnosisHistoryTitle}</Text>
                {historyGroups.map((g) => {
                  const lowCount = g.records.filter((r) => r.score <= 50).length;
                  const tone = lowCount > 0 ? '#D64545' : theme.success;
                  return (
                    <Pressable
                      key={g.dateKey}
                      style={styles.historyRow}
                      onPress={() => {
                        setSelectedHistoryDate(g.dateKey);
                        setStep('historyDetail');
                      }}
                    >
                      <View style={styles.historyRowMain}>
                        <Text style={styles.historyRowDate}>{g.dateLabel}</Text>
                        <Text style={styles.historyRowCount}>
                          {t.diagnosisHistoryCount.replace('{n}', String(g.records.length))}
                        </Text>
                      </View>
                      <View style={[styles.scorePill, { backgroundColor: `${tone}1F` }]}>
                        <Text style={[styles.scorePillText, { color: tone }]}>{lowCount}</Text>
                        <Text style={[styles.scorePillLabel, { color: tone }]}>{t.diagnosisHistoryLowLabel}</Text>
                      </View>
                    </Pressable>
                  );
                })}
                <SavingsCard cancelledSubs={cancelledSubs} currency={currency} convert={convert} t={t} />
                <Pressable style={styles.primary} onPress={() => setStep('intro')}>
                  <Text style={styles.primaryText}>{t.back}</Text>
                </Pressable>
              </>
            )}

            {step === 'historyDetail' && selectedGroup && (
              <>
                <Pressable style={styles.ghost} onPress={() => setStep('history')}>
                  <Text style={styles.ghostText}>← {t.back}</Text>
                </Pressable>
                <Text style={styles.heading}>{selectedGroup.dateLabel}</Text>
                {selectedGroup.records.map((r, i) => {
                  const sub = subscriptions.find((s) => s.id === r.subscriptionId);
                  const fallback = {
                    name: r.subscriptionName,
                    initials: r.subscriptionName.slice(0, 2).toUpperCase(),
                    color: theme.textMuted,
                  };
                  return (
                    <ResultCard
                      key={`${r.subscriptionId}-${r.createdAt}-${i}`}
                      service={sub ?? fallback}
                      name={r.subscriptionName}
                      score={r.score}
                      verdictText={t[diagnosisLabelKey(r.score)]}
                      scoreLabel={t.diagnosisScore}
                      isCancelled={sub?.isCancelled}
                      onCancel={sub ? () => confirmCancel(sub) : undefined}
                      cancelLabel={t.diagnosisCancelButton}
                      cancelledLabel={t.diagnosisCancelled}
                    />
                  );
                })}
              </>
            )}
          </ScrollView>
          <Pressable style={styles.ghost} onPress={close}>
            <Text style={styles.ghostText}>{t.cancel}</Text>
          </Pressable>
        </View>
      </View>

      <ShareSummarySheet visible={shareOpen} onClose={() => setShareOpen(false)} source="diagnosis" />
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
  // Without flexShrink, a ScrollView with no other size hint renders at its full
  // content height instead of the space left inside `sheet`'s maxHeight cap —
  // it never becomes scrollable and just gets cut off at the sheet's bottom edge.
  scrollArea: { flexShrink: 1 },
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
  shareBtn: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.accent,
    paddingVertical: 15,
    alignItems: 'center',
  },
  shareBtnText: { color: theme.accent, fontWeight: '700', fontSize: 15 },
  resultCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 12,
  },
  resultTopRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  resultMain: { flex: 1, gap: 2 },
  resultDate: { fontSize: 12, color: theme.textMuted, fontWeight: '600' },
  scorePill: { alignItems: 'center', borderRadius: 14, paddingVertical: 6, paddingHorizontal: 10 },
  scorePillText: { fontSize: 17, fontWeight: '800', lineHeight: 20 },
  scorePillLabel: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  scoreTrack: { height: 8, borderRadius: 99, backgroundColor: theme.border, overflow: 'hidden' },
  scoreFill: { height: 8, borderRadius: 99 },
  verdict: { fontSize: 14, fontWeight: '700' },
  // 52pt tall and filled rather than outlined — this is the action the whole check-in exists
  // to make easy, and at 10pt padding it was the smallest tap target on the sheet.
  cancelBtn: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#D64545',
    backgroundColor: '#D645450F',
    paddingVertical: 16,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: { color: '#D64545', fontWeight: '700', fontSize: 15 },
  cancelledBadge: {
    borderRadius: 14,
    backgroundColor: theme.border,
    paddingVertical: 16,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelledBadgeText: { color: theme.textMuted, fontWeight: '700', fontSize: 15 },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.border,
  },
  historyRowMain: { flex: 1, gap: 2 },
  historyRowDate: { fontWeight: '700', color: theme.text, fontSize: 15 },
  historyRowCount: { fontSize: 12, color: theme.textMuted, fontWeight: '600' },
  ghost: { alignItems: 'center', padding: 10 },
  ghostText: { color: theme.textMuted, fontWeight: '600' },
});
