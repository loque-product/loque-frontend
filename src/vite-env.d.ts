/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_APP_ENV?: string
  readonly VITE_BASE_PATH?: string
  readonly VITE_DEV_ROLE?: string
  readonly VITE_TURNSTILE_SITE_KEY?: string
  readonly VITE_PUBLIC_BASE_URL?: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
