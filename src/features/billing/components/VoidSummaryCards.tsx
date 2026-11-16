import { AlertTriangle, Ban, Clock, Timer, Users } from "lucide-react"
import type { ReactNode } from "react"
import { Delta, Skeleton } from "@/shared/components"
import { cn } from "@/shared/utils/cn"
import { formatRupiah } from "@/shared/utils/format"
import type { VoidRequestPublic } from "@/shared/types"
import { percentChange } from "@/features/reports"
import { formatWait, summarizeVoids } from "../domain/void"

interface CardProps {
  label: string
  value: ReactNode
  hint?: ReactNode
  icon: ReactNode
  /** Kelas aksen: latar dan warna ikon. */
  accent: { bg: string; icon: string }
  className?: string
  onClick?: () => void
  pressed?: boolean
}

const ACCENT = {
  warning: { bg: "bg-warning-50", icon: "text-warning-700" },
  strong: { bg: "bg-warning-100", icon: "text-warning-800" },
  slate: { bg: "bg-white", icon: "text-slate-600" },
  primary: { bg: "bg-primary-50", icon: "text-primary-700" },
}

function SummaryCard({ label, value, hint, icon, accent, className, onClick, pressed }: CardProps) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
          <span aria-hidden className={cn("shrink-0", accent.icon)}>
            {icon}
          </span>
          {label}
        </p>
      </div>
      <p className="text-display font-semibold tabular-nums text-slate-900">{value}</p>
      {hint && <div className="text-xs text-slate-700">{hint}</div>}
    </>
  )
  const base = cn(
    "flex min-h-36 min-w-64 shrink-0 snap-start flex-col justify-between gap-3 rounded-xl p-4 text-left shadow-card transition-shadow hover:shadow-pop sm:min-w-0",
    accent.bg,
    className,
  )
  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className={cn(base, pressed && "outline-2 outline-warning-600")}
    >
      {body}
    </button>
  ) : (
    <div className={base}>{body}</div>
  )
}

/**
 * Kartu ringkasan Daftar void. Empat kolom di desktop, dua di tablet, dan gulir horizontal
 * ber-snap di mobile. Kartu "Menunggu" dapat diklik untuk menyaring tabel.
 */
export function VoidSummaryCards({
  data,
  threshold,
  pendingActive,
  onTogglePending,
}: {
  data: VoidRequestPublic[] | undefined
  threshold: number
  pendingActive: boolean
  onTogglePending: () => void
}) {
  if (!data)
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-36" />
        ))}
      </div>
    )
  const s = summarizeVoids(data, threshold, Date.now())
  const max = Math.max(1, ...s.perCashier.map((c) => c.count))
  return (
    <section
      aria-label="Ringkasan void"
      className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 xl:grid-cols-4"
    >
      <SummaryCard
        label="Menunggu persetujuan"
        value={s.pending}
        icon={<Clock className="size-4" />}
        accent={ACCENT.warning}
        onClick={onTogglePending}
        pressed={pendingActive}
        hint={
          pendingActive
            ? "Tabel disaring. Ketuk untuk menampilkan semua."
            : "Ketuk untuk menyaring tabel"
        }
      />
      <SummaryCard
        label="Di atas ambang"
        value={s.pendingAbove}
        icon={<AlertTriangle className="size-4" />}
        accent={ACCENT.strong}
        hint={`Menunggu dengan nominal di atas ${formatRupiah(threshold)}`}
      />
      <SummaryCard
        label="Rata-rata waktu tunggu"
        value={formatWait(s.avgWaitMs)}
        icon={<Timer className="size-4" />}
        accent={ACCENT.slate}
        hint="Dari pengajuan sampai disetujui"
      />
      <SummaryCard
        label="Void bulan ini"
        value={s.approvedThisMonth}
        icon={<Ban className="size-4" />}
        accent={ACCENT.primary}
        hint={
          <Delta
            percent={percentChange(s.approvedThisMonth, s.approvedLastMonth)}
            label="dari bulan lalu"
            invert
          />
        }
      />
      <SummaryCard
        label="Void per kasir"
        value={s.perCashier.length === 0 ? "0" : s.perCashier.reduce((a, c) => a + c.count, 0)}
        icon={<Users className="size-4" />}
        accent={ACCENT.slate}
        className="sm:col-span-2"
        hint={
          s.perCashier.length === 0 ? (
            "Belum ada pengajuan bulan ini"
          ) : (
            <ul className="flex flex-col gap-1.5" aria-label="Void per kasir bulan ini">
              {s.perCashier.map((c) => (
                <li key={c.name} className="flex items-center gap-2">
                  <span className="w-24 shrink-0 truncate font-medium">{c.name}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                    <span
                      className="block h-full rounded-full bg-primary-700"
                      style={{ width: `${(c.count / max) * 100}%` }}
                    />
                  </span>
                  <span className="w-6 text-right font-semibold">{c.count}</span>
                </li>
              ))}
            </ul>
          )
        }
      />
    </section>
  )
}
