import { Plus } from "lucide-react"
import { useMemo, useState } from "react"
import { Link } from "react-router"
import { Badge, StatusBadge } from "@/shared/components"
import { hhmmToMinutes, toHhmm, toYmd, todayYmd } from "@/shared/domain/time"
import { useNow } from "@/shared/hooks"
import type { Barber, Booking, YmdString } from "@/shared/types"
import { cn } from "@/shared/utils/cn"
import { formatTime } from "@/shared/utils/format"
import { blockedRanges, occupiesSlot, openWindow, type ScheduleContext } from "@/features/schedule"
import type { BookingPrefill } from "./BookingSheet"
import { SlotPopover } from "./SlotChoice"

const START = 9 * 60
const END = 21 * 60
const ROW_REM = 3
const ROWS = (END - START) / 30

const cardTone: Record<Booking["status"], string> = {
  unpaid: "bg-warning-100 text-warning-800",
  confirmed: "bg-info-50 text-slate-900",
  completed: "bg-primary-50 text-slate-900",
  no_show: "bg-danger-50 text-slate-900",
  expired: "bg-slate-100",
  cancelled_customer: "bg-slate-100",
  cancelled_shop: "bg-danger-50",
}

export const rem = (n: number) => `${n}rem`
export const minutesOf = (iso: string) => hhmmToMinutes(toHhmm(iso)) || 24 * 60

export function BookingBlock({
  b,
  onOpen,
  compact,
}: {
  b: Booking
  onOpen: (b: Booking) => void
  compact?: boolean
}) {
  const customer = b.customerName
  return (
    <button
      type="button"
      onClick={() => onOpen(b)}
      aria-label={`Booking ${customer}, ${formatTime(b.start)} sampai ${formatTime(b.end)}, status ${b.status}`}
      className={cn(
        "flex h-full w-full flex-col gap-0.5 overflow-hidden rounded-lg p-2 text-left text-xs shadow-card hover:brightness-95",
        cardTone[b.status],
      )}
    >
      <span className="flex items-center justify-between gap-1">
        <span className="truncate text-sm font-semibold">{customer}</span>
        {b.source === "walkin" && (
          <Badge tone="slate" className="shrink-0">
            Walk-in
          </Badge>
        )}
      </span>
      <span className="truncate">{b.items.map((i) => i.name).join(" + ")}</span>
      <span className="text-slate-600">
        {formatTime(b.start)} - {formatTime(b.end)}
      </span>
      {!compact && (
        <span className="mt-auto">
          <StatusBadge status={b.status} />
        </span>
      )}
    </button>
  )
}

interface Props {
  date: YmdString
  barbers: Barber[]
  bookings: Booking[]
  ctx: ScheduleContext
  closedReason: string | null
  onOpenBooking: (b: Booking) => void
  onWalkIn: (p: BookingPrefill) => void
  onTimeblock: (p: BookingPrefill) => void
  onOpenTimeblock: (id: string) => void
}

/** Grid timeline: kolom per barber, baris per 30 menit, kolom jam dan kepala kolom menempel saat digulir. */
export function TimelineGrid({
  date,
  barbers,
  bookings,
  ctx,
  closedReason,
  onOpenBooking,
  onWalkIn,
  onTimeblock,
  onOpenTimeblock,
}: Props) {
  const [openSlot, setOpenSlot] = useState<string | null>(null)
  const now = useNow(30000)
  const isToday = date === todayYmd(now)
  const nowMin = hhmmToMinutes(toHhmm(now))
  const times = Array.from({ length: ROWS }, (_, i) => START + i * 30)
  const nowTop = ((nowMin - START) / 30) * ROW_REM

  const perBarber = useMemo(
    () =>
      barbers.map((b) => ({
        barber: b,
        win: openWindow(ctx, date, b.id),
        blocks: blockedRanges(ctx, date, b.id),
        bookings: bookings.filter(
          (x) => x.barberId === b.id && occupiesSlot(x) && toYmd(x.start) === date,
        ),
      })),
    [barbers, bookings, ctx, date],
  )

  return (
    <div className="timeline-scroll overflow-auto rounded-xl bg-white shadow-card">
      <div className="relative min-w-max">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `4.5rem repeat(${barbers.length}, minmax(12rem, 1fr))`,
          }}
        >
          <div className="sticky left-0 top-0 z-30 border-b border-r bg-slate-50" />
          {barbers.map((b) => (
            <div
              key={b.id}
              className="sticky top-0 z-20 flex h-12 items-center justify-center border-b border-r bg-slate-50 px-2 text-sm font-semibold text-slate-900 last:border-r-0"
            >
              {b.name}
            </div>
          ))}
          <div
            className="sticky left-0 z-20 border-r bg-slate-50"
            style={{ height: rem(ROWS * ROW_REM) }}
          >
            {times.map((t) => (
              <div
                key={t}
                className="flex items-start justify-end pr-2 text-xs text-slate-600"
                style={{ height: rem(ROW_REM) }}
              >
                <span className="-mt-2 bg-slate-50 px-0.5">
                  {t % 60 === 0 ? `${String(t / 60).padStart(2, "0")}.00` : ""}
                </span>
              </div>
            ))}
          </div>
          {perBarber.map(({ barber, win, blocks, bookings: bs }) => (
            <div
              key={barber.id}
              className="relative border-r last:border-r-0"
              style={{ height: rem(ROWS * ROW_REM) }}
            >
              {times.map((t) => {
                const covered =
                  bs.some((x) => minutesOf(x.start) <= t && t < minutesOf(x.end)) ||
                  blocks.some((r) => r.from <= t && t < r.to)
                const outside = !win || t < win.from || t >= win.to
                const hhmm = `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`
                return covered || outside || closedReason ? (
                  <div
                    key={t}
                    className="border-b border-dashed border-slate-100"
                    style={{ height: rem(ROW_REM) }}
                  />
                ) : (
                  <SlotPopover
                    key={t}
                    open={openSlot === `${barber.id}-${t}`}
                    onOpenChange={(o) => setOpenSlot(o ? `${barber.id}-${t}` : null)}
                    barberName={barber.name}
                    slot={{ barberId: barber.id, date, time: hhmm }}
                    onWalkIn={() => {
                      setOpenSlot(null)
                      onWalkIn({ barberId: barber.id, date, time: hhmm })
                    }}
                    onTimeblock={() => {
                      setOpenSlot(null)
                      onTimeblock({ barberId: barber.id, date, time: hhmm })
                    }}
                    trigger={
                      <button
                        type="button"
                        aria-label={`Slot kosong ${barber.name} pukul ${hhmm.replace(":", ".")}`}
                        className="group flex w-full items-center justify-center border-b border-dashed text-primary-700 hover:bg-primary-50"
                        style={{ height: rem(ROW_REM) }}
                      >
                        <Plus
                          className="size-4 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                          aria-hidden
                        />
                      </button>
                    }
                  />
                )
              })}
              {(closedReason || !win) && (
                <div className="hatch absolute inset-0 z-10 flex items-center justify-center p-2 text-center text-xs font-medium text-slate-600">
                  {closedReason ?? "Barber tidak bekerja"}
                </div>
              )}
              {win && !closedReason && (
                <>
                  {win.from > START && (
                    <div
                      className="hatch absolute inset-x-0 z-10 flex items-center justify-center text-xs text-slate-600"
                      style={{
                        top: 0,
                        height: rem(((win.from - START) / 30) * ROW_REM),
                      }}
                    >
                      Di luar jam kerja
                    </div>
                  )}
                  {win.to < END && (
                    <div
                      className="hatch absolute inset-x-0 z-10 flex items-center justify-center text-xs text-slate-600"
                      style={{
                        top: rem(((win.to - START) / 30) * ROW_REM),
                        height: rem(((END - win.to) / 30) * ROW_REM),
                      }}
                    >
                      Di luar jam kerja
                    </div>
                  )}
                </>
              )}
              {!closedReason &&
                blocks.map((r, i) => {
                  const from = Math.max(r.from, START)
                  const to = Math.min(r.to, END)
                  if (to <= from) return null
                  const style = {
                    top: rem(((from - START) / 30) * ROW_REM),
                    height: rem(((to - from) / 30) * ROW_REM),
                  }
                  const label = r.scope === "shop" ? `Toko: ${r.label}` : r.label
                  return r.timeblockId ? (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onOpenTimeblock(r.timeblockId as string)}
                      aria-label={`Timeblock ${label}, ketuk untuk ubah`}
                      className="hatch absolute inset-x-0 z-10 flex items-center justify-center p-1 text-center text-xs font-medium text-slate-700 hover:bg-slate-100"
                      style={style}
                    >
                      {label}
                    </button>
                  ) : (
                    <div
                      key={i}
                      className="hatch absolute inset-x-0 z-10 flex items-center justify-center p-1 text-center text-xs font-medium text-slate-700"
                      style={style}
                    >
                      {label}
                    </div>
                  )
                })}
              {bs.map((b) => (
                <div
                  key={b.id}
                  className="absolute inset-x-1 z-10 py-0.5"
                  style={{
                    top: rem(((minutesOf(b.start) - START) / 30) * ROW_REM),
                    height: rem(((minutesOf(b.end) - minutesOf(b.start)) / 30) * ROW_REM),
                  }}
                >
                  <BookingBlock b={b} onOpen={onOpenBooking} />
                </div>
              ))}
            </div>
          ))}
        </div>
        <NowLine
          visible={isToday && nowMin >= START && nowMin <= END}
          top={nowTop}
          label={formatTime(now)}
        />
      </div>
      {isToday && nowMin >= START && nowMin <= END && (
        <p className="sr-only">Sekarang pukul {formatTime(now)}</p>
      )}
    </div>
  )
}

/** Garis penanda waktu sekarang, diletakkan di atas area baris (setelah kepala kolom 3rem). */
function NowLine({ visible, top, label }: { visible: boolean; top: number; label: string }) {
  if (!visible) return null
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 z-20"
      style={{ top: rem(top + 3) }}
    >
      <div className="flex items-center">
        <span className="ml-1 rounded bg-danger-600 px-1 text-xs font-semibold text-white">
          {label}
        </span>
        <div className="h-px flex-1 bg-danger-600" />
      </div>
    </div>
  )
}

export function LinkToBooking({ id, children }: { id: string; children: string }) {
  return (
    <Link to={`/staf/booking/${id}`} className="font-medium underline">
      {children}
    </Link>
  )
}
