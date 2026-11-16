import type { DayHours, ScheduleBlock } from "@/shared/types"
import type { BarberSchedule, SaveBlockInput } from "../types"

export interface BarberScheduleService {
  /** Jam toko, jam kerja, dan blok milik barber. FORBIDDEN bila keanggotaan tidak aktif. */
  getMine(): Promise<BarberSchedule>
  /** Tujuh hari, kelipatan 30 menit, di dalam jam buka toko. BLOCK_CONFLICT (details.affectedBookings) bila memotong booking. */
  saveWorkingHours(days: DayHours[]): Promise<void>
  /** BLOCK_CONFLICT (details.affectedBookings) bila menimpa booking. Server menolak blok yang seluruhnya jatuh pada libur toko dengan VALIDATION. */
  saveBlock(input: SaveBlockInput): Promise<ScheduleBlock>
  deleteBlock(id: string): Promise<void>
}
