import { useQuery } from "@tanstack/react-query"
import { useLiveQuery, useMutate } from "@/shared/hooks"
import { billingService } from "../services"
import type { CompleteBillInput } from "../types"

export const useBills = () => useLiveQuery(["billing", "list"], () => billingService.listBills())
export const useBill = (bookingId: string) =>
  useQuery({
    queryKey: ["billing", "detail", bookingId],
    queryFn: () => billingService.getBill(bookingId),
  })
export const useVoids = () => useLiveQuery(["billing", "voids"], () => billingService.listVoids())
export const useVoidThreshold = () =>
  useQuery({
    queryKey: ["billing", "threshold"],
    queryFn: () => billingService.getVoidThreshold(),
  })

const KEYS = ["billing", "booking", "audit", "notifications", "reports", "invoicing", "payments"]
export const useCompleteBill = () =>
  useMutate((i: CompleteBillInput) => billingService.completeBill(i), {
    invalidate: KEYS,
    success: "Booking selesai. Tagihan dicatat.",
    toastError: false,
  })
export const useRequestVoid = () =>
  useMutate(
    (i: { billId: string; reason: string }) => billingService.requestVoid(i.billId, i.reason),
    { invalidate: KEYS, toastError: false },
  )
export const useSubmitVoidCode = () =>
  useMutate(
    (i: { voidId: string; code: string }) => billingService.submitVoidCode(i.voidId, i.code),
    { invalidate: KEYS, success: "Void disetujui.", toastError: false },
  )
export const useRejectVoid = () =>
  useMutate((i: { voidId: string; note: string }) => billingService.rejectVoid(i.voidId, i.note), {
    invalidate: KEYS,
    success: "Permintaan void ditolak.",
    toastError: false,
  })
export const useSetVoidThreshold = () =>
  useMutate((n: number) => billingService.setVoidThreshold(n), {
    invalidate: ["billing", "audit", "shops"],
    success: "Ambang tanda void disimpan.",
  })
export const useGetVoidCode = () =>
  useMutate((id: string) => billingService.getVoidCode(id), {
    invalidate: ["audit"],
    toastError: false,
  })
