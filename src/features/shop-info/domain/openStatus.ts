import { hhmmToMinutes, toYmd, wibParts } from "@/shared/domain/time"
import type { ShopHours } from "@/shared/types"

export interface OpenStatus {
  open: boolean
  /** "Buka hari ini 09.00 sampai 21.00" atau "Tutup hari ini". */
  label: string
}

const dot = (t: string) => t.replace(":", ".")

/** Status buka atau tutup hari ini menurut jam mingguan dan hari libur (WIB). */
export function openStatus(hours: ShopHours, now: number): OpenStatus {
  const today = toYmd(now)
  const holiday = hours.holidays.find((h) => today >= h.from && today <= h.to)
  if (holiday) return { open: false, label: `Tutup hari ini: ${holiday.label}` }
  const p = wibParts(now)
  const day = hours.days[p.dow]
  if (!day || !day.open) return { open: false, label: "Tutup hari ini" }
  const minutes = p.hh * 60 + p.mm
  const range = `${dot(day.from)} sampai ${dot(day.to)}`
  const open = minutes >= hhmmToMinutes(day.from) && minutes < hhmmToMinutes(day.to)
  return {
    open,
    label: open ? `Buka hari ini ${range}` : `Tutup sekarang. Jam buka hari ini ${range}`,
  }
}
