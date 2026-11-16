import type { ColumnDef } from "@tanstack/react-table"
import { X } from "lucide-react"
import { useMemo, useState } from "react"
import { useNavigate } from "react-router"
import {
  Badge,
  Button,
  DataTable,
  DatePicker,
  MoneyText,
  StatusBadge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components"
import { toYmd, todayYmd } from "@/shared/domain/time"
import { formatDate, formatTime } from "@/shared/utils/format"
import { useBarbers } from "@/features/barber-profile"
import { useBills } from "../hooks"
import type { BillRow } from "../types"

export function BillList() {
  const q = useBills()
  const barbers = useBarbers()
  const nav = useNavigate()
  const [date, setDate] = useState<string | null>(null)
  const nameOf = (id: string) => barbers.data?.find((b) => b.id === id)?.name ?? "-"

  const columns = useMemo<ColumnDef<BillRow, unknown>[]>(
    () => [
      {
        header: "Jadwal",
        cell: ({ row }) =>
          `${formatDate(row.original.booking.start)}, ${formatTime(row.original.booking.start)}`,
      },
      {
        header: "Pelanggan",
        cell: ({ row }) => <span className="font-medium">{row.original.booking.customerName}</span>,
      },
      {
        header: "Barber",
        cell: ({ row }) => nameOf(row.original.booking.barberId),
      },
      {
        header: "Layanan",
        meta: { hideOnCard: true },
        cell: ({ row }) => row.original.booking.items.map((i) => i.name).join(" + "),
      },
      {
        header: "Total",
        cell: ({ row }) => (
          <MoneyText value={row.original.bill?.total ?? row.original.booking.serviceTotal} />
        ),
      },
      {
        header: "Status",
        cell: ({ row }) => (
          <span className="flex flex-wrap justify-end gap-1 md:justify-start">
            <StatusBadge status={row.original.booking.status} />
            {row.original.bill?.status === "voided" && <Badge tone="slate">Di-void</Badge>}
            {row.original.voidStatus === "pending" && (
              <Badge tone="warning">Menunggu persetujuan void</Badge>
            )}
          </span>
        ),
      },
    ],
    [barbers.data],
  )

  const filter = (rows: BillRow[]) =>
    date ? rows.filter((r) => toYmd(r.booking.start) === date) : rows
  const make = (status: "confirmed" | "completed") => ({
    ...q,
    data: q.data ? filter(q.data.filter((r) => r.booking.status === status)) : undefined,
  })
  const search = (r: BillRow) =>
    `${r.booking.customerName} ${r.booking.customerPhone ?? ""} ${nameOf(r.booking.barberId)}`

  const dateFilter = (
    <div className="flex items-center gap-1">
      <DatePicker value={date ?? todayYmd()} onChange={setDate} aria-label="Filter tanggal" />
      {date && (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Hapus filter tanggal"
          onClick={() => setDate(null)}
        >
          <X className="size-4" aria-hidden />
        </Button>
      )}
    </div>
  )
  const open = (r: BillRow) => nav(`/staf/tagihan/${r.booking.id}`)

  return (
    <Tabs defaultValue="due">
      <TabsList>
        <TabsTrigger value="due">Perlu ditagih</TabsTrigger>
        <TabsTrigger value="done">Selesai</TabsTrigger>
      </TabsList>
      <TabsContent value="due">
        <DataTable
          columns={columns}
          query={make("confirmed")}
          rowKey={(r) => r.booking.id}
          searchText={search}
          searchPlaceholder="Cari pelanggan atau barber"
          filters={dateFilter}
          onRowClick={open}
          emptyTitle="Tidak ada booking yang perlu ditagih."
          emptyDescription="Booking terkonfirmasi yang jamnya sudah lewat muncul di sini."
        />
      </TabsContent>
      <TabsContent value="done">
        <DataTable
          columns={columns}
          query={make("completed")}
          rowKey={(r) => r.booking.id}
          searchText={search}
          searchPlaceholder="Cari pelanggan atau barber"
          filters={dateFilter}
          onRowClick={open}
          emptyTitle="Belum ada tagihan selesai."
        />
      </TabsContent>
    </Tabs>
  )
}
