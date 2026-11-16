import { ArrowDownRight, ArrowRight, ArrowUpRight, Minus } from "lucide-react"
import type { ReactNode } from "react"
import { Link } from "react-router"
import { cn } from "@/shared/utils/cn"
import type { Tone } from "./ui/badge"

const iconTone: Record<Tone, string> = {
  slate: "text-slate-600",
  primary: "text-primary-700",
  warning: "text-warning-700",
  danger: "text-danger-700",
  info: "text-info-700",
}
const cardTone: Record<Tone, string> = {
  slate: "bg-white",
  primary: "bg-white",
  warning: "bg-warning-50",
  danger: "bg-danger-50",
  info: "bg-white",
}

interface Props {
  label: string
  value: ReactNode
  icon?: ReactNode
  tone?: Tone
  hint?: ReactNode
  href?: string
  linkLabel?: string
  /** Perbandingan: positif naik, negatif turun. */
  delta?: { percent: number | null; label?: string; invert?: boolean }
}

export function StatCard({
  label,
  value,
  icon,
  tone = "primary",
  hint,
  href,
  linkLabel = "Lihat",
  delta,
}: Props) {
  return (
    <div className={cn("flex flex-col gap-2 rounded-xl p-4 shadow-card", cardTone[tone])}>
      <p className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
        {icon && (
          <span aria-hidden className={cn("shrink-0 [&>svg]:size-4", iconTone[tone])}>
            {icon}
          </span>
        )}
        {label}
      </p>
      <p className="text-title font-semibold text-slate-900">{value}</p>
      {delta && <Delta {...delta} />}
      {hint && <p className="text-xs text-slate-600">{hint}</p>}
      {href && (
        <Link
          to={href}
          className="mt-auto inline-flex min-h-8 items-center gap-1 text-sm font-medium text-primary-800 hover:underline"
        >
          {linkLabel}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      )}
    </div>
  )
}

/** Perbandingan dengan teks dan ikon, bukan warna saja. */
export function Delta({
  percent,
  label = "dari periode sebelumnya",
  invert,
}: {
  percent: number | null
  label?: string
  invert?: boolean
}) {
  if (percent === null)
    return (
      <p className="flex items-center gap-1 text-xs text-slate-600">
        <Minus className="size-3" aria-hidden />
        Belum ada pembanding
      </p>
    )
  if (Math.abs(percent) < 0.5)
    return (
      <p className="flex items-center gap-1 text-xs text-slate-600">
        <Minus className="size-3" aria-hidden />
        Tidak berubah {label}
      </p>
    )
  const up = percent > 0
  const good = invert ? !up : up
  const Icon = up ? ArrowUpRight : ArrowDownRight
  return (
    <p
      className={cn(
        "flex items-center gap-1 text-xs font-medium",
        good ? "text-primary-700" : "text-danger-700",
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {up ? "Naik" : "Turun"} {Math.abs(Math.round(percent))}% {label}
    </p>
  )
}
