import React, { useEffect, useMemo, useRef, useState } from 'react';

import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { ServiceLogo } from '@/components/ServiceLogo';

import { useSubTrack } from '@/context/SubTrackContext';

import { theme } from '@/constants/theme';

import { Subscription } from '@/types/subscription';

import { CurrencyCode, formatMoney } from '@/utils/currency';

import { ConvertFn, monthly, nextRelevantDate, subsOnBillingDay } from '@/utils/subscription';



function daysUntil(target: Date): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.round((day.getTime() - today.getTime()) / 86400000);
}

export default function CalendarScreen() {

  const { subscriptions, t, locale, currency, convert } = useSubTrack();

  const money = (n: number) => formatMoney(n, currency);

  const dark = useColorScheme() === 'dark';

  const [visibleMonth, setVisibleMonth] = useState<Date>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selected, setSelected] = useState<number>(new Date().getDate());
  const [navDir, setNavDir] = useState<-1 | 1>(1);
  const [pickerOpen, setPickerOpen] = useState(false);

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const [pickerYear, setPickerYear] = useState(year);

  const monthNames = useMemo(
    () => Array.from({ length: 12 }, (_, i) => new Date(2024, i, 1).toLocaleString(locale, { month: 'short' })),
    [locale],
  );

  const openPicker = () => {
    setPickerYear(year);
    setPickerOpen(true);
  };

  const pickMonth = (m: number) => {
    setNavDir(pickerYear > year || (pickerYear === year && m > month) ? 1 : -1);
    setVisibleMonth(new Date(pickerYear, m, 1));
    setPickerOpen(false);
  };

  const days = new Date(year, month + 1, 0).getDate();

  // Cancelled subs can still have billed on-or-before their cancellation cutoff, so the
  // day grid/monthly total use the full list — subsOnBillingDay + chargesInMonth already
  // know not to charge past the cutoff. The "next 30 days" list below stays forward-looking
  // only, since a cancelled sub won't actually bill again regardless of its stale nextBillingDate.
  const active = subscriptions.filter((s) => !s.isCancelled);

  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    translateX.setValue(navDir * 24);
    opacity.setValue(0);
    Animated.parallel([
      Animated.timing(translateX, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
  }, [month, year, navDir, opacity, translateX]);

  // `selected` holds the user's preferred day-of-month (e.g. 30), which may exceed
  // the currently visible month's length (e.g. Feb has 28). Clamp only for display/
  // lookups here instead of overwriting `selected`, so navigating back to a longer
  // month (e.g. March) restores the original day instead of staying stuck at 28.
  const displaySelected = Math.min(selected, days);

  const shiftMonth = (delta: -1 | 1) => {
    setNavDir(delta);
    setVisibleMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };



  const subsForDay = (day: number) => subsOnBillingDay(subscriptions, year, month, day);



  const dueThisMonth = useMemo(() => {

    const seen = new Set<string>();

    const list: Subscription[] = [];

    for (let day = 1; day <= days; day++) {

      for (const s of subsForDay(day)) {

        if (!seen.has(s.id)) {

          seen.add(s.id);

          list.push(s);

        }

      }

    }

    return list;

  }, [subscriptions, year, month, days]);



  const total = dueThisMonth.reduce((a, s) => a + monthly(s, convert), 0);

  const upcoming = useMemo(

    () =>

      active

        .filter((s) => nextRelevantDate(s).getTime() < Date.now() + 30 * 86400000)

        .sort((a, b) => nextRelevantDate(a).getTime() - nextRelevantDate(b).getTime()),

    [active],

  );

  const selectedSubs = subsForDay(displaySelected);

  const monthLabel = visibleMonth.toLocaleString(locale, { month: 'long' });
  const monthHeaderLabel = visibleMonth.toLocaleString(locale, { month: 'long', year: 'numeric' });



  return (

    <>

    <ScrollView

      style={[styles.screen, dark && styles.dark]}

      contentContainerStyle={styles.content}

    >

      <Text style={[styles.title, dark && styles.light]}>{t.calendar}</Text>

      <View style={styles.card}>

        <Text style={styles.label}>{t.totalMonth}</Text>

        <Text style={styles.total}>{money(total)}</Text>

      </View>

      <View style={styles.monthNav}>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t.prevMonth}
          onPress={() => shiftMonth(-1)}
          style={({ pressed }) => [styles.navBtn, pressed && styles.navBtnPressed]}
        >
          <Text style={styles.navBtnText}>‹</Text>
        </Pressable>

        <Pressable
          onPress={openPicker}
          style={styles.monthTitleBtn}
          accessibilityRole="button"
          accessibilityLabel={monthHeaderLabel}
        >
          <Text style={[styles.monthTitle, dark && styles.light]}>{monthHeaderLabel}</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t.nextMonth}
          onPress={() => shiftMonth(1)}
          style={({ pressed }) => [styles.navBtn, pressed && styles.navBtnPressed]}
        >
          <Text style={styles.navBtnText}>›</Text>
        </Pressable>

      </View>

      <Animated.View style={{ transform: [{ translateX }], opacity }}>
      <View style={styles.calendar}>

        {Array.from({ length: days }, (_, i) => i + 1).map((day) => {

          const subs = subsForDay(day);

          const isSelected = displaySelected === day;

          return (

            <Pressable

              key={day}

              onPress={() => setSelected(day)}

              style={[styles.dayCell, isSelected && styles.dayActive]}

              accessibilityRole="button"

              accessibilityLabel={`${new Date(year, month, day).toLocaleDateString(locale, { day: 'numeric', month: 'long' })}${subs.length > 0 ? ` · ${subs.length}` : ''}`}

              accessibilityState={{ selected: isSelected }}

            >

              <Text style={[styles.dayNum, isSelected && styles.dayNumActive]}>{day}</Text>

              {subs.length > 0 && (

                <View style={styles.logoRow}>

                  {subs.slice(0, 3).map((s) => (

                    <View key={s.id} style={styles.logoWrap}>

                      <ServiceLogo service={s} size={16} />

                    </View>

                  ))}

                  {subs.length > 3 && (

                    <Text style={[styles.more, isSelected && styles.moreActive]}>+{subs.length - 3}</Text>

                  )}

                </View>

              )}

            </Pressable>

          );

        })}

      </View>

      <Text style={[styles.section, dark && styles.light]}>

        {displaySelected}. {monthLabel}

      </Text>

      {selectedSubs.length === 0 ? (

        <Text style={styles.emptyDay}>{t.dayBreakdownEmpty}</Text>

      ) : (

        selectedSubs.map((s) => <SubRow key={s.id} sub={s} dark={dark} currency={currency} convert={convert} />)

      )}
      </Animated.View>

      <Text style={[styles.section, dark && styles.light]}>{t.next30Days}</Text>

      {upcoming.map((s) => {

        const days = daysUntil(nextRelevantDate(s));

        const countdown = days <= 0 ? t.billingPresetToday : t.daysUntilTemplate.replace('{n}', String(days));

        return (

          <View key={s.id} style={[styles.row, dark && styles.rowDark]}>

            <ServiceLogo service={s} size={36} />

            <View style={styles.rowMain}>

              <Text style={[styles.rowTitle, dark && styles.light]} numberOfLines={1}>

                {nextRelevantDate(s).toLocaleDateString(locale)} · {s.name}

              </Text>

              <Text style={styles.rowCountdown}>{countdown}</Text>

            </View>

            <Text style={styles.price}>{money(monthly(s, convert))}</Text>

          </View>

        );

      })}

    </ScrollView>

    <Modal
      visible={pickerOpen}
      animationType="fade"
      transparent
      onRequestClose={() => setPickerOpen(false)}
    >
      <Pressable style={styles.pickerOverlay} onPress={() => setPickerOpen(false)}>
        <Pressable style={styles.pickerSheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.pickerYearRow}>
            <Pressable
              onPress={() => setPickerYear((y) => y - 1)}
              style={styles.navBtn}
              accessibilityRole="button"
              accessibilityLabel={t.prevYear}
            >
              <Text style={styles.navBtnText}>‹</Text>
            </Pressable>
            <Text style={styles.pickerYearText}>{pickerYear}</Text>
            <Pressable
              onPress={() => setPickerYear((y) => y + 1)}
              style={styles.navBtn}
              accessibilityRole="button"
              accessibilityLabel={t.nextYear}
            >
              <Text style={styles.navBtnText}>›</Text>
            </Pressable>
          </View>
          <View style={styles.pickerMonthGrid}>
            {monthNames.map((name, i) => {
              const isCurrent = pickerYear === year && i === month;
              return (
                <Pressable
                  key={i}
                  onPress={() => pickMonth(i)}
                  style={[styles.pickerMonthCell, isCurrent && styles.pickerMonthCellActive]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isCurrent }}
                >
                  <Text
                    style={[styles.pickerMonthText, isCurrent && styles.pickerMonthTextActive]}
                  >
                    {name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>

    </>

  );

}



function SubRow({
  sub,
  dark,
  currency,
  convert,
}: {
  sub: Subscription;
  dark: boolean;
  currency: CurrencyCode;
  convert: ConvertFn;
}) {

  return (

    <View style={[styles.row, dark && styles.rowDark]}>

      <ServiceLogo service={sub} size={36} />

      <Text style={[styles.rowText, dark && styles.light]}>{sub.name}</Text>

      <Text style={styles.price}>{formatMoney(monthly(sub, convert), currency)}</Text>

    </View>

  );

}



const styles = StyleSheet.create({

  screen: { flex: 1, backgroundColor: theme.cream },

  dark: { backgroundColor: theme.creamDark },

  content: { padding: 20, paddingTop: 62, gap: 16, paddingBottom: 40 },

  title: { fontSize: 28, fontWeight: '700', color: theme.text, letterSpacing: -0.5 },

  light: { color: '#F5EDE8' },

  card: { backgroundColor: theme.accentSoft, borderRadius: 20, padding: 20 },

  label: { color: theme.accent, fontWeight: '600', fontSize: 14 },

  total: { fontSize: 34, fontWeight: '700', color: theme.text, marginTop: 4 },

  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 4,
  },
  monthTitleBtn: { flex: 1 },
  monthTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '800', color: theme.text },
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  pickerSheet: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 20,
    width: '86%',
    gap: 16,
  },
  pickerYearRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pickerYearText: { fontSize: 18, fontWeight: '800', color: theme.text },
  pickerMonthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pickerMonthCell: {
    width: '30%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: theme.cream,
  },
  pickerMonthCellActive: { backgroundColor: theme.accent },
  pickerMonthText: { fontWeight: '700', color: theme.text, fontSize: 13 },
  pickerMonthTextActive: { color: '#FFF' },
  navBtn: {
    width: 42,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  navBtnPressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
  navBtnText: { fontSize: 22, fontWeight: '800', color: theme.text },

  calendar: {

    flexDirection: 'row',

    flexWrap: 'wrap',

    gap: 6,

    backgroundColor: '#FFF',

    borderRadius: 18,

    padding: 12,

  },

  dayCell: {

    width: '13.5%',

    minHeight: 58,

    alignItems: 'center',

    paddingVertical: 4,

    borderRadius: 12,

  },

  dayActive: { backgroundColor: theme.accent },

  dayNum: { fontSize: 11, fontWeight: '600', color: theme.textMuted },

  dayNumActive: { color: '#fff' },

  logoRow: {

    flexDirection: 'row',

    flexWrap: 'wrap',

    marginTop: 2,

    gap: 1,

    justifyContent: 'center',

    maxWidth: '100%',

  },

  logoWrap: { borderRadius: 8, overflow: 'hidden' },

  more: { fontSize: 8, fontWeight: '700', color: theme.textMuted, alignSelf: 'center' },

  moreActive: { color: '#fff' },

  section: { fontSize: 17, fontWeight: '700', color: theme.text },

  emptyDay: { color: theme.textMuted, fontSize: 14 },

  row: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: 12,

    backgroundColor: '#FFF',

    borderRadius: 16,

    padding: 12,

  },

  rowDark: { backgroundColor: theme.cardDark },

  rowText: { flex: 1, color: theme.text, fontWeight: '600' },

  rowMain: { flex: 1, gap: 2 },

  rowTitle: { color: theme.text, fontWeight: '600' },

  rowCountdown: { color: theme.textMuted, fontSize: 12, fontWeight: '600' },

  price: { fontWeight: '700', color: theme.text },

});

