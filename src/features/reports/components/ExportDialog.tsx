import { useState } from "react"
import { Banner, Button, Checkbox, Dialog, Field, Select } from "@/shared/components"
import { useMutate } from "@/shared/hooks"
import { buildCsv, downloadCsv } from "@/shared/lib/export"
import { formatDate } from "@/shared/utils/format"
import { reportService } from "../services"
import type { Range, ReportTab } from "../types"

const TABS: { value: ReportTab; label: string }[] = [
  { value: "revenue", label: "Pendapatan" },
  { value: "barber", label: "Booking per barber" },
  { value: "source", label: "Sumber booking" },
]

/** CSV dibuat di peramban dari data yang dikembalikan service. Ekspor dicatat di log audit. */
export function ExportDialog({
  open,
  onOpenChange,
  range,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  range: Range
}) {
  const [tab, setTab] = useState<ReportTab>("revenue")
  const [phone, setPhone] = useState(false)
  const run = useMutate(
    async () => {
      const table = await reportService.exportRows(tab, range, phone)
      const csv = buildCsv(
        table.columns.map((header, i) => ({
          header,
          value: (row: (string | number)[]) => row[i],
        })),
        table.rows,
      )
      downloadCsv(table.filename, csv)
      await reportService.recordExport(
        `${TABS.find((t) => t.value === tab)?.label} ${range.from} sampai ${range.to}`,
        phone,
      )
      return table.rows.length
    },
    {
      invalidate: ["audit"],
      success: (n) => `CSV diunduh (${n} baris).`,
      onSuccess: () => onOpenChange(false),
    },
  )
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Ekspor CSV"
      description={`Periode ${formatDate(range.from)} sampai ${formatDate(range.to)}.`}
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Batalkan
          </Button>
          <Button onClick={() => run.mutate(undefined)} loading={run.isPending}>
            Unduh CSV
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Data">
          <Select value={tab} onValueChange={(v) => setTab(v as ReportTab)} options={TABS} />
        </Field>
        <div>
          <Checkbox
            checked={phone}
            onCheckedChange={(c) => setPhone(c === true)}
            label="Sertakan nomor telepon pelanggan"
          />
          {phone && (
            <Banner tone="warning" className="mt-2">
              Nomor telepon adalah data pribadi. Gunakan hanya untuk keperluan toko.
            </Banner>
          )}
          {!phone && (
            <p className="text-xs text-slate-600">
              Nomor telepon adalah data pribadi dan tidak disertakan secara default.
            </p>
          )}
        </div>
        <p className="text-xs text-slate-600">Setiap ekspor dicatat di log audit.</p>
      </div>
    </Dialog>
  )
}
