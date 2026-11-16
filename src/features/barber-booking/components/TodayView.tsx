import { RefreshCw } from "lucide-react"
import { useMemo, useState } from "react"
import { Link } from "react-router"
import {
  Async,
  Button,
  EmptyState,
  PageSkeleton,
  PullToRefresh,
  StatusBadge,
} from "@/shared/components"
import { SOURCE_LABEL } from "@/shared/constants"
import { usePageMeta } from "@/shared/hooks"
import { todayYmd } from "@/shared/domain/time"
import type { YmdString } from "@/shared/types"
import { formatDayLong, formatDuration, formatTime } from "@/shared/utils/format"
import { NoMembership, useBarberMe } from "@/features/barber-account"
import { blockLabel, buildDayRows, itemsSummary, rowTime, type DayRow } from "../domain/dayRows"
import { useBarberDay } from "../hooks"
import type { BarberDay } from "../types"
import { DateStrip } from "./DateStrip"

const range = (r: DayRow) =>
  `${rowTime(r.from).replace(":", ".")} sampai ${rowTime(r.to).replace(":", ".")}`

function Row({ row }: { row: DayRow }) {
  if (row.kind === "booking") {
    const b = row.booking
    const minutes = row.to - row.from
    return (
      <li>
        <Link
          to={`/barber/booking/${b.id}`}
          className="flex min-h-14 items-start gap-3 px-1 py-3 hover:bg-slate-50"
        >
          <p className="w-12 shrink-0 text-sm font-semibold tabular-nums text-slate-900">
            {formatTime(b.start)}
            <span className="block text-xs font-normal text-slate-600">{formatTime(b.end)}</span>
          </p>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">{b.customerName}</p>
            <p className="truncate text-sm text-slate-700">{itemsSummary(b.items)}</p>
            <p className="text-xs text-slate-600">
              {formatDuration(minutes)}
              {b.source !== "online" && ` · ${SOURCE_LABEL[b.source]}`}
            </p>
          </div>
          <StatusBadge status={b.status} />
        </Link>
      </li>
    )
  }
  return (
    <li className="flex min-h-11 items-center gap-3 px-1 py-2 text-sm text-slate-500">
      <span className="w-12 shrink-0 tabular-nums">{rowTime(row.from).replace(":", ".")}</span>
      <span>{row.kind === "free" ? "Kosong" : blockLabel(row.label)}</span>
      <span className="ml-auto text-xs tabular-nums">{range(row)}</span>
    </li>
  )
}

function DayList({ day, isToday }: { day: BarberDay; isToday: boolean }) {
  const rows = useMemo(() => buildDayRows(day), [day])
  if (day.bookings.length === 0 && day.blocks.length === 0)
    return (
      <EmptyState
        title={
          day.closedReason ??
          (day.window === null
            ? "Anda libur pada hari ini."
            : isToday
              ? "Belum ada booking hari ini."
              : "Belum ada booking pada tanggal ini.")
        }
      />
    )
  return (
    <ul className="divide-y rounded-xl bg-white px-3 shadow-card">
      {rows.map((r) => (
        <Row key={r.key} row={r} />
      ))}
    </ul>
  )
}

export function TodayView() {
  usePageMeta("Hari ini")
  const me = useBarberMe()
  const [date, setDate] = useState<YmdString>(todayYmd())
  const active = me.data?.membership.active === true
  const q = useBarberDay(date, active)

  if (me.isLoading) return <PageSkeleton rows={4} />
  if (me.data && !active) return <NoMembership title="Hari ini" />

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-title font-semibold text-slate-900">Hari ini</h1>
          <p className="text-sm text-slate-600">{formatDayLong(date)}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Button
            variant="secondary"
            size="sm"
            className="hidden md:inline-flex"
            loading={q.isFetching}
            onClick={() => void q.refetch()}
          >
            <RefreshCw className="size-3.5" aria-hidden />
            Muat ulang
          </Button>
          {q.dataUpdatedAt > 0 && (
            <p className="text-xs tabular-nums text-slate-600">
              Diperbarui {formatTime(q.dataUpdatedAt)}
            </p>
          )}
        </div>
      </div>
      <DateStrip value={date} onChange={setDate} />
      <PullToRefresh onRefresh={() => q.refetch()}>
        <Async query={q} skeleton={<PageSkeleton rows={5} />}>
          {(day) => <DayList day={day} isToday={date === todayYmd()} />}
        </Async>
      </PullToRefresh>
    </div>
  )
}
