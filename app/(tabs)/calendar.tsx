import React, { useEffect, useMemo, useRef, useState } from 'react';

import { Animated, Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { ServiceLogo } from '@/components/ServiceLogo';

import { useSubTrack } from '@/context/SubTrackContext';

import { theme } from '@/constants/theme';

import { Subscription } from '@/types/subscription';

import { CurrencyCode, formatMoney } from '@/utils/currency';

import { monthly, subsOnBillingDay } from '@/utils/subscription';



export default function CalendarScreen() {

  const { subscriptions, t, locale, currency } = useSubTrack();

  const money = (n: number) => formatMoney(n, currency);

  const dark = useColorScheme() === 'dark';

  const [visibleMonth, setVisibleMonth] = useState<Date>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selected, setSelected] = useState<number>(new Date().getDate());
  const [navDir, setNavDir] = useState<-1 | 1>(1);

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();

  const days = new Date(year, month + 1, 0).getDate();

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

  useEffect(() => {
    setSelected((prev) => Math.min(prev, days));
  }, [days]);

  const shiftMonth = (delta: -1 | 1) => {
    setNavDir(delta);
    setVisibleMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };



  const subsForDay = (day: number) => subsOnBillingDay(active, year, month, day);



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

  }, [active, year, month, days]);



  const total = dueThisMonth.reduce((a, s) => a + monthly(s), 0);

  const upcoming = useMemo(

    () =>

      active

        .filter((s) => new Date(s.nextBillingDate).getTime() < Date.now() + 30 * 86400000)

        .sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime()),

    [active],

  );

  const selectedSubs = subsForDay(selected);

  const monthLabel = visibleMonth.toLocaleString(locale, { month: 'long' });
  const monthHeaderLabel = visibleMonth.toLocaleString(locale, { month: 'long', year: 'numeric' });



  return (

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

        <Text style={[styles.monthTitle, dark && styles.light]}>{monthHeaderLabel}</Text>

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

          const isSelected = selected === day;

          return (

            <Pressable

              key={day}

              onPress={() => setSelected(day)}

              style={[styles.dayCell, isSelected && styles.dayActive]}

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

        {selected}. {monthLabel}

      </Text>

      {selectedSubs.length === 0 ? (

        <Text style={styles.emptyDay}>{t.monthBreakdownEmpty}</Text>

      ) : (

        selectedSubs.map((s) => <SubRow key={s.id} sub={s} dark={dark} currency={currency} />)

      )}
      </Animated.View>

      <Text style={[styles.section, dark && styles.light]}>{t.next30Days}</Text>

      {upcoming.map((s) => (

        <View key={s.id} style={[styles.row, dark && styles.rowDark]}>

          <ServiceLogo service={s} size={36} />

          <Text style={[styles.rowText, dark && styles.light]}>

            {new Date(s.nextBillingDate).toLocaleDateString(locale)} · {s.name}

          </Text>

          <Text style={styles.price}>{money(monthly(s))}</Text>

        </View>

      ))}

    </ScrollView>

  );

}



function SubRow({ sub, dark, currency }: { sub: Subscription; dark: boolean; currency: CurrencyCode }) {

  return (

    <View style={[styles.row, dark && styles.rowDark]}>

      <ServiceLogo service={sub} size={36} />

      <Text style={[styles.rowText, dark && styles.light]}>{sub.name}</Text>

      <Text style={styles.price}>{formatMoney(monthly(sub), currency)}</Text>

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
  monthTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '800', color: theme.text },
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

  price: { fontWeight: '700', color: theme.text },

});

