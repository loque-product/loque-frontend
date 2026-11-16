import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useLiveQuery, useMutate } from "@/shared/hooks"
import { bookingService } from "../services"
import type { SlotQuery, UpdateBookingInput, CreateBookingInput } from "../types"

export const useDayBookings = (date: string) =>
  useLiveQuery(["booking", "day", date], () => bookingService.listByDate(date))
export const useBooking = (id: string) =>
  useQuery({
    queryKey: ["booking", "detail", id],
    queryFn: () => bookingService.get(id),
    enabled: id !== "",
  })
export const useSlots = (q: SlotQuery | null) =>
  useQuery({
    queryKey: ["booking", "slots", q],
    queryFn: () => bookingService.getSlots(q as SlotQuery),
    enabled: q !== null,
    placeholderData: keepPreviousData,
  })

const KEYS = ["booking", "billing", "payments", "notifications", "audit", "customers", "reports"]
export const useCreateBooking = () =>
  useMutate((i: CreateBookingInput) => bookingService.createBooking(i), {
    invalidate: KEYS,
    success: (_r, a) => (a.mode === "walkin" ? "Walk-in dicatat." : "Booking dibuat."),
    toastError: false,
  })
export const useUpdateBooking = () =>
  useMutate((i: UpdateBookingInput) => bookingService.update(i), {
    invalidate: KEYS,
    success: "Perubahan booking disimpan.",
    toastError: false,
  })
export const useMarkNoShow = () =>
  useMutate(
    (i: { id: string; confirmed: boolean }) => bookingService.markNoShow(i.id, i.confirmed),
    {
      invalidate: KEYS,
      success: "Booking ditandai tidak hadir. Booking fee hangus.",
      toastError: false,
    },
  )
export const useUndoNoShow = () =>
  useMutate((id: string) => bookingService.undoNoShow(id), {
    invalidate: KEYS,
    success: "Penandaan tidak hadir dibatalkan.",
  })
export const useCancelByCustomer = () =>
  useMutate(
    (i: { id: string; reason?: string }) => bookingService.cancelByCustomer(i.id, i.reason),
    {
      invalidate: KEYS,
      success: "Booking dibatalkan atas permintaan pelanggan. Booking fee hangus.",
    },
  )
export const useCancelByShop = () =>
  useMutate((i: { id: string; reason: string }) => bookingService.cancelByShop(i.id, i.reason), {
    invalidate: KEYS,
    success: "Booking dibatalkan oleh toko. Masuk daftar Perlu di-refund.",
    toastError: false,
  })
export const useConfirmLate = () =>
  useMutate((id: string) => bookingService.confirmLate(id), {
    invalidate: KEYS,
    success: "Booking dikonfirmasi.",
  })
