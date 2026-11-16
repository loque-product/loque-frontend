import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { HOLD_POLL_MS } from "@/shared/constants"
import { useMutate } from "@/shared/hooks"
import type { Gender, Id } from "@/shared/types"
import { customerBookingService } from "../services"
import type { AvailabilityQuery, CreateCustomerBookingInput, SlotsQuery } from "../types"

export const cbKey = ["customer-booking"] as const
const INVALIDATE = ["customer-booking", "notifications"]

export const useCustomerCatalog = () =>
  useQuery({
    queryKey: [...cbKey, "catalog"],
    queryFn: () => customerBookingService.getCatalog(),
    staleTime: 60_000,
  })

export const useNextAvailable = (serviceIds: Id[], gender: Gender | null) =>
  useQuery({
    queryKey: [...cbKey, "next", serviceIds, gender],
    queryFn: () => customerBookingService.getNextAvailable(serviceIds, gender as Gender),
    enabled: serviceIds.length > 0 && gender !== null,
  })

export const useAvailability = (q: AvailabilityQuery | null) =>
  useQuery({
    queryKey: [...cbKey, "availability", q],
    queryFn: () => customerBookingService.getAvailability(q as AvailabilityQuery),
    enabled: q !== null,
    placeholderData: keepPreviousData,
  })

export const useSlotList = (q: SlotsQuery | null) =>
  useQuery({
    queryKey: [...cbKey, "slots", q],
    queryFn: () => customerBookingService.getSlots(q as SlotsQuery),
    enabled: q !== null,
  })

export const useHold = (enabled = true) =>
  useQuery({
    queryKey: [...cbKey, "hold"],
    queryFn: () => customerBookingService.getHold(),
    enabled,
    refetchInterval: 30_000,
  })

export const useMyBookings = (enabled = true) =>
  useQuery({ queryKey: [...cbKey, "list"], queryFn: () => customerBookingService.list(), enabled })

export const useBookingDetail = (id: string) =>
  useQuery({
    queryKey: [...cbKey, "detail", id],
    queryFn: () => customerBookingService.get(id),
    enabled: id !== "",
    retry: false,
  })

/** Memeriksa tiap 3 detik selama booking Unpaid atau pembayaran terlambat belum diputuskan toko. */
export const useBookingStatus = (id: string) =>
  useQuery({
    queryKey: [...cbKey, "status", id],
    queryFn: () => customerBookingService.get(id),
    enabled: id !== "",
    refetchInterval: (query) => {
      const b = query.state.data?.booking
      return b && (b.status === "unpaid" || b.latePayment) && b.status !== "confirmed"
        ? HOLD_POLL_MS
        : false
    },
    retry: false,
  })

export const useTransaction = (id: string) =>
  useQuery({
    queryKey: [...cbKey, "transaction", id],
    queryFn: () => customerBookingService.getTransaction(id),
    enabled: id !== "",
    retry: false,
  })

export const useCreateCustomerBooking = () =>
  useMutate((i: CreateCustomerBookingInput) => customerBookingService.create(i), {
    invalidate: INVALIDATE,
    toastError: false,
  })
export const useCancelHold = () =>
  useMutate((id: string) => customerBookingService.cancelHold(id), { invalidate: INVALIDATE })
export const useStartPayment = () =>
  useMutate((id: string) => customerBookingService.startPayment(id), { invalidate: INVALIDATE })
export const useCancelMyBooking = () =>
  useMutate((id: string) => customerBookingService.cancel(id), {
    invalidate: INVALIDATE,
    success: "Booking dibatalkan.",
  })
