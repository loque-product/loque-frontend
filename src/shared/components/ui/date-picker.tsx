import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { Popover } from "radix-ui"
import { useState } from "react"
import { dowOfYmd, todayYmd } from "@/shared/domain/time"
import type { YmdString } from "@/shared/types"
import { cn } from "@/shared/utils/cn"
import { formatDate } from "@/shared/utils/format"
import { Button } from "./button"

const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
]
const DOW = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]
const pad = (n: number) => String(n).padStart(2, "0")

interface Props {
  value: YmdString
  onChange: (v: YmdString) => void
  id?: string
  min?: YmdString
  max?: YmdString
  className?: string
  "aria-label"?: string
}

export function DatePicker({ value, onChange, id, min, max, className, ...aria }: Props) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(() => value.slice(0, 7))
  const [y, m] = view.split("-").map(Number)
  const first = `${y}-${pad(m)}-01`
  const lead = dowOfYmd(first)
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate()
  const cells: (YmdString | null)[] = [
    ...Array(lead).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => `${y}-${pad(m)}-${pad(i + 1)}`),
  ]
  const shift = (n: number) => {
    const d = new Date(Date.UTC(y, m - 1 + n, 1))
    setView(`${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`)
  }
  const today = todayYmd()

  return (
    <Popover.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (o) setView(value.slice(0, 7))
      }}
    >
      <Popover.Trigger asChild>
        <Button
          id={id}
          variant="secondary"
          className={cn("justify-start font-normal", className)}
          {...aria}
        >
          <CalendarDays className="size-4 text-slate-500" aria-hidden />
          {formatDate(value)}
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          className="z-70 w-80 rounded-xl bg-white p-3 shadow-pop"
        >
          <div className="mb-2 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => shift(-1)}
              aria-label="Bulan sebelumnya"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </Button>
            <span className="text-sm font-semibold">
              {MONTHS[m - 1]} {y}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => shift(1)}
              aria-label="Bulan berikutnya"
            >
              <ChevronRight className="size-4" aria-hidden />
            </Button>
          </div>
          <div className="grid grid-cols-7 text-center text-xs text-slate-600">
            {DOW.map((d) => (
              <span key={d} className="py-1">
                {d}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((c, i) =>
              c === null ? (
                <span key={`e${i}`} />
              ) : (
                <button
                  key={c}
                  type="button"
                  disabled={(min !== undefined && c < min) || (max !== undefined && c > max)}
                  onClick={() => {
                    onChange(c)
                    setOpen(false)
                  }}
                  aria-label={formatDate(c)}
                  aria-pressed={c === value}
                  className={cn(
                    "flex size-10 items-center justify-center rounded-lg text-sm hover:bg-primary-50 disabled:text-slate-300 disabled:hover:bg-transparent",
                    c === today && "font-semibold text-primary-700",
                    c === value && "bg-primary-700 text-white hover:bg-primary-700",
                  )}
                >
                  {Number(c.slice(8))}
                </button>
              ),
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full"
            onClick={() => {
              onChange(today)
              setOpen(false)
            }}
          >
            Hari ini
          </Button>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
