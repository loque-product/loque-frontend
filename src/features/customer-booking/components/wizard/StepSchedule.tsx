import { useMemo } from "react"
import { useLocation, useNavigate } from "react-router"
import { Banner, ErrorState, PageSkeleton, Skeleton } from "@/shared/components"
import { BOOKING_WINDOW_DAYS } from "@/shared/constants"
import { usePageMeta } from "@/shared/hooks"
import { dowOfYmd, toYmd } from "@/shared/domain/time"
import { cn } from "@/shared/utils/cn"
import { formatDayLong } from "@/shared/utils/format"
import { track } from "@/features/analytics"
import { useAvailability, useSlotList } from "../../hooks"
import { WizardFrame } from "./WizardFrame"
import { useCart } from "./useCart"

const DOW = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]

export default function StepSchedule() {
  usePageMeta("Pilih jadwal")
  const { w, ready } = useCart()
  const navigate = useNavigate()
  const notice = (useLocation().state as { notice?: string } | null)?.notice ?? null
  const from = useMemo(() => toYmd(Date.now()), [])
  const avail = useAvailability(
    w.barberId
      ? { barberId: w.barberId, serviceIds: w.serviceIds, from, days: BOOKING_WINDOW_DAYS }
      : null,
  )
  const slots = useSlotList(
    w.barberId && w.date ? { barberId: w.barberId, serviceIds: w.serviceIds, date: w.date } : null,
  )
  if (!ready) return <PageSkeleton />

  const days = avail.data ?? []
  const lead = days.length > 0 ? dowOfYmd(days[0].date) : 0
  const cells: ((typeof days)[number] | null)[] = [...Array<null>(lead).fill(null), ...days]
  const free = slots.data?.filter((s) => s.available) ?? []

  return (
    <WizardFrame
      step={4}
      title="Pilih jadwal"
      notice={notice}
      canNext={Boolean(w.date && w.time)}
      onNext={() => {
        track("slot_selected", { date: w.date ?? "", time: w.time ?? "" })
        navigate("/booking/ringkasan")
      }}
    >
      <section aria-labelledby="cal" className="flex flex-col gap-2">
        <h2 id="cal" className="text-sm font-semibold text-slate-900">
          Tanggal
        </h2>
        {avail.isLoading ? (
          <Skeleton className="h-56 w-full" />
        ) : avail.isError ? (
          <ErrorState onRetry={() => void avail.refetch()} />
        ) : (
          <div className="rounded-xl bg-white p-2 shadow-card">
            <div
              className="grid grid-cols-7 gap-1 pb-1 text-center text-xs text-slate-600"
              aria-hidden
            >
              {DOW.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((d, i) =>
                d === null ? (
                  <span key={`e${i}`} />
                ) : (
                  <button
                    key={d.date}
                    type="button"
                    disabled={d.slots === 0}
                    aria-pressed={w.date === d.date}
                    aria-label={`${formatDayLong(d.date)}, ${d.slots} jam tersedia`}
                    onClick={() => w.patch({ date: d.date, time: null })}
                    className={cn(
                      "flex min-h-14 flex-col items-center justify-center rounded-lg text-sm",
                      d.slots === 0 ? "text-slate-400" : "hover:bg-slate-100",
                      w.date === d.date && "bg-primary-700 text-white hover:bg-primary-700",
                    )}
                  >
                    <span className="font-medium tabular-nums">{Number(d.date.slice(8))}</span>
                    <span
                      className={cn(
                        "text-xs tabular-nums",
                        w.date === d.date ? "text-primary-50" : "text-slate-600",
                      )}
                    >
                      {d.slots > 0 ? d.slots : "-"}
                    </span>
                  </button>
                ),
              )}
            </div>
            <p className="px-1 pt-2 text-xs text-slate-600">
              Angka di bawah tanggal adalah jumlah jam tersedia.
            </p>
          </div>
        )}
      </section>

      {w.date && (
        <section aria-labelledby="slots" className="flex flex-col gap-2">
          <h2 id="slots" className="text-sm font-semibold text-slate-900">
            Jam, {formatDayLong(w.date)}
          </h2>
          {slots.isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : slots.isError ? (
            <ErrorState onRetry={() => void slots.refetch()} />
          ) : free.length === 0 ? (
            <Banner>Tidak ada jam tersedia pada hari ini. Coba tanggal lain.</Banner>
          ) : (
            <ul className="grid grid-cols-3 gap-2 md:grid-cols-4">
              {slots.data!.map((s) => (
                <li key={s.time}>
                  <button
                    type="button"
                    disabled={!s.available}
                    aria-pressed={w.time === s.time}
                    onClick={() => w.patch({ time: s.time })}
                    className={cn(
                      "flex min-h-14 w-full flex-col items-center justify-center rounded-lg text-sm tabular-nums",
                      s.available
                        ? "bg-slate-100 hover:bg-slate-200"
                        : "bg-slate-50 text-slate-500",
                      w.time === s.time && "bg-primary-700 text-white hover:bg-primary-700",
                    )}
                  >
                    {s.time.replace(":", ".")}
                    {!s.available && <span className="text-xs">Tidak tersedia</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </WizardFrame>
  )
}
