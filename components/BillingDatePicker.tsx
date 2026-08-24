/**
 * BillingDatePicker
 *
 * Single Modal only — no nested Modals.
 * Month/year pickers are rendered inline inside the same Modal,
 * toggled via `inlineView` state. This avoids React Native's
 * broken "Modal-inside-Modal" on both iOS and Android.
 */
import React, { useRef, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';
import { Strings } from '@/i18n/strings';

type Props = {
  value: Date;
  onChange: (date: Date) => void;
  t: Strings;
  locale: string;
  dark?: boolean;
};

type InlineView = null | 'month' | 'year';


function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x;
}

function setDayOfMonth(base: Date, day: number): Date {
  const d = new Date(base);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, last));
  return startOfDay(d);
}

export function BillingDatePicker({ value, onChange, t, locale, dark }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [inlineView, setInlineView] = useState<InlineView>(null);
  const [viewMonth, setViewMonth] = useState(() => new Date(value.getFullYear(), value.getMonth(), 1));
  const monthScrollRef = useRef<ScrollView>(null);
  const yearScrollRef = useRef<ScrollView>(null);

  const presets = useMemo(() => {
    const now = new Date();
    return [
      { key: 'today', label: t.billingPresetToday, date: startOfDay(now) },
      { key: 'd7', label: t.billingPresetIn7, date: startOfDay(new Date(now.getTime() + 7 * 86400000)) },
      { key: 'd1', label: t.billingPreset1st, date: setDayOfMonth(now, 1) },
      { key: 'd15', label: t.billingPreset15th, date: setDayOfMonth(now, 15) },
    ];
  }, [t]);

  // 12 months only — no year suffix (year is picked separately)
  const monthOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        key: String(i),
        label: new Date(2024, i, 1).toLocaleString(locale, { month: 'long' }),
        monthIndex: i,
      })),
    [locale],
  );

  const yearOptions = useMemo(() => {
    const y = new Date().getFullYear();
    return Array.from({ length: 15 }, (_, i) => y - 10 + i);
  }, []);

  const daysInView = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  const firstWeekday = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1).getDay();
  const monthLabel = viewMonth.toLocaleString(locale, { month: 'long' });
  const yearLabel = String(viewMonth.getFullYear());

  const openPicker = () => {
    setViewMonth(new Date(value.getFullYear(), value.getMonth(), 1));
    setInlineView(null); // always start at calendar view
    setPickerOpen(true);
  };

  const closePicker = () => {
    setPickerOpen(false);
    setInlineView(null);
  };

  const prevMonth = () =>
    setViewMonth((p) => new Date(p.getFullYear(), p.getMonth() - 1, 1));
  const nextMonth = () =>
    setViewMonth((p) => new Date(p.getFullYear(), p.getMonth() + 1, 1));

  const pickDay = (day: number) => {
    onChange(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day, 12));
    closePicker();
  };

  const pickMonth = (monthIndex: number) => {
    setViewMonth(new Date(viewMonth.getFullYear(), monthIndex, 1));
    setInlineView(null);
  };

  const pickYear = (year: number) => {
    setViewMonth(new Date(year, viewMonth.getMonth(), 1));
    setInlineView(null);
  };

  const currentMonthIdx = viewMonth.getMonth(); // 0-11, matches monthOptions index
  const currentYearIdx = yearOptions.indexOf(viewMonth.getFullYear());

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, dark && styles.labelDark]}>{t.contractStart}</Text>

      {/* Tap to open calendar */}
      <Pressable onPress={openPicker} style={[styles.dateBtn, dark && styles.dateBtnDark]}>
        <Text style={[styles.dateText, dark && styles.labelDark]}>
          {value.toLocaleDateString(locale, {
            weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
          })}
        </Text>
        <Text style={styles.pickHint}>{t.billingTapToPick}</Text>
      </Pressable>

      {/* Quick-pick presets */}
      <View style={styles.chips}>
        {presets.map((p) => {
          const active = value.toDateString() === p.date.toDateString();
          return (
            <Pressable
              key={p.key}
              onPress={() => onChange(p.date)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{p.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* ── Single calendar Modal — no nested Modals ── */}
      <Modal
        visible={pickerOpen}
        animationType="slide"
        transparent
        onRequestClose={closePicker}
      >
        <Pressable style={styles.overlay} onPress={closePicker}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>

            {/* ── Header ── */}
            {inlineView === null ? (
              /* Calendar header: ‹  Month  Year  › */
              <View style={styles.calHeader}>
                <Pressable
                  onPress={prevMonth}
                  style={styles.arrowBtn}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={t.prevMonth}
                >
                  <Text style={styles.arrowText}>‹</Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setInlineView('month');
                  }}
                  style={styles.monthYearBtn}
                >
                  <Text style={styles.monthYearLabel}>{t.pickMonth}</Text>
                  <Text style={styles.monthYearValue}>{monthLabel}</Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setInlineView('year');
                    setTimeout(() => {
                      if (currentYearIdx >= 0) {
                        yearScrollRef.current?.scrollTo({ y: currentYearIdx * 48, animated: false });
                      }
                    }, 50);
                  }}
                  style={styles.monthYearBtn}
                >
                  <Text style={styles.monthYearLabel}>{t.pickYear}</Text>
                  <Text style={styles.monthYearValue}>{yearLabel}</Text>
                </Pressable>

                <Pressable
                  onPress={nextMonth}
                  style={styles.arrowBtn}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={t.nextMonth}
                >
                  <Text style={styles.arrowText}>›</Text>
                </Pressable>
              </View>
            ) : (
              /* Month/Year list header: ←  title */
              <View style={styles.inlineHeader}>
                <Pressable
                  onPress={() => setInlineView(null)}
                  style={styles.backBtn}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={t.back}
                >
                  <Text style={styles.backText}>←</Text>
                </Pressable>
                <Text style={styles.inlineTitle}>
                  {inlineView === 'month' ? t.pickMonth : t.pickYear}
                </Text>
              </View>
            )}

            {/* ── Content ── */}
            {inlineView === null ? (
              /* Calendar grid */
              <>
                <View style={styles.weekRow}>
                  {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                    <Text key={d} style={styles.weekday}>
                      {new Date(2024, 0, 7 + d).toLocaleString(locale, { weekday: 'narrow' })}
                    </Text>
                  ))}
                </View>
                <View style={styles.grid}>
                  {Array.from({ length: firstWeekday }, (_, i) => (
                    <View key={`pad-${i}`} style={styles.dayCell} />
                  ))}
                  {Array.from({ length: daysInView }, (_, i) => {
                    const day = i + 1;
                    const selected =
                      value.getDate() === day &&
                      value.getMonth() === viewMonth.getMonth() &&
                      value.getFullYear() === viewMonth.getFullYear();
                    const cellDate = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
                    return (
                      <Pressable
                        key={day}
                        onPress={() => pickDay(day)}
                        style={[styles.dayCell, selected && styles.daySelected]}
                        accessibilityRole="button"
                        accessibilityLabel={cellDate.toLocaleDateString(locale, {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                        accessibilityState={{ selected }}
                      >
                        <Text style={[styles.dayNum, selected && styles.dayNumSelected]}>
                          {day}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Pressable style={styles.done} onPress={closePicker}>
                  <Text style={styles.doneText}>{t.billingDone}</Text>
                </Pressable>
              </>
            ) : inlineView === 'month' ? (
              /* Inline month list — month name only, no year */
              <ScrollView
                ref={monthScrollRef}
                style={styles.inlineList}
                showsVerticalScrollIndicator={false}
              >
                {monthOptions.map((m) => {
                  const isCurrent = m.monthIndex === currentMonthIdx;
                  return (
                    <Pressable
                      key={m.key}
                      style={[styles.inlineRow, isCurrent && styles.inlineRowActive]}
                      onPress={() => pickMonth(m.monthIndex)}
                    >
                      <Text style={[styles.inlineRowText, isCurrent && styles.inlineRowTextActive]}>
                        {m.label}
                      </Text>
                      {isCurrent && <Text style={styles.inlineCheck}>✓</Text>}
                    </Pressable>
                  );
                })}
              </ScrollView>
            ) : (
              /* Inline year list */
              <ScrollView
                ref={yearScrollRef}
                style={styles.inlineList}
                showsVerticalScrollIndicator={false}
              >
                {yearOptions.map((y) => {
                  const isCurrent = y === viewMonth.getFullYear();
                  return (
                    <Pressable
                      key={y}
                      style={[styles.inlineRow, isCurrent && styles.inlineRowActive]}
                      onPress={() => pickYear(y)}
                    >
                      <Text style={[styles.inlineRowText, isCurrent && styles.inlineRowTextActive]}>
                        {y}
                      </Text>
                      {isCurrent && <Text style={styles.inlineCheck}>✓</Text>}
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  label: { fontWeight: '600', color: theme.text, marginTop: 5, fontSize: 14 },
  labelDark: { color: '#F5EDE8' },

  dateBtn: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.border,
  },
  dateBtnDark: { backgroundColor: theme.cardDark, borderColor: theme.borderDark },
  dateText: { fontSize: 16, fontWeight: '600', color: theme.text },
  pickHint: { fontSize: 12, color: theme.textMuted, marginTop: 4 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 9, paddingHorizontal: 13, borderRadius: 999, backgroundColor: '#FFF', borderWidth: 1, borderColor: theme.border },
  chipActive: { backgroundColor: theme.accent, borderColor: theme.accent },
  chipText: { color: theme.textMuted, fontWeight: '600', fontSize: 13 },
  chipTextActive: { color: '#fff' },

  // Modal overlay
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.48)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.cream,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    // fixed height so calendar doesn't jump when switching views
    minHeight: 420,
  },

  // ── Calendar header ────────────────────────────────────────────────────────
  calHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: { fontSize: 22, fontWeight: '700', color: theme.accent, lineHeight: 26 },
  monthYearBtn: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
  },
  monthYearLabel: { fontSize: 10, color: theme.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  monthYearValue: { fontSize: 15, fontWeight: '700', color: theme.text, marginTop: 2 },

  // ── Inline month/year list header ──────────────────────────────────────────
  inlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { fontSize: 18, fontWeight: '700', color: theme.accent },
  inlineTitle: { fontSize: 17, fontWeight: '700', color: theme.text },

  // ── Inline list ────────────────────────────────────────────────────────────
  inlineList: { maxHeight: 320 },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.border,
  },
  inlineRowActive: { backgroundColor: theme.accentSoft, borderRadius: 10, borderBottomWidth: 0, marginBottom: StyleSheet.hairlineWidth },
  inlineRowText: { fontSize: 16, color: theme.text, fontWeight: '500' },
  inlineRowTextActive: { color: theme.accent, fontWeight: '700' },
  inlineCheck: { fontSize: 16, color: theme.accent, fontWeight: '700' },

  // ── Calendar grid ──────────────────────────────────────────────────────────
  weekRow: { flexDirection: 'row', marginBottom: 6 },
  weekday: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '600', color: theme.textMuted },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  daySelected: { backgroundColor: theme.accent, borderRadius: 999 },
  dayNum: { fontSize: 15, fontWeight: '600', color: theme.text },
  dayNumSelected: { color: '#fff' },

  done: {
    marginTop: 16,
    backgroundColor: theme.text,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  doneText: { color: '#fff', fontWeight: '700' },
});
