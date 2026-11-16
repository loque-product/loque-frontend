import { Check } from "lucide-react"
import { cn } from "@/shared/utils/cn"

export interface StepItem {
  label: string
  done: boolean
  description?: string
}

/** Daftar langkah vertikal; horizontal pada layar lebar. */
export function Stepper({
  steps,
  currentIndex,
  onSelect,
}: {
  steps: StepItem[]
  currentIndex: number
  onSelect?: (i: number) => void
}) {
  return (
    <ol className="flex flex-col gap-1 lg:flex-row lg:gap-2">
      {steps.map((s, i) => {
        const current = i === currentIndex
        return (
          <li key={s.label} className="flex-1">
            <button
              type="button"
              onClick={() => onSelect?.(i)}
              aria-current={current ? "step" : undefined}
              className={cn(
                "flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-left",
                current ? "bg-primary-100" : "bg-slate-50 hover:bg-slate-100",
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  s.done
                    ? "bg-primary-700 text-white"
                    : current
                      ? "bg-primary-100 text-primary-800"
                      : "bg-slate-100 text-slate-600",
                )}
              >
                {s.done ? <Check className="size-4" aria-hidden /> : i + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-slate-900">{s.label}</span>
                {s.description && (
                  <span className="block truncate text-xs text-slate-600">{s.description}</span>
                )}
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
