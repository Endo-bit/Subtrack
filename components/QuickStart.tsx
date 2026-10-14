import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PopularServicesGrid } from '@/components/PopularServicesGrid';
import { theme, type as t_ } from '@/constants/theme';
import { useSubTrack } from '@/context/SubTrackContext';
import { PresetService } from '@/types/subscription';
import { track } from '@/utils/analytics';

type Props = {
  onPick: (service: PresetService) => void;
  onBrowse: () => void;
  onSkip: () => void;
};

/**
 * The last onboarding step. The slides used to end on "Get started" and drop people on an empty
 * dashboard; most installs never got as far as adding anything, so nothing was ever scheduled to
 * bring them back. This ends the tour on the first subscription instead.
 */
export function QuickStart({ onPick, onBrowse, onSkip }: Props) {
  const { t } = useSubTrack();

  useEffect(() => {
    track.quickStartShown();
  }, []);

  return (
    <View style={styles.wrap}>
      <LinearGradient colors={['#100C09', '#1D140E']} style={styles.card}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>{t.quickStartTitle}</Text>
          <Text style={styles.body}>{t.quickStartBody}</Text>
          <PopularServicesGrid onPick={onPick} variant="onDark" />
          <Pressable onPress={onBrowse} style={styles.browse} accessibilityRole="button">
            <Text style={styles.browseText}>{t.quickStartBrowse} →</Text>
          </Pressable>
        </ScrollView>
      </LinearGradient>
      <Pressable style={styles.skip} onPress={onSkip} accessibilityRole="button">
        <Text style={styles.skipText}>{t.quickStartSkip}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#08080F' },
  card: { flex: 1 },
  content: { padding: 32, paddingTop: 96, gap: 14 },
  title: { fontSize: 36, fontWeight: '600', letterSpacing: -0.5, color: '#FFFFFF', lineHeight: 42 },
  body: {
    fontSize: 18,
    fontWeight: '400',
    letterSpacing: -0.1,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 28,
    marginBottom: 10,
  },
  browse: { paddingVertical: 14, alignItems: 'center' },
  browseText: { ...t_.button, color: theme.accent, fontSize: 16 },
  skip: { margin: 24, borderRadius: 9999, padding: 17, alignItems: 'center' },
  skipText: { ...t_.button, color: 'rgba(255,255,255,0.6)', fontSize: 17 },
});
