import { Repeat } from 'lucide-react-native';
import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';
import { ServiceLogo } from '@/components/ServiceLogo';
import { theme, type as t_ } from '@/constants/theme';
import { useSubTrack } from '@/context/SubTrackContext';
import { track } from '@/utils/analytics';
import { formatMoney } from '@/utils/currency';
import { buildRotationPlan } from '@/utils/insights';

/**
 * "Rotate, don't stack": people rebuilt the cable bill out of streaming apps and are now
 * subscribing for a month, bingeing, and cancelling. This puts a number on doing that
 * deliberately and lays out the next six months.
 */
export function RotationCard() {
  const { t, currency, locale, subscriptions, convert } = useSubTrack();
  const dark = useColorScheme() === 'dark';
  const plan = useMemo(() => buildRotationPlan(subscriptions, convert), [subscriptions, convert]);

  useEffect(() => {
    if (plan) track.rotationViewed(plan.members.length, plan.yearlySaving);
  }, [plan?.members.length]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!plan) return null;

  return (
    <View style={[styles.card, { backgroundColor: dark ? theme.cardDark : theme.card }]}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <Repeat size={18} color={theme.accent} />
        </View>
        <Text style={[styles.title, dark && styles.textOnDark]}>{t.rotationTitle}</Text>
      </View>
      <Text style={[styles.body, dark && styles.textOnDark]}>
        {t.rotationBody.replace('{amount}', formatMoney(plan.yearlySaving, currency))}
      </Text>
      <View style={styles.schedule}>
        {plan.schedule.map(({ month, subscription }) => (
          <View key={month.toISOString()} style={styles.month}>
            <Text style={styles.monthLabel}>{month.toLocaleDateString(locale, { month: 'short' })}</Text>
            <ServiceLogo service={subscription} size={28} />
          </View>
        ))}
      </View>
      <Text style={styles.howTo}>{t.rotationHowTo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 16,
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.07)',
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: theme.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...t_.labelStrong, color: theme.text },
  textOnDark: { color: '#FFFFFF' },
  body: { ...t_.body, fontSize: 15, color: theme.text },
  schedule: { flexDirection: 'row', justifyContent: 'space-between' },
  month: { alignItems: 'center', gap: 4 },
  monthLabel: { ...t_.captionBold, fontSize: 11, color: theme.textMuted, textTransform: 'uppercase' },
  howTo: { ...t_.caption, color: theme.textMuted },
});
