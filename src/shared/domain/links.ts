import { toWaNumber } from "@/shared/lib/wa-link"

export type ShareChannel = "ig" | "tt" | "wa"
export const SHARE_CHANNELS: readonly ShareChannel[] = ["ig", "tt", "wa"]

export const isShareChannel = (v: string | null): v is ShareChannel =>
  v !== null && (SHARE_CHANNELS as readonly string[]).includes(v)

/** Tautan profil barber. Slug tetap walau nama diganti. */
export function buildBarberLink(origin: string, slug: string, ref?: ShareChannel): string {
  const base = `${origin.replace(/\/+$/, "")}/b/${encodeURIComponent(slug)}`
  return ref ? `${base}?ref=${ref}` : base
}

const calendarStamp = (d: Date) =>
  d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "")

export function buildGoogleCalendarLink(e: {
  title: string
  start: string
  end: string
  details?: string
  location?: string
}): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${calendarStamp(new Date(e.start))}/${calendarStamp(new Date(e.end))}`,
  })
  if (e.details) params.set("details", e.details)
  if (e.location) params.set("location", e.location)
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export { toWaNumber }
