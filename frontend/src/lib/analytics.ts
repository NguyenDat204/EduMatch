export {
  identifyAnalyticsUser,
  initAnalytics as initializeAnalytics,
  trackEvent,
  trackPageView,
} from '../services/analytics';

export const isAnalyticsEnabled = Boolean(import.meta.env.VITE_GA4_MEASUREMENT_ID?.trim());
