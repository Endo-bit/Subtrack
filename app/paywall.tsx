import { router, useLocalSearchParams } from 'expo-router';
import { Check, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PRIVACY_POLICY_URL, TERMS_OF_USE_URL } from '@/constants/legal';
import { theme } from '@/constants/theme';
import { useSubTrack } from '@/context/SubTrackContext';
import { track } from '@/utils/analytics';
import { fetchCurrentOffering, purchasePackage } from '@/utils/purchases';
import { PurchasesPackage } from 'react-native-purchases';

export default function PaywallScreen() {
  const { source } = useLocalSearchParams<{ source?: string }>();
  const { t, isPro, restorePurchases } = useSubTrack();
  const [offeringPackages, setOfferingPackages] = useState<PurchasesPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    track.paywallViewed(source ?? 'unknown');
    fetchCurrentOffering()
      .then((offering) => setOfferingPackages(offering?.availablePackages ?? []))
      .finally(() => setLoading(false));
  }, [source]);

  const close = () => router.back();

  const onPurchase = async (pkg: PurchasesPackage) => {
    setPurchasing(pkg.identifier);
    const result = await purchasePackage(pkg);
    setPurchasing(null);
    if (result.isPro) {
      track.purchaseCompleted(pkg.identifier);
      close();
    } else if (!result.cancelled) {
      Alert.alert(t.paywallUnavailable);
    }
  };

  const onRestore = async () => {
    setRestoring(true);
    const restored = await restorePurchases();
    setRestoring(false);
    track.purchaseRestored(restored);
    Alert.alert(restored ? t.paywallRestoreSuccess : t.paywallRestoreNone);
    if (restored) close();
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Pressable style={styles.closeBtn} onPress={close} hitSlop={12}>
        <X size={22} color={theme.textMuted} />
      </Pressable>

      <Text style={styles.title}>{t.paywallTitle}</Text>

      {isPro ? (
        <View style={styles.activeCard}>
          <Text style={styles.activeTitle}>{t.paywallActiveTitle}</Text>
          <Text style={styles.activeBody}>{t.paywallActiveBody}</Text>
          <Pressable
            style={styles.manageBtn}
            onPress={() => Linking.openURL('itms-apps://apps.apple.com/account/subscriptions').catch(() => {})}
          >
            <Text style={styles.manageBtnText}>{t.paywallManage}</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <Text style={styles.subtitle}>{t.proBlurb}</Text>

          <View style={styles.features}>
            <Feature label={t.limit} />
            <Feature label={t.proTrendHint} />
          </View>

          {loading ? (
            <ActivityIndicator style={styles.loading} color={theme.accent} />
          ) : offeringPackages.length === 0 ? (
            <Text style={styles.unavailable}>{t.paywallUnavailable}</Text>
          ) : (
            <View style={styles.packages}>
              {offeringPackages.map((pkg) => (
                <Pressable
                  key={pkg.identifier}
                  style={styles.packageRow}
                  disabled={purchasing !== null}
                  onPress={() => onPurchase(pkg)}
                >
                  <View style={styles.packageMain}>
                    <Text style={styles.packageTitle}>{pkg.product.title}</Text>
                    <Text style={styles.packagePrice}>{pkg.product.priceString}</Text>
                  </View>
                  {purchasing === pkg.identifier && <ActivityIndicator color={theme.accent} />}
                </Pressable>
              ))}
            </View>
          )}

          <Pressable style={styles.restoreBtn} onPress={onRestore} disabled={restoring}>
            {restoring ? (
              <ActivityIndicator color={theme.textMuted} />
            ) : (
              <Text style={styles.restoreText}>{t.paywallRestore}</Text>
            )}
          </Pressable>
        </>
      )}

      <Text style={styles.legalNote}>{t.paywallLegalNote}</Text>

      {(!!PRIVACY_POLICY_URL || !!TERMS_OF_USE_URL) && (
        <View style={styles.legalLinks}>
          {!!TERMS_OF_USE_URL && (
            <Pressable onPress={() => Linking.openURL(TERMS_OF_USE_URL).catch(() => {})}>
              <Text style={styles.legalLink}>{t.paywallTerms}</Text>
            </Pressable>
          )}
          {!!PRIVACY_POLICY_URL && (
            <Pressable onPress={() => Linking.openURL(PRIVACY_POLICY_URL).catch(() => {})}>
              <Text style={styles.legalLink}>{t.paywallPrivacy}</Text>
            </Pressable>
          )}
        </View>
      )}
    </ScrollView>
  );
}

function Feature({ label }: { label: string }) {
  return (
    <View style={styles.featureRow}>
      <Check size={18} color={theme.accent} />
      <Text style={styles.featureText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.cream },
  content: { padding: 24, paddingTop: 28, gap: 16 },
  closeBtn: { alignSelf: 'flex-end', padding: 4 },
  title: { fontSize: 28, fontWeight: '700', color: theme.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: theme.textMuted, lineHeight: 21 },
  features: { gap: 10, marginTop: 4 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: { flex: 1, fontSize: 15, fontWeight: '600', color: theme.text },
  loading: { marginTop: 16 },
  unavailable: { color: theme.textMuted, textAlign: 'center', paddingVertical: 20 },
  packages: { gap: 10, marginTop: 8 },
  packageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  packageMain: { gap: 2 },
  packageTitle: { fontSize: 16, fontWeight: '700', color: theme.text },
  packagePrice: { fontSize: 14, color: theme.textMuted },
  restoreBtn: { alignItems: 'center', paddingVertical: 10, marginTop: 4 },
  restoreText: { color: theme.textMuted, fontWeight: '600' },
  activeCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  activeTitle: { fontSize: 18, fontWeight: '700', color: theme.text },
  activeBody: { fontSize: 14, color: theme.textMuted },
  manageBtn: { marginTop: 8, alignSelf: 'flex-start' },
  manageBtnText: { color: theme.accent, fontWeight: '600' },
  legalNote: { fontSize: 11, color: theme.textMuted, lineHeight: 15, marginTop: 8 },
  legalLinks: { flexDirection: 'row', gap: 16, justifyContent: 'center' },
  legalLink: { fontSize: 12, color: theme.textMuted, textDecorationLine: 'underline' },
});
