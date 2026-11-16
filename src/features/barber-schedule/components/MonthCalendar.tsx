import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import { Button } from "@/shared/components"
import { todayYmd } from "@/shared/domain/time"
import type { DayHours, ScheduleBlock, ShopHours } from "@/shared/types"
import { cn } from "@/shared/utils/cn"
import {
  dayKind,
  monthGrid,
  monthLabel,
  monthStart,
  shiftMonth,
  type DayKind,
} from "../domain/blocks"

const HEAD = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]

const STYLE: Record<DayKind, string> = {
  "shop-closed": "bg-slate-200 text-slate-600",
  blocked: "hatch bg-slate-100 text-slate-700",
  off: "bg-slate-100 text-slate-500",
  working: "bg-white text-slate-900 shadow-card",
}
const LEGEND: { kind: DayKind; label: string }[] = [
  { kind: "working", label: "Hari kerja" },
  { kind: "blocked", label: "Ada blok" },
  { kind: "off", label: "Libur Anda" },
  { kind: "shop-closed", label: "Toko tutup" },
]

/** Kalender bulanan hanya baca: libur toko, blok, dan hari kerja. */
export function MonthCalendar({
  shop,
  hours,
  blocks,
}: {
  shop: ShopHours
  hours: DayHours[]
  blocks: ScheduleBlock[]
}) {
  const today = todayYmd()
  const [month, setMonth] = useState(monthStart(today))
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Bulan sebelumnya"
          onClick={() => setMonth(shiftMonth(month, -1))}
        >
          <ChevronLeft className="size-4" aria-hidden />
        </Button>
        <p className="text-base font-semibold text-slate-900" aria-live="polite">
          {monthLabel(month)}
        </p>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Bulan berikutnya"
          onClick={() => setMonth(shiftMonth(month, 1))}
        >
          <ChevronRight className="size-4" aria-hidden />
        </Button>
      </div>
      <table className="w-full table-fixed border-separate border-spacing-1 text-center text-sm">
        <thead>
          <tr>
            {HEAD.map((h) => (
              <th key={h} scope="col" className="pb-1 text-xs font-medium text-slate-600">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {monthGrid(month).map((week, i) => (
            <tr key={i}>
              {week.map((d, j) => {
                if (!d) return <td key={j} />
                const k = dayKind(d, shop, hours, blocks)
                return (
                  <td key={d} className="p-0">
                    <div
                      aria-label={`${Number(d.slice(8))} ${monthLabel(month)}: ${k.kind === "working" ? "Hari kerja" : (k.label ?? "")}`}
                      className={cn(
                        "flex h-11 items-center justify-center rounded-lg tabular-nums",
                        STYLE[k.kind],
                        d === today && "font-semibold text-primary-800",
                      )}
                    >
                      {Number(d.slice(8))}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-700">
        {LEGEND.map((l) => (
          <li key={l.kind} className="flex items-center gap-1.5">
            <span aria-hidden className={cn("size-3 rounded-sm", STYLE[l.kind])} />
            {l.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
