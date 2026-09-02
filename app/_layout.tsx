import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { Href, router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { PostHogProvider } from 'posthog-react-native';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SubTrackProvider } from '@/context/SubTrackContext';
import { posthog, track } from '@/utils/analytics';
import { installGlobalErrorHandler } from '@/utils/crashReporting';
import { parseReminderPayload } from '@/utils/notifications';

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

  // Tapping a billing reminder should land on the subscription it's about, not just the
  // dashboard. The post-trial notification is the exception: TrialFollowUpModal asks its
  // question from wherever the user ends up, so that one only needs to open the app.
  useEffect(() => {
    const listener = Notifications.addNotificationResponseReceivedListener((response) => {
      const payload = parseReminderPayload(response.notification.request.content.data);
      if (!payload || payload.kind === 'trialFollowUp') return;
      router.push(`/subscription/${payload.subscriptionId}` as Href);
    });
    return () => listener.remove();
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
