import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ServiceLogo } from '@/components/ServiceLogo';
import { theme } from '@/constants/theme';
import { Strings } from '@/i18n/strings';
import { CurrencyCode, formatMoney } from '@/utils/currency';
import { MonthBreakdownItem } from '@/utils/subscription';

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  items: MonthBreakdownItem[];
  total: number;
  t: Strings;
  currency: CurrencyCode;
};

export function MonthBreakdownSheet({ visible, onClose, title, items, total, t, currency }: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.total}>
            {formatMoney(total, currency)} · {t.monthBreakdownTotal}
          </Text>
          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {items.length === 0 ? (
              <Text style={styles.empty}>{t.monthBreakdownEmpty}</Text>
            ) : (
              items.map(({ subscription, amount }) => (
                <View key={subscription.id} style={styles.row}>
                  <ServiceLogo service={subscription} size={40} />
                  <Text style={styles.name}>{subscription.name}</Text>
                  <Text style={styles.amount}>{formatMoney(amount, currency)}</Text>
                </View>
              ))
            )}
          </ScrollView>
          <Pressable style={styles.close} onPress={onClose}>
            <Text style={styles.closeText}>{t.billingDone}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(45,36,32,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '72%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.border,
    alignSelf: 'center',
    marginBottom: 14,
  },
  title: { fontSize: 20, fontWeight: '700', color: theme.text },
  total: { fontSize: 14, color: theme.textMuted, marginTop: 4, marginBottom: 12 },
  list: { maxHeight: 320 },
  listContent: { gap: 10, paddingBottom: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.accentSoft,
    borderRadius: 14,
    padding: 12,
  },
  name: { flex: 1, fontWeight: '600', color: theme.text },
  amount: { fontWeight: '700', color: theme.text },
  empty: { color: theme.textMuted, textAlign: 'center', paddingVertical: 24 },
  close: {
    marginTop: 12,
    backgroundColor: theme.text,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  closeText: { color: '#fff', fontWeight: '700' },
});
