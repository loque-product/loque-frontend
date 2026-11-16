import { useQuery } from "@tanstack/react-query"
import { useMutate } from "@/shared/hooks"
import { paymentsService } from "../services"
import type { FeeConfig } from "../types"

export const useRefunds = () =>
  useQuery({
    queryKey: ["payments", "refunds"],
    queryFn: () => paymentsService.listRefunds(),
  })
export const useFeeConfig = () =>
  useQuery({
    queryKey: ["payments", "fee"],
    queryFn: () => paymentsService.getFeeConfig(),
  })

export const useMarkRefundDone = () =>
  useMutate(
    (i: { id: string; reference: string }) => paymentsService.markRefundDone(i.id, i.reference),
    {
      invalidate: ["payments", "notifications", "reports"],
      success: "Refund ditandai selesai.",
      toastError: false,
    },
  )
export const useSaveFeeConfig = () =>
  useMutate((c: FeeConfig) => paymentsService.saveFeeConfig(c), {
    invalidate: ["payments", "shops", "audit"],
    success: "Booking fee disimpan. Berlaku untuk booking baru.",
  })
