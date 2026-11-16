import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { useMemo, useState } from "react"
import { Link } from "react-router"
import {
  Async,
  Badge,
  Banner,
  Button,
  DatePicker,
  EmptyState,
  Skeleton,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/shared/components"
import { addDaysYmd, hhmmToMinutes, toHhmm, todayYmd } from "@/shared/domain/time"
import { useIsDesktop, useNow } from "@/shared/hooks"
import { formatDayLong, formatTime } from "@/shared/utils/format"
import { useBarbers } from "@/features/barber-profile"
import {
  blockedRanges,
  occupiesSlot,
  openWindow,
  TimeblockSheet,
  useSchedule,
  type TimeblockPrefill,
} from "@/features/schedule"
import type { Timeblock } from "@/shared/types"
import { useDayBookings } from "../hooks"
import { BarberDayList } from "./BarberDayList"
import { BookingDrawer } from "./BookingDrawer"
import { TimelineGrid } from "./Timeline"
import { BookingSheet, type BookingPrefill, type BookingSheetMode } from "./BookingSheet"
import { SlotChoiceSheet } from "./SlotChoice"

const LEGEND: { cls: string; label: string }[] = [
  { cls: "bg-white shadow-card", label: "Tersedia" },
  { cls: "bg-info-50", label: "Terkonfirmasi" },
  { cls: "bg-primary-50", label: "Selesai" },
  {
    cls: "bg-warning-100",
    label: "Menunggu pembayaran",
  },
  { cls: "bg-danger-50", label: "Tidak hadir" },
  { cls: "hatch", label: "Blok atau tutup" },
]

export function TimelineView() {
  const [date, setDate] = useState(todayYmd())
  const [sheet, setSheet] = useState<{
    mode: BookingSheetMode
    prefill: BookingPrefill | null
  } | null>(null)
  const [tb, setTb] = useState<{ prefill?: TimeblockPrefill; timeblock?: Timeblock } | null>(null)
  const [choice, setChoice] = useState<BookingPrefill | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const [tab, setTab] = useState<string>("")
  const desktop = useIsDesktop()
  const now = useNow(30000)
  const day = useDayBookings(date)
  const barbers = useBarbers()
  const schedule = useSchedule()
  const active = useMemo(() => (barbers.data ?? []).filter((b) => b.active), [barbers.data])

  const summary = useMemo(() => {
    if (!day.data || !schedule.data) return null
    const booked = day.data.bookings.filter(occupiesSlot)
    let free = 0
    if (!day.data.closedReason) {
      for (const b of active) {
        const win = openWindow(schedule.data, date, b.id)
        if (!win) continue
        const blocks = blockedRanges(schedule.data, date, b.id)
        for (let m = win.from; m < win.to; m += 30) {
          if (date === todayYmd(now) && m < hhmmToMinutes(toHhmm(now))) continue
          const taken = booked.some(
            (x) =>
              x.barberId === b.id &&
              hhmmToMinutes(toHhmm(x.start)) <= m &&
              m < (hhmmToMinutes(toHhmm(x.end)) || 1440),
          )
          if (!taken && !blocks.some((r) => r.from <= m && m < r.to)) free++
        }
      }
    }
    return { count: booked.length, free }
  }, [day.data, schedule.data, active, date, now])

  const openBooking = (b: { id: string }) => setOpenId(b.id)
  const openWalkIn = (p: BookingPrefill) => {
    setChoice(null)
    setSheet({ mode: "walkin", prefill: p })
  }
  const openTimeblock = (p: BookingPrefill) => {
    setChoice(null)
    setTb({ prefill: p })
  }
  const editTimeblock = (id: string) => {
    const t = schedule.data?.timeblocks.find((x) => x.id === id)
    if (t) setTb({ timeblock: t })
  }
  const cancelled = day.data?.bookings.filter((b) => !occupiesSlot(b)) ?? []
  const currentTab = tab || active[0]?.id || ""

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <Button
            variant="secondary"
            size="icon"
            aria-label="Hari sebelumnya"
            onClick={() => setDate(addDaysYmd(date, -1))}
          >
            <ChevronLeft className="size-4" aria-hidden />
          </Button>
          <Button
            variant="secondary"
            onClick={() => setDate(todayYmd())}
            disabled={date === todayYmd()}
          >
            Hari ini
          </Button>
          <Button
            variant="secondary"
            size="icon"
            aria-label="Hari berikutnya"
            onClick={() => setDate(addDaysYmd(date, 1))}
          >
            <ChevronRight className="size-4" aria-hidden />
          </Button>
          <DatePicker value={date} onChange={setDate} aria-label="Pilih tanggal" />
          <Button
            onClick={() => setSheet({ mode: "booking", prefill: { barberId: "", date, time: "" } })}
          >
            <Plus className="size-4" aria-hidden />
            Tambah booking
          </Button>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-3 text-sm text-slate-600">
          {summary && (
            <span className="font-medium text-slate-900">
              {summary.count} booking, {summary.free} slot kosong
            </span>
          )}
          {day.dataUpdatedAt > 0 && (
            <span aria-live="polite">Diperbarui {formatTime(day.dataUpdatedAt)}</span>
          )}
        </div>
      </div>
      <p className="text-sm font-medium text-slate-700">{formatDayLong(date)}</p>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600" aria-label="Legenda">
        {LEGEND.map((l) => (
          <li key={l.label} className="flex items-center gap-1.5">
            <span className={`size-3 rounded-sm ${l.cls}`} aria-hidden />
            {l.label}
          </li>
        ))}
      </ul>
      {day.data?.closedReason && (
        <Banner tone="warning" title="Toko tutup pada tanggal ini">
          {day.data.closedReason}
        </Banner>
      )}

      <Async
        query={{
          data:
            day.data && schedule.data && barbers.data
              ? { day: day.data, ctx: schedule.data }
              : undefined,
          isLoading: day.isLoading || schedule.isLoading || barbers.isLoading,
          isError: day.isError || schedule.isError || barbers.isError,
          refetch: () => {
            void day.refetch()
            void schedule.refetch()
            void barbers.refetch()
          },
        }}
        skeleton={<Skeleton className="h-96" />}
      >
        {({ day: d, ctx }) => (
          <>
            {d.bookings.length === 0 && !d.closedReason && (
              <EmptyState
                title="Belum ada booking hari ini."
                description="Ketuk slot kosong untuk menambah booking walk-in atau timeblock."
                className="py-6"
              />
            )}
            {desktop ? (
              <TimelineGrid
                date={date}
                barbers={active}
                bookings={d.bookings}
                ctx={ctx}
                closedReason={d.closedReason}
                onOpenBooking={openBooking}
                onWalkIn={openWalkIn}
                onTimeblock={openTimeblock}
                onOpenTimeblock={editTimeblock}
              />
            ) : (
              <Tabs value={currentTab} onValueChange={setTab}>
                <TabsList>
                  {active.map((b) => (
                    <TabsTrigger key={b.id} value={b.id}>
                      {b.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {active.map((b) => (
                  <TabsContent key={b.id} value={b.id}>
                    <BarberDayList
                      date={date}
                      barber={b}
                      bookings={d.bookings}
                      ctx={ctx}
                      closedReason={d.closedReason}
                      onOpenBooking={openBooking}
                      onEmptySlot={setChoice}
                      onOpenTimeblock={editTimeblock}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            )}
            {cancelled.length > 0 && (
              <section aria-label="Dibatalkan">
                <h2 className="mb-2 text-sm font-semibold text-slate-700">
                  Dibatalkan dan kedaluwarsa ({cancelled.length})
                </h2>
                <ul className="flex flex-wrap gap-2">
                  {cancelled.map((b) => (
                    <li key={b.id}>
                      <Link
                        to={`/staf/booking/${b.id}`}
                        className="flex min-h-11 items-center gap-2 rounded-lg bg-white px-3 text-sm hover:bg-slate-50"
                      >
                        <span className="font-medium">{b.customerName}</span>
                        <span className="text-slate-600">{formatTime(b.start)}</span>
                        <Badge tone={b.status === "cancelled_shop" ? "danger" : "slate"}>
                          {b.status === "cancelled_shop"
                            ? "Dibatalkan toko"
                            : b.status === "cancelled_customer"
                              ? "Dibatalkan pelanggan"
                              : "Kedaluwarsa"}
                        </Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </Async>
      <BookingSheet
        open={sheet !== null}
        onOpenChange={(o) => !o && setSheet(null)}
        mode={sheet?.mode ?? "walkin"}
        prefill={sheet?.prefill}
        onSaved={(id) => setOpenId(id)}
      />
      <TimeblockSheet
        open={tb !== null}
        onOpenChange={(o) => !o && setTb(null)}
        prefill={tb?.prefill}
        timeblock={tb?.timeblock}
      />
      <SlotChoiceSheet
        open={choice !== null && !desktop}
        onOpenChange={(o) => !o && setChoice(null)}
        barberName={active.find((b) => b.id === choice?.barberId)?.name ?? ""}
        slot={choice ?? { barberId: "", date, time: "09:00" }}
        onWalkIn={() => choice && openWalkIn(choice)}
        onTimeblock={() => choice && openTimeblock(choice)}
      />
      <BookingDrawer bookingId={openId} onClose={() => setOpenId(null)} />
    </div>
  )
}
