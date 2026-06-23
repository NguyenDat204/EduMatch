/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_GA4_MEASUREMENT_ID?: string;
  readonly VITE_GTM_CONTAINER_ID?: string;
  readonly VITE_CLARITY_PROJECT_ID?: string;
  readonly VITE_MANTLE_APP_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
