import { useQuery } from "@tanstack/react-query"
import { BARBER_POLL_MS } from "@/shared/constants"
import type { YmdString } from "@/shared/types"
import { barberBookingService } from "../services"

export const barberBookingKey = ["barber-booking"] as const

/** Hari ini diperbarui otomatis tiap 60 detik; data terakhir tetap terlihat saat galat. */
export const useBarberDay = (date: YmdString, enabled = true) =>
  useQuery({
    queryKey: [...barberBookingKey, "day", date],
    queryFn: () => barberBookingService.getDay(date),
    enabled,
    refetchInterval: BARBER_POLL_MS,
  })

export const useBarberBooking = (id: string) =>
  useQuery({
    queryKey: [...barberBookingKey, "detail", id],
    queryFn: () => barberBookingService.get(id),
    enabled: id !== "",
    retry: false,
  })
