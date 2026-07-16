import { router } from 'expo-router';
import { MessageSquare, ShieldCheck } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { FeedbackModal } from '@/components/FeedbackModal';
import { useSubTrack } from '@/context/SubTrackContext';
import { theme } from '@/constants/theme';
import { Language, VatMode } from '@/types/subscription';
import { CURRENCIES } from '@/utils/currency';

export default function SettingsScreen() {
  const { t, language, vatMode, currency, reminderDays, isPro, locale, updateSettings } = useSubTrack();
  const dark = useColorScheme() === 'dark';
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const vatLabels: Record<VatMode, string> = {
    de: t.vatDe,
    fr: t.vatFr,
    none: t.vatNone,
  };

  const reminderLabel = (d: 0 | 1 | 3 | 7) =>
    d === 0 ? t.reminderOff : `${d} ${t.reminderDaysBefore}`;

  const bg = dark ? theme.creamDark : theme.cream;
  const cardBg = dark ? theme.cardDark : '#FFFFFF';
  const textCol = dark ? '#F5EDE8' : theme.text;
  const mutedCol = dark ? '#9CA3AF' : theme.textMuted;

  return (
    <>
      <ScrollView
        style={[styles.screen, { backgroundColor: bg }]}
        contentContainerStyle={styles.content}
      >
        <Text style={[styles.title, { color: textCol }]}>{t.settings}</Text>

        {/* Privacy */}
        <View style={[styles.shield, { backgroundColor: dark ? '#1E2A1A' : theme.accentSoft }]}>
          <ShieldCheck color={theme.accent} size={26} />
          <Text style={[styles.shieldTitle, { color: textCol }]}>{t.dataPrivacy}</Text>
          <Text style={[styles.shieldText, { color: mutedCol }]}>{t.privacy}</Text>
        </View>

        {/* Language */}
        <SettingGroup title={t.language} dark={dark}>
          {(['de', 'fr', 'en', 'es'] as Language[]).map((l) => (
            <Pill
              key={l}
              label={l === 'de' ? 'Deutsch' : l === 'fr' ? 'Français' : l === 'es' ? 'Español' : 'English'}
              active={language === l}
              onPress={() => updateSettings({ language: l })}
              dark={dark}
            />
          ))}
        </SettingGroup>

        {/* VAT */}
        <SettingGroup title={t.vat} dark={dark}>
          {(['de', 'fr', 'none'] as VatMode[]).map((v) => (
            <Pill
              key={v}
              label={vatLabels[v]}
              active={vatMode === v}
              onPress={() => updateSettings({ vatMode: v })}
              dark={dark}
            />
          ))}
        </SettingGroup>

        {/* Currency */}
        <SettingGroup title={t.currency} dark={dark}>
          {CURRENCIES.map((c) => (
            <Pill
              key={c.code}
              label={`${c.symbol} ${c.code}`}
              active={currency === c.code}
              onPress={() => updateSettings({ currency: c.code })}
              dark={dark}
            />
          ))}
        </SettingGroup>

        {/* Reminders */}
        <SettingGroup title={t.reminders} dark={dark}>
          {([0, 1, 3, 7] as const).map((d) => (
            <Pill
              key={d}
              label={reminderLabel(d)}
              active={reminderDays === d}
              onPress={() => updateSettings({ reminderDays: d })}
              dark={dark}
            />
          ))}
        </SettingGroup>

        {/* Export (Pro) */}
        <View style={[styles.row, { backgroundColor: cardBg }]}>
          <Text style={[styles.rowText, { color: textCol }]}>{t.export} · Pro</Text>
          <Text style={styles.badge}>CSV</Text>
        </View>

        {/* Pro */}
        {isPro ? (
          <Pressable style={styles.pro} onPress={() => router.push({ pathname: '/paywall', params: { source: 'settings' } })}>
            <Text style={styles.proTitle}>{t.paywallActiveTitle}</Text>
            <Text style={styles.proText}>{t.paywallActiveBody}</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.pro} onPress={() => router.push({ pathname: '/paywall', params: { source: 'settings' } })}>
            <Text style={styles.proTitle}>SubTrack Pro</Text>
            <Text style={styles.proText}>
              {t.proPrice} · {t.proBlurb}
            </Text>
          </Pressable>
        )}

        {/* Feedback */}
        <Pressable
          style={[styles.feedbackBtn, { backgroundColor: cardBg }]}
          onPress={() => setFeedbackOpen(true)}
        >
          <MessageSquare size={20} color={theme.accent} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.feedbackTitle, { color: textCol }]}>
              {feedbackLabel(language)}
            </Text>
            <Text style={[styles.feedbackSub, { color: mutedCol }]}>
              {feedbackSub(language)}
            </Text>
          </View>
          <Text style={{ color: theme.textMuted, fontSize: 18 }}>›</Text>
        </Pressable>

        <Text style={[styles.version, { color: mutedCol }]}>{t.version} 1.0.0</Text>
      </ScrollView>

      <FeedbackModal visible={feedbackOpen} onClose={() => setFeedbackOpen(false)} locale={locale} />
    </>
  );
}

function feedbackLabel(lang: Language): string {
  const map: Record<Language, string> = {
    de: 'Feedback senden',
    fr: 'Envoyer un avis',
    es: 'Enviar opinión',
    en: 'Send feedback',
  };
  return map[lang] ?? map.en;
}

function feedbackSub(lang: Language): string {
  const map: Record<Language, string> = {
    de: 'Hilf uns, SubTrack zu verbessern',
    fr: 'Aidez-nous à améliorer SubTrack',
    es: 'Ayúdanos a mejorar SubTrack',
    en: 'Help us improve SubTrack',
  };
  return map[lang] ?? map.en;
}

function SettingGroup({
  title,
  children,
  dark,
}: {
  title: string;
  children: React.ReactNode;
  dark: boolean;
}) {
  return (
    <View style={styles.group}>
      <Text style={[styles.groupTitle, dark && { color: theme.accentMuted }]}>{title}</Text>
      <View style={styles.wrap}>{children}</View>
    </View>
  );
}

function Pill({
  label,
  active,
  onPress,
  dark,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  dark: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.pill,
        { backgroundColor: dark ? theme.cardDark : '#FFFFFF' },
        active && styles.pillActive,
      ]}
    >
      <Text style={[styles.pillText, { color: dark ? '#9CA3AF' : theme.textMuted }, active && styles.pillTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, paddingTop: 62, gap: 16, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  shield: { borderRadius: 20, padding: 18, gap: 8 },
  shieldTitle: { fontSize: 17, fontWeight: '700' },
  shieldText: { lineHeight: 22, fontWeight: '500' },
  group: { gap: 10 },
  groupTitle: { fontSize: 13, fontWeight: '600', color: theme.accent, textTransform: 'uppercase', letterSpacing: 0.4 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999 },
  pillActive: { backgroundColor: theme.accent },
  pillText: { fontWeight: '600' },
  pillTextActive: { color: '#fff' },
  row: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowText: { fontWeight: '600' },
  badge: {
    backgroundColor: theme.accentSoft,
    color: theme.accent,
    fontWeight: '700',
    padding: 8,
    borderRadius: 10,
    overflow: 'hidden',
  },
  pro: { backgroundColor: theme.text, borderRadius: 18, padding: 18 },
  proTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  proText: { color: '#C4B8B0', marginTop: 6, lineHeight: 20 },
  feedbackBtn: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  feedbackTitle: { fontWeight: '700', fontSize: 15 },
  feedbackSub: { fontSize: 13, marginTop: 2 },
  version: { textAlign: 'center', fontWeight: '500' },
});
