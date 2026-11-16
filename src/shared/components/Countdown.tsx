import { useEffect, useRef } from "react"
import { useNow } from "@/shared/hooks"
import { formatCountdown } from "@/shared/utils/format"

/** Hitung mundur ke waktu tertentu (tabular-nums). `onElapsed` dipanggil sekali saat habis. */
export function Countdown({
  to,
  onElapsed,
  className,
}: {
  to: string
  onElapsed?: () => void
  className?: string
}) {
  const now = useNow(1000)
  const ms = Math.max(0, new Date(to).getTime() - now)
  const fired = useRef(false)
  useEffect(() => {
    if (ms === 0 && !fired.current) {
      fired.current = true
      onElapsed?.()
    }
    if (ms > 0) fired.current = false
  }, [ms, onElapsed])
  return (
    <time dateTime={`PT${Math.ceil(ms / 1000)}S`} className={`tabular-nums ${className ?? ""}`}>
      {formatCountdown(ms)}
    </time>
  )
}
