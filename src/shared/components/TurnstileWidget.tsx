import { useEffect, useRef } from "react"
import { env } from "@/shared/lib/env"
import { Banner } from "./feedback"

interface TurnstileApi {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string
      callback: (t: string) => void
      "expired-callback": () => void
      "error-callback": () => void
    },
  ) => string
  remove: (id: string) => void
}
declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

const SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
let loading: Promise<void> | null = null
function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve()
  loading ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script")
    s.src = SRC
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error("Turnstile gagal dimuat"))
    document.head.appendChild(s)
  })
  return loading
}

/** Verifikasi Cloudflare Turnstile. `onToken(null)` saat kedaluwarsa atau gagal. */
export function TurnstileWidget({ onToken }: { onToken: (token: string | null) => void }) {
  const box = useRef<HTMLDivElement>(null)
  const key = env.turnstileSiteKey
  useEffect(() => {
    if (!key || !box.current) return
    let id: string | null = null
    let cancelled = false
    void loadScript()
      .then(() => {
        if (cancelled || !box.current || !window.turnstile) return
        id = window.turnstile.render(box.current, {
          sitekey: key,
          callback: (t) => onToken(t),
          "expired-callback": () => onToken(null),
          "error-callback": () => onToken(null),
        })
      })
      .catch(() => onToken(null))
    return () => {
      cancelled = true
      if (id && window.turnstile) window.turnstile.remove(id)
    }
  }, [key, onToken])
  if (!key)
    return (
      <Banner tone="warning">Verifikasi belum dikonfigurasi. Hubungi toko untuk melapor.</Banner>
    )
  return <div ref={box} aria-label="Verifikasi bukan robot" />
}
