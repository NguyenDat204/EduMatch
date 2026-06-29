type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

const GA_SCRIPT_ID = 'ga4-script';
const measurementId = import.meta.env.VITE_GA4_MEASUREMENT_ID?.trim();

let isInitialized = false;
let lastTrackedPage = '';

export const isAnalyticsEnabled = Boolean(measurementId);

export const initializeAnalytics = () => {
  if (!measurementId || typeof window === 'undefined') {
    return false;
  }

  if (isInitialized) {
    return true;
  }

  if (!document.getElementById(GA_SCRIPT_ID)) {
    const script = document.createElement('script');
    script.id = GA_SCRIPT_ID;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || ((...args: unknown[]) => window.dataLayer?.push(args));
  window.gtag('js', new Date());
  window.gtag('config', measurementId, { send_page_view: false });

  isInitialized = true;
  return true;
};

export const trackPageView = (pagePath: string, pageTitle = document.title) => {
  if (!initializeAnalytics() || lastTrackedPage === pagePath) {
    return;
  }

  lastTrackedPage = pagePath;
  window.gtag?.('event', 'page_view', {
    page_title: pageTitle,
    page_location: window.location.href,
    page_path: pagePath,
  });
};

export const trackEvent = (eventName: string, params?: Record<string, unknown>) => {
  if (!initializeAnalytics()) {
    return;
  }

  window.gtag?.('event', eventName, params);
};
