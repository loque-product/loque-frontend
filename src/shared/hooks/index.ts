import { useEffect, useState } from "react"

export function useMediaQuery(query: string): boolean {
  const get = () => (typeof window === "undefined" ? false : window.matchMedia(query).matches)
  const [matches, setMatches] = useState(get)
  useEffect(() => {
    const m = window.matchMedia(query)
    const on = () => setMatches(m.matches)
    on()
    m.addEventListener("change", on)
    return () => m.removeEventListener("change", on)
  }, [query])
  return matches
}

/** Layar dengan lebar minimal md (48rem). */
export const useIsDesktop = () => useMediaQuery("(min-width: 48rem)")

export function useDebounce<T>(value: T, ms = 250): T {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}

/** Waktu sekarang yang diperbarui berkala. */
export function useNow(intervalMs = 30000): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(t)
  }, [intervalMs])
  return now
}

export function useCountdown(targetIso: string): string {
  const now = useNow(1000)
  const ms = Math.max(0, new Date(targetIso).getTime() - now)
  const s = Math.floor(ms / 1000)
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`
}

export { useMutate } from "./useMutate"
export { useLiveQuery } from "./useLiveQuery"
export { useOnlineStatus } from "./useOnlineStatus"
export { usePageMeta } from "./usePageMeta"
