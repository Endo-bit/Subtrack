import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Strings } from '@/i18n/strings';
import { Subscription } from '@/types/subscription';
import { CurrencyCode, formatMoney } from '@/utils/currency';
import { ConvertFn, monthly } from '@/utils/subscription';

const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

/** Long lists stop reading as a receipt and start reading as a spreadsheet. */
const MAX_LINES = 12;

export type ReceiptData = {
  items: Subscription[];
  monthlyTotal: number;
  yearlyTotal: number;
  lifetimeTotal: number;
  workHours: number | null;
};

/**
 * The shareable "subscription receipt": every subscription as a till line, the yearly total at
 * the bottom where it hurts, and — if a wage was entered — what that costs in hours of work.
 * Fixed width so the captured PNG looks the same on every phone.
 */
export function ReceiptCard({
  data,
  t,
  currency,
  locale,
  convert,
}: {
  data: ReceiptData;
  t: Strings;
  currency: CurrencyCode;
  locale: string;
  convert: ConvertFn;
}) {
  const money = (n: number) => formatMoney(n, currency);
  const shown = data.items.slice(0, MAX_LINES);
  const hidden = data.items.length - shown.length;

  return (
    <View style={styles.paper} collapsable={false}>
      <Text style={styles.brand}>SUBTRACK</Text>
      <Text style={styles.heading}>{t.receiptHeading}</Text>
      <Text style={styles.meta}>{new Date().toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
      <Divider />
      {shown.map((s) => (
        <View key={s.id} style={styles.line}>
          <Text style={styles.item} numberOfLines={1}>
            {s.name}
          </Text>
          <Text style={styles.amount}>{money(monthly(s, convert))}</Text>
        </View>
      ))}
      {hidden > 0 && <Text style={styles.meta}>+{hidden}</Text>}
      <Divider />
      <View style={styles.line}>
        <Text style={styles.item}>{t.receiptPerMonth}</Text>
        <Text style={styles.amount}>{money(data.monthlyTotal)}</Text>
      </View>
      <View style={styles.line}>
        <Text style={styles.totalLabel}>{t.receiptPerYear}</Text>
        <Text style={styles.total}>{money(data.yearlyTotal)}</Text>
      </View>
      {data.lifetimeTotal > 0 && (
        <View style={styles.line}>
          <Text style={styles.item}>{t.receiptLifetime}</Text>
          <Text style={styles.amount}>{money(data.lifetimeTotal)}</Text>
        </View>
      )}
      {data.workHours !== null && (
        <Text style={styles.hours}>
          {t.receiptWorkHours.replace('{hours}', String(Math.round(data.workHours)))}
        </Text>
      )}
      <Divider />
      <Text style={styles.barcode}>║▌║█║▌│║▌║▌█║▌│║█║</Text>
      <Text style={styles.footer}>{t.receiptFooter}</Text>
    </View>
  );
}

function Divider() {
  return <Text style={styles.divider}>- - - - - - - - - - - - - - - - - - - -</Text>;
}

const styles = StyleSheet.create({
  paper: {
    width: 320,
    backgroundColor: '#FFFDF7',
    paddingVertical: 24,
    paddingHorizontal: 22,
    borderRadius: 6,
    gap: 4,
  },
  brand: { fontFamily: MONO, fontSize: 20, fontWeight: '700', letterSpacing: 4, textAlign: 'center', color: '#111' },
  heading: { fontFamily: MONO, fontSize: 12, letterSpacing: 1.5, textAlign: 'center', color: '#111' },
  meta: { fontFamily: MONO, fontSize: 11, textAlign: 'center', color: '#666' },
  divider: { fontFamily: MONO, fontSize: 11, color: '#999', textAlign: 'center', marginVertical: 6 },
  line: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  item: { fontFamily: MONO, fontSize: 13, color: '#111', flex: 1 },
  amount: { fontFamily: MONO, fontSize: 13, color: '#111' },
  totalLabel: { fontFamily: MONO, fontSize: 16, fontWeight: '700', color: '#111', flex: 1 },
  total: { fontFamily: MONO, fontSize: 18, fontWeight: '700', color: '#D63A1A' },
  hours: { fontFamily: MONO, fontSize: 12, color: '#D63A1A', textAlign: 'center', marginTop: 6 },
  barcode: { fontFamily: MONO, fontSize: 22, textAlign: 'center', color: '#111', letterSpacing: -1 },
  footer: { fontFamily: MONO, fontSize: 11, textAlign: 'center', color: '#666' },
});
