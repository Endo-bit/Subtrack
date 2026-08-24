import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ServiceLogo } from '@/components/ServiceLogo';
import { theme } from '@/constants/theme';
import { Strings } from '@/i18n/strings';
import { Subscription } from '@/types/subscription';
import { CurrencyCode, formatMoney } from '@/utils/currency';
import { ConvertFn, monthly } from '@/utils/subscription';

type Props = {
  cancelledSubs: Subscription[];
  currency: CurrencyCode;
  convert?: ConvertFn;
  t: Strings;
};

/** Monthly/yearly savings from cancelled subscriptions, with a per-subscription breakdown. Renders nothing if nothing's been cancelled. */
export function SavingsCard({ cancelledSubs, currency, convert, t }: Props) {
  const rows = useMemo(
    () =>
      cancelledSubs
        .map((sub) => ({ sub, amount: monthly(sub, convert) }))
        .filter((row) => row.amount > 0)
        .sort((a, b) => b.amount - a.amount),
    [cancelledSubs, convert],
  );

  if (rows.length === 0) return null;

  const totalMonthly = rows.reduce((sum, row) => sum + row.amount, 0);
  const totalYearly = totalMonthly * 12;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t.diagnosisSavingsTitle}</Text>
      <View style={styles.statsRow}>
        <View style={styles.statCol}>
          <Text style={styles.statLabel}>{t.diagnosisSavingsMonthly}</Text>
          <Text style={styles.statValue}>{formatMoney(totalMonthly, currency)}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCol}>
          <Text style={styles.statLabel}>{t.diagnosisSavingsYearly}</Text>
          <Text style={styles.statValue}>{formatMoney(totalYearly, currency)}</Text>
        </View>
      </View>
      <Text style={styles.breakdownTitle}>{t.diagnosisSavingsBreakdown}</Text>
      <View style={styles.list}>
        {rows.map(({ sub, amount }) => (
          <View key={sub.id} style={styles.row}>
            <ServiceLogo service={sub} size={30} />
            <Text style={styles.rowName} numberOfLines={1}>
              {sub.name}
            </Text>
            <Text style={styles.rowAmount}>{formatMoney(amount, currency)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.accentSoft,
    borderRadius: 20,
    padding: 18,
    gap: 14,
  },
  title: { fontWeight: '700', color: theme.text, fontSize: 16 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statCol: { flex: 1, alignItems: 'center' },
  statDivider: { width: StyleSheet.hairlineWidth, height: 32, backgroundColor: theme.accentMuted },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statValue: { fontSize: 20, fontWeight: '800', color: theme.text, marginTop: 4 },
  breakdownTitle: { fontSize: 12, fontWeight: '700', color: theme.textMuted, textTransform: 'uppercase' },
  list: { gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 10,
  },
  rowName: { flex: 1, fontWeight: '600', color: theme.text, fontSize: 13 },
  rowAmount: { fontWeight: '700', color: theme.text, fontSize: 13 },
});
