/** Konteks yang dipulihkan setelah masuk: barber, kanal tautan, dan tujuan awal. */
export interface LoginContext {
  barber?: string
  ref?: string
  next?: string
}

const KEY = "loque-login-context"

/** Hanya jalur aplikasi (diawali satu "/") yang boleh jadi tujuan; mencegah alihan terbuka. */
export function safeNext(next: string | null | undefined): string | undefined {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return undefined
  if (next.startsWith("/masuk") || next.startsWith("/staf/masuk")) return undefined
  return next
}

export function saveLoginContext(ctx: LoginContext): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(ctx))
  } catch {
    /* penyimpanan tidak tersedia */
  }
}

export function takeLoginContext(): LoginContext {
  try {
    const raw = sessionStorage.getItem(KEY)
    sessionStorage.removeItem(KEY)
    return raw ? (JSON.parse(raw) as LoginContext) : {}
  } catch {
    return {}
  }
}

/** Tujuan sesudah masuk: `next` bila aman, lalu profil barber, lalu beranda. */
export function resolveTarget(ctx: LoginContext): string {
  const next = safeNext(ctx.next)
  if (next) return next
  if (ctx.barber)
    return `/b/${encodeURIComponent(ctx.barber)}${ctx.ref ? `?ref=${encodeURIComponent(ctx.ref)}` : ""}`
  return "/"
}
