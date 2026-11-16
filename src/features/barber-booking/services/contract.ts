import type { YmdString } from "@/shared/types"
import type { BarberBookingDetail, BarberDay } from "../types"

export interface BarberBookingService {
  /** Booking Terkonfirmasi dan Selesai milik barber pada tanggal itu, beserta jam kerja dan blok. FORBIDDEN bila keanggotaan tidak aktif. */
  getDay(date: YmdString): Promise<BarberDay>
  /** Detail hanya baca. NOT_FOUND bila bukan milik barber; FORBIDDEN bila keanggotaan tidak aktif. */
  get(id: string): Promise<BarberBookingDetail>
}
