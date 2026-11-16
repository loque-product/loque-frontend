import { Printer } from "lucide-react"
import { useMemo, useState } from "react"
import { Button, Dialog } from "@/shared/components"
import { useMutate } from "@/shared/hooks"
import { cn } from "@/shared/utils/cn"
import { buildReceipt, formatReceiptText } from "../domain/receipt"
import { receiptPrinter } from "../services"
import { usePaperWidth } from "../store/width"
import { PAPER_COLUMNS, type PaperWidth, type ReceiptSource } from "../types"

/** Dialog pratinjau struk bergaya kertas thermal. Pratinjau tidak ikut tercetak sebagai halaman web. */
export function ReceiptPreviewDialog({
  open,
  onOpenChange,
  source,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  source: ReceiptSource
}) {
  const { width, setWidth } = usePaperWidth()
  const receipt = useMemo(() => buildReceipt(source), [source, open])
  const lines = useMemo(() => formatReceiptText(receipt, width), [receipt, width])
  const print = useMutate(() => receiptPrinter.print(receipt, { width }), {
    invalidate: ["audit"],
    success: "Struk dikirim ke printer",
    onSuccess: () => onOpenChange(false),
  })
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Pratinjau struk"
      description="Pilih lebar kertas printer thermal Anda."
      className="receipt-preview-dialog"
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
          <Button onClick={() => print.mutate(undefined)} loading={print.isPending}>
            <Printer className="size-4" aria-hidden />
            Cetak
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div role="radiogroup" aria-label="Lebar kertas" className="grid grid-cols-2 gap-2">
          {([58, 80] as PaperWidth[]).map((w) => (
            <button
              key={w}
              type="button"
              role="radio"
              aria-checked={width === w}
              onClick={() => setWidth(w)}
              className={cn(
                "flex min-h-11 items-center justify-center rounded-lg text-sm font-medium",
                width === w
                  ? "bg-primary-100 text-primary-900"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200",
              )}
            >
              {w} mm
            </button>
          ))}
        </div>
        <div className="flex justify-center overflow-x-auto rounded-lg bg-slate-100 p-4">
          <pre
            aria-label="Pratinjau struk"
            className="receipt-preview bg-white p-3 font-mono text-xs leading-5 text-slate-900 shadow-card"
            style={{ width: `calc(${PAPER_COLUMNS[width]}ch + 1.5rem)` }}
          >
            {lines.join("\n")}
          </pre>
        </div>
        {receipt.status === "unpaid" && (
          <p className="text-xs text-slate-600">
            Tagihan belum lunas, struk diberi tulisan BELUM LUNAS.
          </p>
        )}
      </div>
    </Dialog>
  )
}

export function PrintReceiptButton({
  source,
  disabled,
  className,
  size,
}: {
  source: ReceiptSource | null
  disabled?: boolean
  className?: string
  size?: "default" | "sm"
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button
        variant="secondary"
        size={size}
        className={className}
        disabled={disabled || !source}
        onClick={() => setOpen(true)}
      >
        <Printer className="size-4" aria-hidden />
        Cetak struk
      </Button>
      {source && <ReceiptPreviewDialog open={open} onOpenChange={setOpen} source={source} />}
    </>
  )
}
