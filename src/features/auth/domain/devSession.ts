import type { Session } from "../types"

/**
 * Sesi palsu khusus pengembangan untuk melihat UI tanpa login. Hanya aktif saat `vite dev`;
 * `import.meta.env.DEV` bernilai false pada build produksi sehingga kode ini tidak ikut.
 *
 * Pilih peran lewat `?devrole=<peran>` di URL (disimpan selama tab terbuka) atau
 * `VITE_DEV_ROLE` di `.env.local`. Nilai: customer, customer-new (profil belum lengkap),
 * owner, admin_kasir, super_admin, barber, guest (tamu), off (matikan, pakai login asli).
 */
const KEY = "loque-dev-role"

const ROLES: Record<string, Pick<Session, "role" | "profileComplete">> = {
  customer: { role: "customer", profileComplete: true },
  "customer-new": { role: "customer", profileComplete: false },
  owner: { role: "owner" },
  admin_kasir: { role: "admin_kasir" },
  super_admin: { role: "super_admin" },
  barber: { role: "barber" },
}

/** undefined = tidak aktif (pakai `auth.me`); null = tamu; Session = pengguna palsu. */
export function readDevSession(): Session | null | undefined {
  if (!import.meta.env.DEV) return undefined
  let value: string | null | undefined
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("devrole")
    if (fromUrl === "off") sessionStorage.removeItem(KEY)
    else if (fromUrl) sessionStorage.setItem(KEY, fromUrl)
    value = fromUrl === "off" ? null : (fromUrl ?? sessionStorage.getItem(KEY))
  } catch {
    value = null
  }
  value ??= import.meta.env.VITE_DEV_ROLE
  if (!value) return undefined
  if (value === "guest") return null
  const preset = ROLES[value]
  if (!preset) return undefined
  console.warn(`[dev] Sesi palsu aktif: ${value}. Tambahkan ?devrole=off untuk memakai login asli.`)
  return {
    ...preset,
    personId: `dev-${value}`,
    displayName: `Dev ${value}`,
    expiresAt: Date.now() + 86_400_000,
  }
}
