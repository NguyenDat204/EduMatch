type AnalyticsParams = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
    mantle?: {
      track?: (eventName: string, params?: AnalyticsParams) => void;
      identify?: (userId: string, traits?: AnalyticsParams) => void;
    };
  }
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID?.trim();
const GTM_CONTAINER_ID = import.meta.env.VITE_GTM_CONTAINER_ID?.trim();
const CLARITY_PROJECT_ID = import.meta.env.VITE_CLARITY_PROJECT_ID;
const MANTLE_APP_ID = import.meta.env.VITE_MANTLE_APP_ID;
const isProduction = import.meta.env.PROD;
const debugMode = import.meta.env.DEV || import.meta.env.VITE_GA4_DEBUG_MODE === 'true';
let analyticsInitialized = false;
let lastTrackedPage = '';

const appendScript = (id: string, src: string, async = true): HTMLScriptElement | null => {
  if (typeof document === 'undefined') return null;
  const existingScript = document.getElementById(id);
  if (existingScript instanceof HTMLScriptElement) return existingScript;

  const script = document.createElement('script');
  script.id = id;
  script.src = src;
  script.async = async;
  document.head.appendChild(script);
  return script;
};

export const initAnalytics = () => {
  if (typeof window === 'undefined') return;
  if (analyticsInitialized) return;
  analyticsInitialized = true;

  if (GA_MEASUREMENT_ID) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtagShim() {
      window.dataLayer?.push(arguments);
    };
    appendScript('ga4-script', `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`);
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: false,
      debug_mode: debugMode,
    });
  }

  if (GTM_CONTAINER_ID) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js',
    });
    appendScript('gtm-script', `https://www.googletagmanager.com/gtm.js?id=${GTM_CONTAINER_ID}`);
  }

  if (CLARITY_PROJECT_ID) {
    window.clarity = window.clarity || function clarityShim(...args: unknown[]) {
      (window.clarity as any).q = (window.clarity as any).q || [];
      (window.clarity as any).q.push(args);
    };
    appendScript('clarity-script', `https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`);
  }

  if (MANTLE_APP_ID && isProduction) {
    // Mantle setups can differ by product/account. This keeps event calls ready
    // without assuming a script URL that may not match your Mantle workspace.
    console.info('Mantle analytics key detected. Add the Mantle SDK snippet if your account requires it.');
  }
};

export const trackPageView = (path: string, title = document.title) => {
  if (typeof window === 'undefined') return;
  initAnalytics();

  if (lastTrackedPage === path) return;
  lastTrackedPage = path;

  if (GA_MEASUREMENT_ID) {
    window.gtag?.('config', GA_MEASUREMENT_ID, {
      page_path: path,
      page_location: window.location.href,
      page_title: title,
      anonymize_ip: true,
      debug_mode: debugMode,
    });
  }

  window.dataLayer?.push({
    event: 'page_view',
    page_path: path,
    page_location: window.location.href,
    page_title: title,
  });

  window.clarity?.('set', 'page_path', path);
};

export const trackEvent = (eventName: string, params: AnalyticsParams = {}) => {
  if (typeof window === 'undefined') return;
  initAnalytics();

  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null)
  );

  window.gtag?.('event', eventName, {
    ...cleanParams,
    debug_mode: debugMode,
  });
  window.dataLayer?.push({ event: eventName, ...cleanParams });
  window.clarity?.('event', eventName);
  window.mantle?.track?.(eventName, cleanParams);
};

export const identifyAnalyticsUser = (userId: string, traits: AnalyticsParams = {}) => {
  if (!userId || typeof window === 'undefined') return;

  window.clarity?.('identify', userId);
  window.gtag?.('set', { user_id: userId });
  window.mantle?.identify?.(userId, traits);
};
