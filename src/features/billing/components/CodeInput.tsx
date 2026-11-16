import { useRef } from "react"
import { cn } from "@/shared/utils/cn"

interface Props {
  value: string
  onChange: (v: string) => void
  length?: number
  invalid?: boolean
  disabled?: boolean
}

/** Enam kotak digit dengan perpindahan fokus otomatis dan dukungan tempel. */
export function CodeInput({ value, onChange, length = 6, invalid, disabled }: Props) {
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const digits = Array.from({ length }, (_, i) => value[i] ?? "")
  const set = (i: number, d: string) => {
    const next = digits.slice()
    next[i] = d
    onChange(next.join("").slice(0, length))
  }
  return (
    <div role="group" aria-label="Kode persetujuan 6 digit" className="flex justify-center gap-2">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          value={d}
          disabled={disabled}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          aria-label={`Digit ${i + 1}`}
          aria-invalid={invalid || undefined}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(-1)
            set(i, v)
            if (v && i < length - 1) refs.current[i + 1]?.focus()
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus()
          }}
          onPaste={(e) => {
            const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length)
            if (text) {
              e.preventDefault()
              onChange(text)
              refs.current[Math.min(text.length, length - 1)]?.focus()
            }
          }}
          className={cn(
            "h-14 w-11 rounded-lg bg-white text-center text-title font-semibold text-slate-900 sm:w-12",
            invalid && "border-danger-600",
          )}
        />
      ))}
    </div>
  )
}
