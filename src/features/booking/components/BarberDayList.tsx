import { Plus } from "lucide-react"
import { useMemo } from "react"
import { Button } from "@/shared/components"
import { toYmd } from "@/shared/domain/time"
import type { Barber, Booking, YmdString } from "@/shared/types"
import { blockedRanges, occupiesSlot, openWindow, type ScheduleContext } from "@/features/schedule"
import { BookingBlock, minutesOf } from "./Timeline"
import type { BookingPrefill } from "./BookingSheet"

type Row =
  | { kind: "booking"; b: Booking }
  | {
      kind: "block"
      label: string
      from: number
      to: number
      timeblockId?: string
    }
  | { kind: "free"; from: number; to: number }
  | { kind: "off"; label: string }

const t = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}.${String(m % 60).padStart(2, "0")}`
const hhmm = (m: number) => t(m).replace(".", ":")

/** Tampilan daftar untuk satu barber di layar kecil. */
export function BarberDayList({
  date,
  barber,
  bookings,
  ctx,
  closedReason,
  onOpenBooking,
  onEmptySlot,
  onOpenTimeblock,
}: {
  date: YmdString
  barber: Barber
  bookings: Booking[]
  ctx: ScheduleContext
  closedReason: string | null
  onOpenBooking: (b: Booking) => void
  onEmptySlot: (p: BookingPrefill) => void
  onOpenTimeblock: (id: string) => void
}) {
  const rows = useMemo<Row[]>(() => {
    if (closedReason) return [{ kind: "off", label: closedReason }]
    const win = openWindow(ctx, date, barber.id)
    if (!win) return [{ kind: "off", label: "Barber tidak bekerja pada hari ini" }]
    const blocks = blockedRanges(ctx, date, barber.id)
    const bs = bookings.filter(
      (x) => x.barberId === barber.id && occupiesSlot(x) && toYmd(x.start) === date,
    )
    const out: Row[] = []
    let free: { from: number; to: number } | null = null
    const flush = () => {
      if (free) {
        out.push({ kind: "free", ...free })
        free = null
      }
    }
    for (let m = win.from; m < win.to; m += 30) {
      const bk = bs.find((x) => minutesOf(x.start) <= m && m < minutesOf(x.end))
      const blk = blocks.find((r) => r.from <= m && m < r.to)
      if (bk) {
        flush()
        if (minutesOf(bk.start) === m || m === win.from) out.push({ kind: "booking", b: bk })
      } else if (blk) {
        flush()
        const last = out[out.length - 1]
        if (
          last?.kind === "block" &&
          last.label === blk.label &&
          last.timeblockId === blk.timeblockId
        )
          last.to = m + 30
        else
          out.push({
            kind: "block",
            label: blk.label,
            from: m,
            to: m + 30,
            timeblockId: blk.timeblockId,
          })
      } else if (free) free.to = m + 30
      else free = { from: m, to: m + 30 }
    }
    flush()
    return out
  }, [barber.id, bookings, closedReason, ctx, date])

  return (
    <ul className="flex flex-col gap-2">
      {rows.map((r, i) => (
        <li key={i}>
          {r.kind === "booking" && (
            <div className="h-28">
              <BookingBlock b={r.b} onOpen={onOpenBooking} />
            </div>
          )}
          {r.kind === "block" &&
            (r.timeblockId ? (
              <button
                type="button"
                onClick={() => onOpenTimeblock(r.timeblockId as string)}
                className="hatch flex min-h-11 w-full items-center justify-between gap-2 rounded-lg bg-slate-50 p-3 text-left text-sm text-slate-700"
              >
                <span>
                  {t(r.from)} - {t(r.to)} - {r.label}
                </span>
                <span className="text-xs text-primary-800">Ubah</span>
              </button>
            ) : (
              <div className="hatch rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                {t(r.from)} - {t(r.to)} - {r.label}
              </div>
            ))}
          {r.kind === "off" && (
            <div className="hatch rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{r.label}</div>
          )}
          {r.kind === "free" && (
            <div className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 p-3">
              <span className="text-sm text-slate-600">
                {t(r.from)} - {t(r.to)} kosong
              </span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  onEmptySlot({
                    barberId: barber.id,
                    date,
                    time: hhmm(r.from),
                  })
                }
              >
                <Plus className="size-4" aria-hidden />
                Tambah
              </Button>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
