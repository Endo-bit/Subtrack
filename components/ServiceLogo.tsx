import { Image } from 'expo-image';
import React from 'react';
import { ImageStyle, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { PresetService } from '@/types/subscription';

type Props = {
  service: Pick<PresetService, 'name' | 'initials' | 'color' | 'logo'>;
  size?: number;
  style?: ImageStyle;
};

export function ServiceLogo({ service, size = 44, style }: Props) {
  const radius = size / 2;
  if (service.logo) {
    return (
      <Image
        source={{ uri: service.logo }}
        style={[{ width: size, height: size, borderRadius: radius }, style]}
        contentFit="cover"
        accessibilityLabel={service.name}
      />
    );
  }
  return (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: radius, backgroundColor: service.color },
        style,
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.32 }]}>{service.initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#fff', fontWeight: '700' },
});
