import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';
import { detectDeviceLanguage } from '@/context/SubTrackContext';
import { strings } from '@/i18n/strings';
import { track } from '@/utils/analytics';

// Renders outside SubTrackProvider (it wraps the provider tree to catch errors
// from the provider itself), so it can't read the user's saved language choice —
// falls back to the device locale instead of hardcoded English.
const t = strings[detectDeviceLanguage()];

type Props = { children: React.ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    track.appCrashed(error.message, info.componentStack ?? '');
  }

  reset = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.wrap}>
          <Text style={styles.title}>{t.errorBoundaryTitle}</Text>
          <Text style={styles.body}>{t.errorBoundaryBody}</Text>
          <Pressable style={styles.button} onPress={this.reset}>
            <Text style={styles.buttonText}>{t.errorBoundaryRetry}</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
    backgroundColor: theme.cream,
  },
  title: { fontSize: 20, fontWeight: '700', color: theme.text },
  body: { fontSize: 15, color: theme.textMuted, textAlign: 'center', lineHeight: 22 },
  button: {
    marginTop: 8,
    backgroundColor: theme.accent,
    borderRadius: 9999,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  buttonText: { color: '#FFFFFF', fontWeight: '700' },
});
