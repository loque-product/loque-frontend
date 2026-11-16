import { AlertTriangle, ArrowRight, Ban, ReceiptText, Undo2 } from "lucide-react"
import { Link } from "react-router"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  Async,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Delta,
  EmptyState,
  MoneyText,
  Skeleton,
  StatCard,
} from "@/shared/components"
import { LOQUE_FEE_PER_TRANSACTION } from "@/shared/domain/money"
import { formatAge, formatDayShort, formatRupiah } from "@/shared/utils/format"
import { useCurrentUser } from "@/features/auth"
import { percentChange } from "../domain/stats"
import { useDashboard } from "../hooks"
import type { Compared, RangeStats } from "../types"
import { RevenueTooltip, chartAxis } from "./RevenueChart"

const greeting = () => {
  const h = (new Date().getUTCHours() + 7) % 24
  return h < 11
    ? "Selamat pagi"
    : h < 15
      ? "Selamat siang"
      : h < 19
        ? "Selamat sore"
        : "Selamat malam"
}

export function Dashboard() {
  const q = useDashboard()
  const user = useCurrentUser()
  return (
    <div className="flex flex-col gap-5">
      <p className="text-base text-slate-700">
        {greeting()}, {user?.displayName.split(" ")[0]}. {formatDayShort(Date.now())}{" "}
        {new Date().getFullYear()}.
      </p>
      <Async
        query={q}
        skeleton={
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-36" />
              ))}
            </div>
            <Skeleton className="h-72" />
          </div>
        }
      >
        {(d) => (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Void menunggu persetujuan"
                value={d.pendingVoids}
                tone={d.pendingVoids > 0 ? "warning" : "slate"}
                icon={<Ban className="size-4" aria-hidden />}
                href="/owner/void"
                linkLabel="Buka daftar void"
              />
              <StatCard
                label="Refund belum selesai"
                value={d.pendingRefunds}
                tone={d.pendingRefunds > 0 ? "warning" : "slate"}
                icon={<Undo2 className="size-4" aria-hidden />}
                href="/staf/refund"
                linkLabel="Buka daftar refund"
              />
              <StatCard
                label="Pembayaran terlambat perlu ditangani"
                value={d.lateHandling}
                tone={d.lateHandling > 0 ? "warning" : "slate"}
                icon={<AlertTriangle className="size-4" aria-hidden />}
                href="/staf/timeline"
                linkLabel="Buka timeline"
              />
              <StatCard
                label="Tagihan Loque periode berjalan"
                value={<MoneyText value={d.loque.amount} />}
                tone="info"
                icon={<ReceiptText className="size-4" aria-hidden />}
                hint={`${d.loque.transactions} transaksi x ${formatRupiah(LOQUE_FEE_PER_TRANSACTION)}`}
                href="/owner/invoice"
                linkLabel="Buka invoice"
              />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <Summary title="Hari ini" c={d.today} cmp="dari kemarin" />
              <Summary title="Bulan ini" c={d.month} cmp="dari periode sebelumnya" />
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Pendapatan 30 hari terakhir</CardTitle>
                <span className="text-sm text-slate-600">
                  Tooltip menampilkan rincian metode bayar di toko
                </span>
              </CardHeader>
              <CardContent>
                <div
                  className="h-72 w-full"
                  role="img"
                  aria-label={`Grafik garis pendapatan 30 hari terakhir, total ${formatRupiah(d.series.reduce((a, p) => a + p.total, 0))}`}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={d.series} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" {...chartAxis.x} />
                      <YAxis {...chartAxis.y} />
                      <Tooltip content={<RevenueTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#047857"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Perlu perhatian</CardTitle>
              </CardHeader>
              <CardContent>
                {d.attention.voids.length + d.attention.refunds.length === 0 ? (
                  <EmptyState title="Tidak ada yang perlu ditangani." className="py-6" />
                ) : (
                  <ul className="divide-y text-sm">
                    {d.attention.voids.map((v) => (
                      <li key={v.id}>
                        <Link
                          to="/owner/void"
                          className="flex min-h-11 items-center justify-between gap-2 py-2 hover:bg-slate-50"
                        >
                          <span>
                            <span className="font-medium">Void {formatRupiah(v.amount)}</span> -{" "}
                            {v.customerName}, diajukan {v.requesterName}
                          </span>
                          <ArrowRight className="size-4 shrink-0" aria-hidden />
                        </Link>
                      </li>
                    ))}
                    {d.attention.refunds.map((r) => (
                      <li key={r.id}>
                        <Link
                          to="/staf/refund"
                          className="flex min-h-11 items-center justify-between gap-2 py-2 hover:bg-slate-50"
                        >
                          <span>
                            <span className="font-medium">Refund {formatRupiah(r.amount)}</span> -{" "}
                            {r.customerName}, menunggu {formatAge(r.createdAt)}
                          </span>
                          <ArrowRight className="size-4 shrink-0" aria-hidden />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </Async>
    </div>
  )
}

function Summary({ title, c, cmp }: { title: string; c: Compared; cmp: string }) {
  const items: {
    label: string
    key: keyof RangeStats
    money?: boolean
    invert?: boolean
  }[] = [
    { label: "Booking selesai", key: "completed" },
    { label: "Tidak hadir", key: "noShow", invert: true },
    { label: "Dibatalkan", key: "cancelled", invert: true },
    { label: "Void", key: "voids", invert: true },
    { label: "Pendapatan", key: "revenue", money: true },
  ]
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {items.map((it) => (
            <div
              key={it.key}
              className={it.key === "revenue" ? "col-span-2 sm:col-span-1" : undefined}
            >
              <dt className="text-xs text-slate-600">{it.label}</dt>
              <dd>
                <span className="block text-section font-semibold text-slate-900">
                  {it.money ? formatRupiah(c.current[it.key]) : c.current[it.key]}
                </span>
                <Delta
                  percent={percentChange(c.current[it.key], c.previous[it.key])}
                  label={cmp}
                  invert={it.invert}
                />
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}
