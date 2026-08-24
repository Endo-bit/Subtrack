import { LinearGradient } from 'expo-linear-gradient';
import { CalendarClock, Lock, Wallet } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme, type as t_ } from '@/constants/theme';
import { useSubTrack } from '@/context/SubTrackContext';

type Props = { onDone: () => void };

/** The onboarding/tutorial slides — shown on first launch, and re-viewable anytime from Settings. */
export function TutorialSlides({ onDone }: Props) {
  const { t } = useSubTrack();
  const [step, setStep] = useState(0);
  const slides = [
    { title: t.onboarding1Title, body: t.onboarding1Body, Icon: Wallet },
    { title: t.onboarding2Title, body: t.onboarding2Body, Icon: CalendarClock },
    { title: t.onboarding3Title, body: t.onboarding3Body, Icon: Lock },
  ];
  const slide = slides[step];
  const isLast = step === slides.length - 1;

  return (
    <View style={styles.wrap}>
      <LinearGradient colors={['#100C09', '#1D140E']} style={styles.card}>
        <View style={styles.iconBadge}>
          <slide.Icon size={28} color={theme.accent} strokeWidth={1.75} />
        </View>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.body}>{slide.body}</Text>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
          ))}
        </View>
      </LinearGradient>
      <Pressable style={styles.cta} onPress={() => (isLast ? onDone() : setStep((s) => s + 1))}>
        <Text style={styles.ctaText}>{isLast ? t.start : '→'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#08080F' },
  card: { flex: 1, padding: 32, paddingTop: 96, gap: 14 },
  iconBadge: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: 'rgba(255,92,53,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: { fontSize: 36, fontWeight: '600', letterSpacing: -0.5, color: '#FFFFFF', lineHeight: 42 },
  body: { fontSize: 18, fontWeight: '400', letterSpacing: -0.1, color: 'rgba(255,255,255,0.65)', lineHeight: 28 },
  dots: { flexDirection: 'row', gap: 6, marginTop: 24 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.25)' },
  dotActive: { width: 22, backgroundColor: '#FFFFFF' },
  cta: { margin: 24, backgroundColor: '#FFFFFF', borderRadius: 9999, padding: 17, alignItems: 'center' },
  ctaText: { ...t_.button, color: '#000000', fontSize: 17 },
});
