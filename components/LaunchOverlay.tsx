import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Image, Platform, StyleSheet, Text } from 'react-native';

/** How long the icon stays up on launch before the app shows through. */
const HOLD_MS = 2000;
const FADE_MS = 300;

/**
 * A short branded launch screen: the receipt icon, the name and a spinner, held for about two
 * seconds after the native splash (the same icon on the same white) hands over, then faded out.
 * It sits above the navigator so the app underneath can finish loading meanwhile. Not on web,
 * which has no native splash and is only used to film the app's screens.
 */
export function LaunchOverlay() {
  const opacity = useRef(new Animated.Value(1)).current;
  const [done, setDone] = useState(Platform.OS === 'web');

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: FADE_MS, useNativeDriver: true }).start(() => setDone(true));
    }, HOLD_MS);
    return () => clearTimeout(timer);
  }, [opacity]);

  if (done) return null;
  return (
    <Animated.View style={[styles.root, { opacity }]} pointerEvents="none">
      <Image source={require('@/assets/images/splash-icon.png')} style={styles.icon} />
      <Text style={styles.name}>Subslip</Text>
      <ActivityIndicator color="#FF5C35" style={styles.spinner} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  icon: { width: 200, height: 200 },
  name: { marginTop: 12, fontSize: 28, fontWeight: '800', color: '#2A1A14', letterSpacing: -0.5 },
  spinner: { position: 'absolute', bottom: 96 },
});
