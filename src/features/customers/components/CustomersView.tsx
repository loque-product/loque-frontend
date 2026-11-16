import type { ColumnDef } from "@tanstack/react-table"
import { Search } from "lucide-react"
import { useMemo, useState } from "react"
import { Link } from "react-router"
import { Async, DataTable, EmptyState, Input, Sheet, StatusBadge } from "@/shared/components"
import { useDebounce } from "@/shared/hooks"
import type { Customer } from "@/shared/types"
import { formatDate, formatPhone, formatTime, formatRupiah } from "@/shared/utils/format"
import { useCustomerHistory, useCustomerSearch } from "../hooks"

export function CustomersView() {
  const [q, setQ] = useState("")
  const [selected, setSelected] = useState<Customer | null>(null)
  const debounced = useDebounce(q, 300)
  const query = useCustomerSearch(debounced)
  const columns = useMemo<ColumnDef<Customer, unknown>[]>(
    () => [
      {
        header: "Nama",
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      { header: "Telepon", cell: ({ row }) => formatPhone(row.original.phone) },
    ],
    [],
  )
  return (
    <div className="flex flex-col gap-3">
      <div className="relative max-w-md">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500"
          aria-hidden
        />
        <Input
          aria-label="Cari pelanggan"
          placeholder="Cari nama atau telepon"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
        />
      </div>
      <DataTable
        columns={columns}
        query={query}
        rowKey={(c) => c.id}
        onRowClick={setSelected}
        emptyTitle="Pelanggan tidak ditemukan."
        emptyDescription="Hanya pelanggan yang pernah berkunjung ke toko ini yang tampil."
      />
      <Sheet
        open={selected !== null}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected?.name ?? ""}
        description={selected ? formatPhone(selected.phone) : undefined}
      >
        {selected && <History id={selected.id} />}
      </Sheet>
    </div>
  )
}

function History({ id }: { id: string }) {
  const q = useCustomerHistory(id)
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-slate-600">Riwayat kunjungan di toko ini saja.</p>
      <Async
        query={q}
        isEmpty={(d) => d.length === 0}
        empty={<EmptyState title="Belum ada kunjungan." />}
      >
        {(rows) => (
          <ul className="flex flex-col gap-2">
            {rows.map((b) => (
              <li key={b.id}>
                <Link
                  to={`/staf/booking/${b.id}`}
                  className="flex flex-col gap-1 rounded-lg bg-slate-50 p-3 hover:bg-slate-50"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-medium">
                      {formatDate(b.start)}, {formatTime(b.start)}
                    </span>
                    <StatusBadge status={b.status} />
                  </span>
                  <span className="text-sm text-slate-600">
                    {b.items.map((i) => i.name).join(" + ")} - {formatRupiah(b.serviceTotal)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Async>
    </div>
  )
}
