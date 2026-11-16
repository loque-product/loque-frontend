import { RefreshCw } from "lucide-react"
import { useEffect, useRef, useState, type ReactNode } from "react"

const THRESHOLD_REM = 4
const MAX_REM = 6
const PX_PER_REM = 16

/**
 * Tarik untuk memuat ulang di layar sentuh. Hanya aktif saat halaman di posisi paling atas;
 * di layar lebar disediakan tombol "Muat ulang" terpisah.
 */
export function PullToRefresh({
  onRefresh,
  children,
}: {
  onRefresh: () => Promise<unknown>
  children: ReactNode
}) {
  const [pull, setPull] = useState(0)
  const [busy, setBusy] = useState(false)
  const start = useRef<number | null>(null)
  const latest = useRef(0)

  useEffect(() => {
    const down = (e: TouchEvent) => {
      start.current = window.scrollY <= 0 ? e.touches[0].clientY : null
    }
    const move = (e: TouchEvent) => {
      if (start.current === null) return
      const dy = (e.touches[0].clientY - start.current) / PX_PER_REM
      latest.current = dy > 0 ? Math.min(MAX_REM, dy * 0.5) : 0
      setPull(latest.current)
    }
    const up = () => {
      const reached = latest.current >= THRESHOLD_REM
      start.current = null
      latest.current = 0
      setPull(0)
      if (reached) {
        setBusy(true)
        void onRefresh().finally(() => setBusy(false))
      }
    }
    window.addEventListener("touchstart", down, { passive: true })
    window.addEventListener("touchmove", move, { passive: true })
    window.addEventListener("touchend", up)
    window.addEventListener("touchcancel", up)
    return () => {
      window.removeEventListener("touchstart", down)
      window.removeEventListener("touchmove", move)
      window.removeEventListener("touchend", up)
      window.removeEventListener("touchcancel", up)
    }
  }, [onRefresh])

  const shown = busy ? THRESHOLD_REM / 2 : pull
  return (
    <div>
      <div
        aria-live="polite"
        style={{ height: `${shown}rem` }}
        className="flex items-end justify-center overflow-hidden text-xs text-slate-600 transition-[height] duration-150 lg:hidden"
      >
        {(busy || pull > 0) && (
          <span className="flex min-h-8 items-center gap-1.5">
            <RefreshCw className={`size-3.5 ${busy ? "animate-spin" : ""}`} aria-hidden />
            {busy
              ? "Memuat"
              : pull >= THRESHOLD_REM
                ? "Lepas untuk memuat ulang"
                : "Tarik untuk memuat ulang"}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}
