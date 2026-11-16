/** Titik pelaporan galat. Isi dengan Sentry atau sejenisnya saat produksi. */
export function reportError(error: unknown, context?: Record<string, unknown>): void {
  if (import.meta.env.VITE_APP_ENV !== "production") console.error("[loque]", error, context)
}
