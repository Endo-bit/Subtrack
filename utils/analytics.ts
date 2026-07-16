import PostHog from 'posthog-react-native';

// Replace with your PostHog EU project API key (Settings → Project API Key)
// Or set EXPO_PUBLIC_POSTHOG_KEY in your .env file
const POSTHOG_KEY =
  process.env.EXPO_PUBLIC_POSTHOG_KEY ?? 'phc_REPLACE_WITH_YOUR_KEY';

export const posthog = new PostHog(POSTHOG_KEY, {
  host: 'https://eu.i.posthog.com',
  // Disable automatic session recording in dev
  disabled: POSTHOG_KEY === 'phc_REPLACE_WITH_YOUR_KEY',
  flushAt: 10,
  flushInterval: 30000,
});

// ─── Typed event helpers ───────────────────────────────────────────────────

export const track = {
  appOpened: () => posthog.capture('app_opened'),

  onboardingCompleted: () => posthog.capture('onboarding_completed'),

  subscriptionAdded: (props: {
    name: string;
    category: string;
    billingCycle: string;
    price: number;
  }) => posthog.capture('subscription_added', props),

  subscriptionRemoved: (props: { name: string; category: string }) =>
    posthog.capture('subscription_removed', props),

  planChanged: (props: { name: string; plan: string; price: number }) =>
    posthog.capture('plan_changed', props),

  cancelPageOpened: (name: string) =>
    posthog.capture('cancel_page_opened', { name }),

  languageChanged: (language: string) =>
    posthog.capture('language_changed', { language }),

  feedbackSubmitted: (props: { rating: number; comment: string }) =>
    posthog.capture('feedback_submitted', props),

  tabViewed: (tab: string) => posthog.capture('tab_viewed', { tab }),

  searchPerformed: (query: string, resultCount: number) =>
    posthog.capture('search_performed', { query: query.slice(0, 50), resultCount }),

  paywallViewed: (source: string) => posthog.capture('paywall_viewed', { source }),

  purchaseCompleted: (packageId: string) =>
    posthog.capture('purchase_completed', { packageId }),

  purchaseRestored: (success: boolean) =>
    posthog.capture('purchase_restored', { success }),
};
