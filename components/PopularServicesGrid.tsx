import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ServiceLogo } from '@/components/ServiceLogo';
import { theme } from '@/constants/theme';
import { useSubTrack } from '@/context/SubTrackContext';
import { POPULAR_SERVICE_IDS } from '@/data/popularServices';
import { PresetService } from '@/types/subscription';

type Props = {
  onPick: (service: PresetService) => void;
  /** Light text on the dark onboarding card; dark text on the dashboard. */
  variant: 'onDark' | 'onLight' | 'onLightDark';
};

/**
 * One tap per service: the shortest path from "just installed" to a first tracked subscription,
 * which is what everything else in the app — reminders, the widget, the monthly digest — needs.
 */
export function PopularServicesGrid({ onPick, variant }: Props) {
  const { language, presetServices } = useSubTrack();
  const services = useMemo(
    () =>
      POPULAR_SERVICE_IDS[language]
        .map((id) => presetServices.find((s) => s.id === id))
        .filter((s): s is PresetService => s !== undefined),
    [language, presetServices],
  );

  return (
    <View style={styles.grid}>
      {services.map((s) => (
        <Pressable
          key={s.id}
          onPress={() => onPick(s)}
          style={({ pressed }) => [
            styles.tile,
            variant === 'onDark' ? styles.tileOnDark : variant === 'onLightDark' ? styles.tileOnLightDark : styles.tileOnLight,
            pressed && styles.tilePressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={s.name}
        >
          <ServiceLogo service={s} size={36} />
          <Text
            style={[styles.name, variant === 'onLight' ? styles.nameOnLight : styles.nameOnDark]}
            numberOfLines={1}
          >
            {s.name}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: {
    width: '22%',
    flexGrow: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 16,
  },
  tileOnDark: { backgroundColor: 'rgba(255,255,255,0.08)' },
  tileOnLight: { backgroundColor: theme.cream },
  tileOnLightDark: { backgroundColor: 'rgba(255,255,255,0.06)' },
  tilePressed: { opacity: 0.6 },
  name: { fontSize: 11, fontWeight: '600' },
  nameOnDark: { color: 'rgba(255,255,255,0.85)' },
  nameOnLight: { color: theme.text },
});
