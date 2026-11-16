import { VOID_MAX_ATTEMPTS, VOID_TTL_HOURS } from "@/shared/constants"
import { HOUR_MS, toYmd } from "@/shared/domain/time"
import type { Id, IsoDateTime, VoidRequest, VoidStatus } from "@/shared/types"

/** Token 6 digit angka acak. */
export function generateVoidToken(random: () => number = Math.random): string {
  let out = ""
  for (let i = 0; i < 6; i++) out += Math.floor(random() * 10)
  return out
}

export function voidExpiry(createdAt: IsoDateTime): IsoDateTime {
  return new Date(new Date(createdAt).getTime() + VOID_TTL_HOURS * HOUR_MS).toISOString()
}

/** Status efektif: permintaan menunggu yang lewat 24 jam menjadi kedaluwarsa. */
export function effectiveVoidStatus(
  v: Pick<VoidRequest, "status" | "expiresAt">,
  now: number,
): VoidStatus {
  if (v.status === "pending" && new Date(v.expiresAt).getTime() <= now) return "expired"
  return v.status
}

/** Pemohon tidak boleh menjadi pemutus permintaannya sendiri. */
export function canDecideVoid(request: Pick<VoidRequest, "requesterId">, actorId: Id): boolean {
  return request.requesterId !== actorId
}

export type VoidCodeResult =
  | { result: "approved" }
  | {
      result: "wrong"
      attemptsLeft: number
    }
  | { result: "locked" }
  | { result: "expired" }
  | { result: "not_pending" }

/** Memeriksa kode yang dimasukkan kasir. Mengembalikan jumlah percobaan baru lewat `nextAttempts`. */
export function checkVoidCode(
  request: Pick<VoidRequest, "status" | "expiresAt" | "attempts" | "token">,
  code: string,
  now: number,
): { outcome: VoidCodeResult; nextAttempts: number } {
  const status = effectiveVoidStatus(request, now)
  if (status === "expired")
    return { outcome: { result: "expired" }, nextAttempts: request.attempts }
  if (status === "locked") return { outcome: { result: "locked" }, nextAttempts: request.attempts }
  if (status !== "pending")
    return {
      outcome: { result: "not_pending" },
      nextAttempts: request.attempts,
    }
  if (code === request.token)
    return { outcome: { result: "approved" }, nextAttempts: request.attempts }
  const next = request.attempts + 1
  if (next >= VOID_MAX_ATTEMPTS) return { outcome: { result: "locked" }, nextAttempts: next }
  return {
    outcome: { result: "wrong", attemptsLeft: VOID_MAX_ATTEMPTS - next },
    nextAttempts: next,
  }
}

export function isAboveThreshold(amount: number, threshold: number): boolean {
  return amount > threshold
}

export interface VoidSummary {
  pending: number
  /** Permintaan menunggu dengan nominal di atas ambang. */
  pendingAbove: number
  /** Rata-rata waktu tunggu persetujuan dalam milidetik; null bila belum ada yang disetujui. */
  avgWaitMs: number | null
  approvedThisMonth: number
  approvedLastMonth: number
  perCashier: { name: string; count: number }[]
}

const monthOf = (iso: string) => toYmd(iso).slice(0, 7)
const shiftMonth = (ym: string, n: number) => {
  const [y, m] = ym.split("-").map(Number)
  const d = new Date(Date.UTC(y, m - 1 + n, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
}

/** Ringkasan Daftar void untuk kartu di kepala halaman. Status harus sudah berupa status efektif. */
export function summarizeVoids(
  voids: Pick<VoidRequest, "status" | "amount" | "createdAt" | "decidedAt" | "requesterName">[],
  threshold: number,
  now: number,
): VoidSummary {
  const month = monthOf(new Date(now).toISOString())
  const last = shiftMonth(month, -1)
  const pending = voids.filter((v) => v.status === "pending")
  const approved = voids.filter((v) => v.status === "approved" && v.decidedAt)
  const waits = approved.map(
    (v) => new Date(v.decidedAt as string).getTime() - new Date(v.createdAt).getTime(),
  )
  const perCashier = [
    ...voids
      .filter((v) => monthOf(v.createdAt) === month)
      .reduce(
        (m, v) => m.set(v.requesterName, (m.get(v.requesterName) ?? 0) + 1),
        new Map<string, number>(),
      ),
  ]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
  return {
    pending: pending.length,
    pendingAbove: pending.filter((v) => isAboveThreshold(v.amount, threshold)).length,
    avgWaitMs: waits.length ? waits.reduce((a, b) => a + b, 0) / waits.length : null,
    approvedThisMonth: approved.filter((v) => monthOf(v.decidedAt as string) === month).length,
    approvedLastMonth: approved.filter((v) => monthOf(v.decidedAt as string) === last).length,
    perCashier,
  }
}

/** Format singkat waktu tunggu, mis. "2 j 15 m". */
export function formatWait(ms: number | null): string {
  if (ms === null) return "-"
  const mins = Math.max(0, Math.round(ms / 60000))
  const h = Math.floor(mins / 60)
  return h > 0 ? `${h} j ${mins % 60} m` : `${mins} m`
}
