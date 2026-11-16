import { useState } from "react"
import { Async, Card, CardContent, MoneyText, Skeleton, Badge } from "@/shared/components"
import { cn } from "@/shared/utils/cn"
import { formatPeriod } from "@/shared/utils/format"
import { useInvoices } from "../hooks"
import { InvoiceDetail, InvoiceStatus } from "./InvoiceDetail"

export function OwnerInvoices() {
  const q = useInvoices()
  const [sel, setSel] = useState<string | null>(null)
  return (
    <Async query={q} skeleton={<Skeleton className="h-96" />}>
      {(views) => {
        const current = views.find((v) => v.invoice.id === sel) ?? views[0]
        return (
          <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
            <ul className="flex flex-col gap-2" aria-label="Daftar periode">
              {views.map((v) => (
                <li key={v.invoice.id}>
                  <button
                    type="button"
                    onClick={() => setSel(v.invoice.id)}
                    aria-pressed={v.invoice.id === current.invoice.id}
                    className={cn(
                      "flex min-h-11 w-full flex-col gap-1 rounded-xl bg-white p-3 text-left shadow-card hover:bg-slate-50",
                      v.invoice.id === current.invoice.id && "bg-primary-100",
                    )}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">
                        Periode {formatPeriod(v.invoice.periodStart, v.invoice.periodEnd)}
                      </span>
                    </span>
                    <span className="flex items-center justify-between gap-2">
                      <InvoiceStatus status={v.invoice.status} />
                      <span className="text-sm font-semibold">
                        <MoneyText value={v.invoice.total} />
                      </span>
                    </span>
                    {!v.isOpen && (
                      <span className="text-xs text-slate-600">{v.invoice.number}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
            <div>
              <InvoiceDetail view={current} />
              <Card className="mt-4">
                <CardContent className="text-sm text-slate-600">
                  Status Dibayar atau Belum dibayar hanya baca dan diubah oleh Super Admin setelah
                  transfer diterima. <Badge tone="slate">Hanya baca</Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      }}
    </Async>
  )
}
