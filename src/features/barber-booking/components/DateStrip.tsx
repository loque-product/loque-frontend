import { addDaysYmd, dowOfYmd, todayYmd } from "@/shared/domain/time"
import type { YmdString } from "@/shared/types"
import { cn } from "@/shared/utils/cn"

const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]
export const STRIP_DAYS = 7

/** Strip tanggal 7 hari yang bisa digeser horizontal. */
export function DateStrip({
  value,
  onChange,
  from = todayYmd(),
}: {
  value: YmdString
  onChange: (d: YmdString) => void
  from?: YmdString
}) {
  const days = Array.from({ length: STRIP_DAYS }, (_, i) => addDaysYmd(from, i))
  return (
    <ul aria-label="Pilih tanggal" className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1">
      {days.map((d) => {
        const active = d === value
        return (
          <li key={d} className="shrink-0">
            <button
              type="button"
              aria-pressed={active}
              aria-current={d === from ? "date" : undefined}
              aria-label={`${DAYS[dowOfYmd(d)]}, tanggal ${Number(d.slice(8))}${d === from ? ", hari ini" : ""}`}
              onClick={() => onChange(d)}
              className={cn(
                "flex min-h-14 w-14 flex-col items-center justify-center rounded-lg text-xs",
                active
                  ? "bg-primary-700 text-white"
                  : "bg-white text-slate-700 shadow-card hover:bg-slate-100",
              )}
            >
              <span className={active ? "text-primary-100" : "text-slate-600"}>
                {DAYS[dowOfYmd(d)]}
              </span>
              <span className="text-base font-semibold tabular-nums">{Number(d.slice(8))}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
