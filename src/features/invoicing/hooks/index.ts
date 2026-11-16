import { useQuery } from "@tanstack/react-query"
import { useMutate } from "@/shared/hooks"
import { invoiceService } from "../services"

export const useInvoices = (shopId?: string) =>
  useQuery({
    queryKey: ["invoicing", "list", shopId ?? "own"],
    queryFn: () => invoiceService.list(shopId),
  })

const KEYS = ["invoicing", "audit", "notifications"]
export const useClosePeriod = () =>
  useMutate((shopId: string) => invoiceService.closeCurrentPeriod(shopId), {
    invalidate: KEYS,
    success: (r) => `Periode ditutup. Invoice ${r.invoice.number} dibuat.`,
  })
export const useSetInvoicePaid = () =>
  useMutate(
    (i: { id: string; paid: boolean; note?: string }) =>
      invoiceService.setPaid(i.id, i.paid, i.note),
    {
      invalidate: KEYS,
      success: (_r, a) =>
        a.paid ? "Invoice ditandai Dibayar." : "Invoice ditandai Belum dibayar.",
    },
  )
export const useRecordInvoiceExport = () =>
  useMutate((i: { id: string; kind: "pdf" | "csv" }) => invoiceService.recordExport(i.id, i.kind), {
    invalidate: ["audit"],
    toastError: false,
  })
