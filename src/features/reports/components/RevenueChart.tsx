import { formatDate, formatRupiah } from "@/shared/utils/format"
import type { RevenuePoint } from "../types"

const short = (v: number) =>
  v >= 1_000_000
    ? `${(v / 1_000_000).toFixed(1).replace(".0", "")} jt`
    : v >= 1000
      ? `${Math.round(v / 1000)} rb`
      : String(v)
const tick = { fontSize: 12, fill: "#475569" }

export const chartAxis = {
  x: {
    tick,
    tickLine: false,
    axisLine: false,
    tickFormatter: (v: string) => String(Number(v.slice(8))),
    interval: "preserveStartEnd" as const,
    minTickGap: 16,
  },
  y: {
    tick,
    tickLine: false,
    axisLine: false,
    tickFormatter: short,
    width: 48,
  },
}

export function RevenueTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: { payload: RevenuePoint }[]
}) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className="rounded-lg bg-white p-3 text-xs shadow-pop">
      <p className="mb-1 font-semibold text-slate-900">{formatDate(p.date)}</p>
      <p className="text-sm font-semibold text-primary-800">{formatRupiah(p.total)}</p>
      <dl className="mt-1 flex flex-col gap-0.5 text-slate-700">
        <div className="flex justify-between gap-4">
          <dt>Tunai</dt>
          <dd>{formatRupiah(p.cash)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>QRIS toko</dt>
          <dd>{formatRupiah(p.qris)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Transfer bank</dt>
          <dd>{formatRupiah(p.transfer)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Lainnya</dt>
          <dd>{formatRupiah(p.other)}</dd>
        </div>
      </dl>
    </div>
  )
}
