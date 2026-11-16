import type { DayHours, HhmmString, ScheduleBlock, ShopHours, YmdString } from "@/shared/types"

export interface BarberSchedule {
  /** Jam buka dan libur toko: hanya baca, mengalahkan jam kerja dan blok. */
  shopHours: ShopHours
  /** Tujuh hari, indeks 0 = Minggu. */
  workingHours: DayHours[]
  /** Blok milik barber ini saja. */
  blocks: ScheduleBlock[]
}

export type BlockKind = "partial" | "fullDay" | "range"

/** Bentuk yang dikirim ke server; jenis blok hanya ada di formulir. */
export interface SaveBlockInput {
  from: YmdString
  to: YmdString
  /** null berarti satu hari penuh. */
  startTime: HhmmString | null
  endTime: HhmmString | null
  weekly: boolean
  label: string
}

/** Isian formulir blok sebelum dinormalisasi. */
export interface BlockForm {
  kind: BlockKind
  date: YmdString
  endDate: YmdString
  startTime: HhmmString
  endTime: HhmmString
  weekly: boolean
  /** Batas pengulangan mingguan. */
  repeatUntil: YmdString
  reason: string
}
