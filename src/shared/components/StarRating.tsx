import { Star } from "lucide-react"
import { useRef } from "react"
import { cn } from "@/shared/utils/cn"

/** Tampilan bintang (baca saja). */
export function StarsView({ value, className }: { value: number; className?: string }) {
  const full = Math.round(value)
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={`${value.toFixed(1).replace(".", ",")} dari 5 bintang`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          aria-hidden
          className={cn("size-4", n <= full ? "fill-star text-star" : "text-slate-300")}
        />
      ))}
    </span>
  )
}

/** Input 1 sampai 5 bintang yang bisa dioperasikan keyboard (panah, Home, End). */
export function StarInput({
  value,
  onChange,
  label = "Penilaian",
}: {
  value: number
  onChange: (v: number) => void
  label?: string
}) {
  const group = useRef<HTMLDivElement>(null)
  const move = (to: number) => {
    const next = Math.min(5, Math.max(1, to))
    onChange(next)
    group.current?.querySelectorAll<HTMLButtonElement>("button")[next - 1]?.focus()
  }
  return (
    <div ref={group} role="radiogroup" aria-label={label} className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} bintang`}
          tabIndex={value === n || (value === 0 && n === 1) ? 0 : -1}
          onClick={() => onChange(n)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowUp")
              (e.preventDefault(), move((value || 0) + 1))
            else if (e.key === "ArrowLeft" || e.key === "ArrowDown")
              (e.preventDefault(), move((value || 2) - 1))
            else if (e.key === "Home") (e.preventDefault(), move(1))
            else if (e.key === "End") (e.preventDefault(), move(5))
          }}
          className="flex size-11 items-center justify-center rounded-lg hover:bg-slate-100"
        >
          <Star
            aria-hidden
            className={cn("size-7", n <= value ? "fill-star text-star" : "text-slate-300")}
          />
        </button>
      ))}
    </div>
  )
}
