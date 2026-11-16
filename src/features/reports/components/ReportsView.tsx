import type { ColumnDef } from "@tanstack/react-table"
import { Download, SlidersHorizontal } from "lucide-react"
import { useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  Async,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  DatePicker,
  Field,
  MoneyText,
  Select,
  Sheet,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components"
import { PAY_METHOD_LABEL } from "@/shared/constants"
import { addDaysYmd, todayYmd } from "@/shared/domain/time"
import { useIsDesktop } from "@/shared/hooks"
import type { PayMethod } from "@/shared/types"
import { formatDate, formatRupiah } from "@/shared/utils/format"
import { can, useRole } from "@/features/auth"
import { useReport } from "../hooks"
import type { BarberStat, CompositionSegment, Range, RevenuePoint } from "../types"
import { CompositionCard } from "./CompositionCard"
import { ExportDialog } from "./ExportDialog"
import { RevenueTooltip, chartAxis } from "./RevenueChart"

type Preset = "today" | "7" | "30" | "month" | "custom"
const PRESETS = [
  { value: "today", label: "Hari ini" },
  { value: "7", label: "7 hari" },
  { value: "30", label: "30 hari" },
  { value: "month", label: "Bulan ini" },
  { value: "custom", label: "Rentang kustom" },
]

export function ReportsView() {
  const today = todayYmd()
  const [preset, setPreset] = useState<Preset>("30")
  const [custom, setCustom] = useState<Range>({
    from: addDaysYmd(today, -6),
    to: today,
  })
  const [exporting, setExporting] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const desktop = useIsDesktop()
  const role = useRole()
  const range: Range = useMemo(() => {
    switch (preset) {
      case "today":
        return { from: today, to: today }
      case "7":
        return { from: addDaysYmd(today, -6), to: today }
      case "30":
        return { from: addDaysYmd(today, -29), to: today }
      case "month":
        return { from: `${today.slice(0, 7)}-01`, to: today }
      default:
        return custom
    }
  }, [preset, custom, today])
  const q = useReport(range)

  const controls = (
    <div className="flex flex-wrap items-end gap-3">
      <Field label="Periode" className="w-48">
        <Select value={preset} onValueChange={(v) => setPreset(v as Preset)} options={PRESETS} />
      </Field>
      {preset === "custom" && (
        <>
          <Field label="Dari">
            <DatePicker
              value={custom.from}
              onChange={(from) => setCustom({ from, to: custom.to < from ? from : custom.to })}
            />
          </Field>
          <Field label="Sampai">
            <DatePicker
              value={custom.to}
              min={custom.from}
              onChange={(to) => setCustom({ ...custom, to })}
            />
          </Field>
        </>
      )}
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        {desktop ? (
          controls
        ) : (
          <Button variant="secondary" onClick={() => setFilterOpen(true)}>
            <SlidersHorizontal className="size-4" aria-hidden />
            Filter
          </Button>
        )}
        {can(role, "owner.export") && (
          <Button variant="secondary" onClick={() => setExporting(true)}>
            <Download className="size-4" aria-hidden />
            Ekspor CSV
          </Button>
        )}
      </div>
      <p className="text-sm text-slate-600">
        {formatDate(range.from)} sampai {formatDate(range.to)}
      </p>
      <Sheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        title="Filter"
        footer={<Button onClick={() => setFilterOpen(false)}>Terapkan</Button>}
      >
        {controls}
      </Sheet>
      <Async query={q} skeleton={<Skeleton className="h-96" />}>
        {(r) => (
          <Tabs defaultValue="revenue">
            <TabsList>
              <TabsTrigger value="revenue">Pendapatan</TabsTrigger>
              <TabsTrigger value="barber">Booking per barber</TabsTrigger>
              <TabsTrigger value="source">Sumber booking</TabsTrigger>
            </TabsList>
            <TabsContent value="revenue">
              <Revenue
                composition={r.composition}
                series={r.series}
                total={r.total}
                byMethod={r.byMethod}
              />
            </TabsContent>
            <TabsContent value="barber">
              <PerBarber rows={r.perBarber} />
            </TabsContent>
            <TabsContent value="source">
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Sumber</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="flex flex-col gap-2 text-sm">
                      <Row l="Online" v={r.sources.online} />
                      <Row l="Walk-in" v={r.sources.walkin} />
                      <Row l="Tautan" v={r.sources.link} />
                    </dl>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Kanal tautan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="flex flex-col gap-2 text-sm">
                      <Row l="Instagram" v={r.sources.channels.instagram} />
                      <Row l="TikTok" v={r.sources.channels.tiktok} />
                      <Row l="WhatsApp" v={r.sources.channels.whatsapp} />
                    </dl>
                    <p className="mt-3 text-xs text-slate-600">
                      Hanya booking yang dibuat lewat tautan barber.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </Async>
      <ExportDialog open={exporting} onOpenChange={setExporting} range={range} />
    </div>
  )
}

const Row = ({ l, v }: { l: string; v: number }) => (
  <div className="flex justify-between">
    <dt>{l}</dt>
    <dd className="font-semibold">{v}</dd>
  </div>
)

function Revenue({
  composition,
  series,
  total,
  byMethod,
}: {
  composition: CompositionSegment[]
  series: RevenuePoint[]
  total: number
  byMethod: Record<PayMethod, number>
}) {
  const columns = useMemo<ColumnDef<RevenuePoint, unknown>[]>(
    () => [
      { header: "Tanggal", cell: ({ row }) => formatDate(row.original.date) },
      {
        header: "Total",
        cell: ({ row }) => <MoneyText value={row.original.total} />,
      },
      {
        header: "Tunai",
        cell: ({ row }) => <MoneyText value={row.original.cash} />,
      },
      {
        header: "QRIS toko",
        cell: ({ row }) => <MoneyText value={row.original.qris} />,
      },
      {
        header: "Transfer bank",
        cell: ({ row }) => <MoneyText value={row.original.transfer} />,
      },
      {
        header: "Lainnya",
        cell: ({ row }) => <MoneyText value={row.original.other} />,
      },
    ],
    [],
  )
  const rows = useMemo(() => [...series].reverse(), [series])
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Pendapatan per hari</CardTitle>
          <span className="font-semibold text-primary-800">{formatRupiah(total)}</span>
        </CardHeader>
        <CardContent>
          <div
            className="h-64 w-full"
            role="img"
            aria-label={`Grafik pendapatan per hari, total ${formatRupiah(total)}`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ left: 8, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" {...chartAxis.x} />
                <YAxis {...chartAxis.y} />
                <Tooltip content={<RevenueTooltip />} />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#047857"
                  strokeWidth={2}
                  dot={series.length <= 14}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <CompositionCard segments={composition} />
      <Card>
        <CardHeader>
          <CardTitle>Dibayar di toko per metode</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {(Object.keys(PAY_METHOD_LABEL) as PayMethod[]).map((m) => (
              <div key={m}>
                <dt className="text-xs text-slate-600">{PAY_METHOD_LABEL[m]}</dt>
                <dd className="text-section font-semibold">{formatRupiah(byMethod[m])}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
      <DataTable
        columns={columns}
        query={{
          data: rows,
          isLoading: false,
          isError: false,
          refetch: () => undefined,
        }}
        rowKey={(r) => r.date}
        pageSize={10}
        caption="Rincian per hari"
      />
    </div>
  )
}

function PerBarber({ rows }: { rows: BarberStat[] }) {
  const columns = useMemo<ColumnDef<BarberStat, unknown>[]>(
    () => [
      {
        header: "Barber",
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      { header: "Selesai", accessorKey: "completed" },
      { header: "Tidak hadir", accessorKey: "noShow" },
      { header: "Dibatalkan pelanggan", accessorKey: "cancelledCustomer" },
      { header: "Dibatalkan toko", accessorKey: "cancelledShop" },
    ],
    [],
  )
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent>
          <div className="h-64 w-full" role="img" aria-label="Grafik batang booking per barber">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} margin={{ left: 0, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#475569" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: "#475569" }}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" name="Selesai" fill="#047857" radius={[4, 4, 0, 0]} />
                <Bar dataKey="noShow" name="Tidak hadir" fill="#dc2626" radius={[4, 4, 0, 0]} />
                <Bar
                  dataKey="cancelledCustomer"
                  name="Dibatalkan pelanggan"
                  fill="#94a3b8"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="cancelledShop"
                  name="Dibatalkan toko"
                  fill="#7c3aed"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <DataTable
        columns={columns}
        query={{
          data: rows,
          isLoading: false,
          isError: false,
          refetch: () => undefined,
        }}
        rowKey={(r) => r.barberId}
      />
      <p className="text-xs text-slate-600">Jumlah booking per barber. Bukan perhitungan komisi.</p>
    </div>
  )
}
