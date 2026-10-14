import PostHog from 'posthog-react-native';

// Set EXPO_PUBLIC_POSTHOG_KEY (PostHog EU → Settings → Project API Key) in .env locally, and as an
// EAS env var / GitHub secret for release builds. A CI build with the secret missing bakes in an
// empty string — not undefined — so `??` alone let PostHog start with a blank key and silently
// drop every event. Anything that isn't a real project key disables analytics instead.
const POSTHOG_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY?.trim() ?? '';
const analyticsEnabled = POSTHOG_KEY.startsWith('phc_');

export const posthog = new PostHog(analyticsEnabled ? POSTHOG_KEY : 'phc_disabled', {
  host: 'https://eu.i.posthog.com',
  disabled: !analyticsEnabled,
  // "Application Installed / Opened / Backgrounded" — the raw material for retention cohorts,
  // which is the question these analytics exist to answer.
  captureAppLifecycleEvents: true,
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
    isFirst: boolean;
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

  reviewPromptAnswered: (accepted: boolean) =>
    posthog.capture('review_prompt_answered', { accepted }),

  trialFollowUpAnswered: (props: { name: string; answer: string }) =>
    posthog.capture('trial_follow_up_answered', props),

  summaryShared: (source: string) => posthog.capture('summary_shared', { source }),

  appCrashed: (message: string, context: string) =>
    posthog.capture('app_crashed', { message: message.slice(0, 500), context: context.slice(0, 500) }),

  // ── Activation & retention funnel ──
  quickStartShown: () => posthog.capture('quick_start_shown'),

  quickStartPicked: (serviceId: string, source: 'onboarding' | 'empty_home') =>
    posthog.capture('quick_start_picked', { serviceId, source }),

  quickStartSkipped: (via: 'skip' | 'browse') => posthog.capture('quick_start_skipped', { via }),

  notificationPrimerShown: (askNumber: number) =>
    posthog.capture('notification_primer_shown', { askNumber }),

  notificationPrimerAnswered: (accepted: boolean) =>
    posthog.capture('notification_primer_answered', { accepted }),

  /** The OS-level answer, wherever the system prompt was raised from. */
  notificationPermissionResult: (status: string, source: 'primer' | 'banner' | 'settings') =>
    posthog.capture('notification_permission_result', { status, source }),

  remindersBannerTapped: (permission: string) =>
    posthog.capture('reminders_banner_tapped', { permission }),

  /** A tapped reminder is a return visit the reminder caused — the core retention loop. */
  notificationOpened: (kind: string) => posthog.capture('notification_opened', { kind }),

  widgetTipDismissed: () => posthog.capture('widget_tip_dismissed'),

  // ── Growth features ──
  receiptOpened: () => posthog.capture('receipt_opened'),

  receiptShared: (props: { subscriptions: number; yearly: number; hasWage: boolean }) =>
    posthog.capture('receipt_shared', props),

  priceHikeAnswered: (name: string, pct: number, updated: boolean) =>
    posthog.capture('price_hike_answered', { name, pct, updated }),

  rotationViewed: (members: number, yearlySaving: number) =>
    posthog.capture('rotation_viewed', { members, yearlySaving: Math.round(yearlySaving) }),

  alternativeTapped: (service: string, alternative: string) =>
    posthog.capture('alternative_tapped', { service, alternative }),

  themeChanged: (mode: string) => posthog.capture('theme_changed', { mode }),
};
