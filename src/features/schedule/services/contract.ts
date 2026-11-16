import type { Timeblock } from "@/shared/types"
import type { ScheduleData, TimeblockInput } from "../types"

export interface ScheduleService {
  getSchedule(): Promise<ScheduleData>
  /**
   * Menyimpan jadwal. Jika menimpa booking aktif, melempar ApiError CONFLICT dengan
   * `details: { bookings }` dan tidak menyimpan apa pun.
   */
  saveSchedule(next: ScheduleData, summary: string): Promise<void>

  /**
   * Menyimpan Timeblock (baru atau ubah). Jika ada booking aktif di rentangnya, melempar
   * ApiError CONFLICT dengan `details: { bookings }` dan tidak menyimpan apa pun.
   */
  saveTimeblock(input: TimeblockInput): Promise<Timeblock>
  deleteTimeblock(id: string): Promise<void>
}
