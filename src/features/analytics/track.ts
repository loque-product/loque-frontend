import { isShareChannel, type ShareChannel } from "@/shared/domain/links"
import { analyticsService } from "./services"
import type { AnalyticsEvent, AnalyticsProps } from "./types"

const AID_KEY = "loque-aid"
const REF_KEY = "loque-ref"

function safe<T>(fn: () => T): T | undefined {
  try {
    return fn()
  } catch {
    return undefined
  }
}

/** ID pseudonim acak per peramban; bukan nama, email, atau nomor telepon. */
export function getAnonId(): string {
  const existing = safe(() => localStorage.getItem(AID_KEY))
  if (existing) return existing
  const id = crypto.randomUUID()
  safe(() => localStorage.setItem(AID_KEY, id))
  return id
}

/** Kanal tautan (`?ref=`) disimpan selama sesi dan dibawa ke booking. */
export function setRef(ref: ShareChannel | null): void {
  if (ref) safe(() => sessionStorage.setItem(REF_KEY, ref))
}
export function getRef(): ShareChannel | undefined {
  const v = safe(() => sessionStorage.getItem(REF_KEY)) ?? null
  return isShareChannel(v) ? v : undefined
}

export function track(
  event: AnalyticsEvent,
  props: Record<string, string | number | boolean | undefined> = {},
): void {
  const payload: AnalyticsProps = { ...props, aid: getAnonId(), ref: getRef() }
  void analyticsService.track(event, payload).catch(() => undefined)
}
