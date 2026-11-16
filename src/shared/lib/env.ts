import { z } from "zod"

const schema = z.object({
  VITE_API_BASE_URL: z.string().default(""),
  VITE_APP_ENV: z.string().default("development"),
  VITE_BASE_PATH: z.string().default("/"),
  VITE_TURNSTILE_SITE_KEY: z.string().default(""),
  VITE_PUBLIC_BASE_URL: z.string().default(""),
})

const parsed = schema.parse({
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL || undefined,
  VITE_APP_ENV: import.meta.env.VITE_APP_ENV || undefined,
  VITE_BASE_PATH: import.meta.env.VITE_BASE_PATH || undefined,
  VITE_TURNSTILE_SITE_KEY: import.meta.env.VITE_TURNSTILE_SITE_KEY || undefined,
  VITE_PUBLIC_BASE_URL: import.meta.env.VITE_PUBLIC_BASE_URL || undefined,
})

export const env = {
  apiBaseUrl: parsed.VITE_API_BASE_URL.replace(/\/+$/, ""),
  appEnv: parsed.VITE_APP_ENV,
  turnstileSiteKey: parsed.VITE_TURNSTILE_SITE_KEY,
  /** Origin untuk tautan yang dibagikan; bawaan origin halaman. */
  publicBaseUrl:
    parsed.VITE_PUBLIC_BASE_URL || (typeof window === "undefined" ? "" : window.location.origin),
  isProduction: parsed.VITE_APP_ENV === "production",
} as const
