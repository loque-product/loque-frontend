import { Ban, CheckCircle2, UserX, Wallet } from "lucide-react"
import { Link } from "react-router"
import {
  Async,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  MoneyText,
  Skeleton,
  StatCard,
  StatusBadge,
} from "@/shared/components"
import { PAY_METHOD_LABEL } from "@/shared/constants"
import type { PayMethod } from "@/shared/types"
import { formatRupiah, formatTime } from "@/shared/utils/format"
import { useTodaySummary } from "../hooks"

export function TodaySummary() {
  const q = useTodaySummary()
  return (
    <Async
      query={q}
      skeleton={
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      }
    >
      {(s) => (
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Booking selesai"
              value={s.completed}
              icon={<CheckCircle2 className="size-4" aria-hidden />}
              tone="primary"
            />
            <StatCard
              label="Tidak hadir"
              value={s.noShow}
              icon={<UserX className="size-4" aria-hidden />}
              tone={s.noShow > 0 ? "danger" : "slate"}
            />
            <StatCard
              label="Void disetujui"
              value={s.voids}
              icon={<Ban className="size-4" aria-hidden />}
              tone="warning"
            />
            <StatCard
              label="Total pendapatan"
              value={<MoneyText value={s.revenue} />}
              icon={<Wallet className="size-4" aria-hidden />}
              tone="info"
              hint={`Termasuk kredit booking fee online ${formatRupiah(s.onlineCredit)}`}
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Dibayar di toko per metode</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="flex flex-col gap-2 text-sm">
                  {(Object.keys(PAY_METHOD_LABEL) as PayMethod[]).map((m) => (
                    <div key={m} className="flex justify-between">
                      <dt className={m === "cash" ? "font-medium" : undefined}>
                        {PAY_METHOD_LABEL[m]}
                        {m === "cash" ? " (tunai)" : ""}
                      </dt>
                      <dd>
                        <MoneyText value={s.byMethod[m]} />
                      </dd>
                    </div>
                  ))}
                  <div className="flex justify-between border-t pt-2 font-semibold">
                    <dt>Tunai dibanding lainnya</dt>
                    <dd>
                      <MoneyText value={s.byMethod.cash} /> /{" "}
                      <MoneyText value={s.byMethod.qris + s.byMethod.transfer + s.byMethod.other} />
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Daftar singkat hari ini</CardTitle>
              </CardHeader>
              <CardContent>
                {s.recent.length === 0 ? (
                  <EmptyState
                    title="Belum ada booking selesai atau tidak hadir."
                    className="py-6"
                  />
                ) : (
                  <ul className="divide-y text-sm">
                    {s.recent.map((b) => (
                      <li key={b.id}>
                        <Link
                          to={`/staf/booking/${b.id}`}
                          className="flex min-h-11 items-center justify-between gap-2 py-2 hover:bg-slate-50"
                        >
                          <span>
                            {formatTime(b.start)} - {b.customerName}
                          </span>
                          <StatusBadge status={b.status} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
          <p className="text-xs text-slate-600">
            Ringkasan hanya baca. Tanpa shift dan tanpa hitung kas.
          </p>
        </div>
      )}
    </Async>
  )
}
