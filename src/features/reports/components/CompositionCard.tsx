import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, MoneyText } from "@/shared/components"
import { formatRupiah } from "@/shared/utils/format"
import { COMPOSITION_LABEL, type CompositionKey, type CompositionSegment } from "../types"

// Warna dari token yang ada: zamrud 700, biru langit 700, ungu 600, slate 500.
const COLOR: Record<CompositionKey, string> = {
  service: "#047857",
  addon: "#0369a1",
  drink: "#7c3aed",
  product: "#64748b",
}
// Penanda bentuk pada legenda agar kategori tidak hanya dibedakan lewat warna.
const MARK: Record<CompositionKey, string> = { service: "A", addon: "B", drink: "C", product: "D" }

const pct = (n: number) =>
  `${n.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`

function SegmentTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: { payload: CompositionSegment }[]
}) {
  if (!active || !payload?.length) return null
  const s = payload[0].payload
  return (
    <div className="rounded-lg bg-white p-3 text-xs shadow-pop">
      <p className="font-semibold text-slate-900">
        {s.label} · {formatRupiah(s.amount)} · {pct(s.percent)}
      </p>
    </div>
  )
}

/** Komposisi pendapatan menurut kategori: donut, legenda, dan tabel rincian. */
export function CompositionCard({ segments }: { segments: CompositionSegment[] }) {
  const total = segments.reduce((a, s) => a + s.amount, 0)
  const data = segments.filter((s) => s.amount > 0)
  const summary = segments
    .map((s) => `${s.label} ${formatRupiah(s.amount)} (${pct(s.percent)})`)
    .join(", ")
  return (
    <Card>
      <CardHeader>
        <CardTitle>Komposisi pendapatan</CardTitle>
        <span className="text-sm text-slate-600">
          Penjualan dari baris tagihan yang sudah dibayar
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid items-center gap-6 md:grid-cols-2">
          <div
            className="relative mx-auto h-64 w-full max-w-sm"
            role="img"
            aria-label={`Donut komposisi pendapatan, total ${formatRupiah(total)}. ${summary}`}
          >
            {total === 0 ? (
              <p className="flex h-full items-center justify-center text-center text-sm text-slate-600">
                Belum ada penjualan pada periode ini.
              </p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      dataKey="amount"
                      nameKey="label"
                      innerRadius="62%"
                      outerRadius="92%"
                      paddingAngle={2}
                      stroke="#ffffff"
                    >
                      {data.map((s) => (
                        <Cell key={s.key} fill={COLOR[s.key]} />
                      ))}
                    </Pie>
                    <Tooltip content={<SegmentTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xs text-slate-600">Total pendapatan</span>
                  <span className="text-section font-semibold text-slate-900">
                    {formatRupiah(total)}
                  </span>
                </div>
              </>
            )}
          </div>
          <ul className="flex flex-col gap-2" aria-label="Legenda komposisi">
            {segments.map((s) => (
              <li
                key={s.key}
                className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-slate-900">
                  <span
                    aria-hidden
                    className="flex size-6 items-center justify-center rounded text-xs font-semibold text-white"
                    style={{ backgroundColor: COLOR[s.key] }}
                  >
                    {MARK[s.key]}
                  </span>
                  {s.label}
                </span>
                <span className="text-right text-sm">
                  <MoneyText value={s.amount} className="font-semibold" />
                  <span className="block text-xs text-slate-600">{pct(s.percent)}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <table className="w-full text-sm">
          <caption className="mb-2 text-left text-sm font-semibold text-slate-900">
            Rincian per kategori
          </caption>
          <thead className="text-left text-xs text-slate-600">
            <tr>
              <th scope="col" className="py-1 font-medium">
                Kategori
              </th>
              <th scope="col" className="py-1 text-right font-medium">
                Nominal
              </th>
              <th scope="col" className="py-1 text-right font-medium">
                Persen
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {segments.map((s) => (
              <tr key={s.key}>
                <th scope="row" className="py-2 text-left font-normal">
                  {COMPOSITION_LABEL[s.key]}
                </th>
                <td className="py-2 text-right">
                  <MoneyText value={s.amount} />
                </td>
                <td className="py-2 text-right">{pct(s.percent)}</td>
              </tr>
            ))}
            <tr className="font-semibold">
              <th scope="row" className="py-2 text-left">
                Total
              </th>
              <td className="py-2 text-right">
                <MoneyText value={total} />
              </td>
              <td className="py-2 text-right">{total > 0 ? pct(100) : pct(0)}</td>
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
