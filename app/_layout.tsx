import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { PostHogProvider } from 'posthog-react-native';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SubTrackProvider } from '@/context/SubTrackContext';
import { posthog, track } from '@/utils/analytics';
import { installGlobalErrorHandler } from '@/utils/crashReporting';

SplashScreen.preventAutoHideAsync();
installGlobalErrorHandler();
const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="subscription/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="service/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
    track.appOpened();
  }, []);

  return (
    <ErrorBoundary>
      <PostHogProvider client={posthog}>
        <QueryClientProvider client={queryClient}>
          <SubTrackProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <RootLayoutNav />
            </GestureHandlerRootView>
          </SubTrackProvider>
        </QueryClientProvider>
      </PostHogProvider>
    </ErrorBoundary>
  );
}
