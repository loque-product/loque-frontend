import type { ColumnDef } from "@tanstack/react-table"
import { Copy, Eye, SlidersHorizontal } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import {
  Async,
  Badge,
  Banner,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  DatePicker,
  DateTimeText,
  Dialog,
  Field,
  Input,
  MoneyText,
  Select,
  Sheet,
  Skeleton,
  VoidStatusBadge,
} from "@/shared/components"
import { VOID_STATUS_LABEL } from "@/shared/constants"
import { toYmd } from "@/shared/domain/time"
import { useIsDesktop } from "@/shared/hooks"
import type { VoidRequestPublic, VoidStatus } from "@/shared/types"
import { formatDateTime, formatRupiah } from "@/shared/utils/format"
import { useCurrentUser } from "@/features/auth"
import { isAboveThreshold } from "../domain/void"
import { VoidSummaryCards } from "./VoidSummaryCards"
import {
  useBill,
  useGetVoidCode,
  useRejectVoid,
  useSetVoidThreshold,
  useVoidThreshold,
  useVoids,
} from "../hooks"

const ALL = "all"

export function VoidList() {
  const q = useVoids()
  const thr = useVoidThreshold()
  const desktop = useIsDesktop()
  const [cashier, setCashier] = useState(ALL)
  const [status, setStatus] = useState(ALL)
  const [date, setDate] = useState<string | null>(null)
  const [reason, setReason] = useState("")
  const [filterOpen, setFilterOpen] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const threshold = thr.data ?? 200000

  const cashiers = useMemo(
    () => [...new Map((q.data ?? []).map((v) => [v.requesterId, v.requesterName]))],
    [q.data],
  )
  const filtered = q.data?.filter(
    (v) =>
      (cashier === ALL || v.requesterId === cashier) &&
      (status === ALL || v.status === status) &&
      (!date || toYmd(v.createdAt) === date) &&
      (!reason || v.reason.toLowerCase().includes(reason.toLowerCase())),
  )

  const columns = useMemo<ColumnDef<VoidRequestPublic, unknown>[]>(
    () => [
      {
        header: "Diajukan",
        cell: ({ row }) => <DateTimeText value={row.original.createdAt} />,
      },
      {
        header: "Transaksi",
        cell: ({ row }) => (
          <span className="flex flex-col items-end gap-1 md:items-start">
            <span className="font-medium">
              {row.original.customerName} - <MoneyText value={row.original.amount} />
            </span>
            {isAboveThreshold(row.original.amount, threshold) && (
              <Badge tone="warning">Di atas {formatRupiah(threshold)}</Badge>
            )}
          </span>
        ),
      },
      { header: "Kasir", cell: ({ row }) => row.original.requesterName },
      {
        header: "Alasan",
        cell: ({ row }) => <span className="line-clamp-2">{row.original.reason}</span>,
      },
      {
        header: "Status",
        cell: ({ row }) => <VoidStatusBadge status={row.original.status} />,
      },
      {
        header: "Batas kode",
        cell: ({ row }) =>
          row.original.status === "pending" ? <DateTimeText value={row.original.expiresAt} /> : "-",
      },
    ],
    [threshold],
  )

  const filters = (
    <div className="flex flex-wrap items-end gap-3">
      <Field label="Kasir" className="w-44">
        <Select
          value={cashier}
          onValueChange={setCashier}
          options={[
            { value: ALL, label: "Semua kasir" },
            ...cashiers.map(([id, name]) => ({ value: id, label: name })),
          ]}
        />
      </Field>
      <Field label="Status" className="w-44">
        <Select
          value={status}
          onValueChange={setStatus}
          options={[
            { value: ALL, label: "Semua status" },
            ...(Object.keys(VOID_STATUS_LABEL) as VoidStatus[]).map((s) => ({
              value: s,
              label: VOID_STATUS_LABEL[s],
            })),
          ]}
        />
      </Field>
      <Field label="Alasan" className="w-44">
        <Input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Cari alasan"
        />
      </Field>
      <Field label="Tanggal" className="w-48">
        <div className="flex gap-1">
          <DatePicker value={date ?? toYmd(Date.now())} onChange={setDate} />
          {date && (
            <Button variant="ghost" onClick={() => setDate(null)}>
              Hapus
            </Button>
          )}
        </div>
      </Field>
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      <VoidSummaryCards
        data={q.data}
        threshold={threshold}
        pendingActive={status === "pending"}
        onTogglePending={() => setStatus(status === "pending" ? ALL : "pending")}
      />
      <ThresholdCard current={threshold} />
      {desktop ? (
        filters
      ) : (
        <div>
          <Button variant="secondary" onClick={() => setFilterOpen(true)}>
            <SlidersHorizontal className="size-4" aria-hidden />
            Filter
          </Button>
        </div>
      )}
      <Sheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        title="Filter"
        footer={<Button onClick={() => setFilterOpen(false)}>Terapkan</Button>}
      >
        {filters}
      </Sheet>
      <DataTable
        columns={columns}
        query={{ ...q, data: filtered }}
        rowKey={(v) => v.id}
        onRowClick={(v) => setSelected(v.id)}
        searchText={(v) => `${v.customerName} ${v.requesterName} ${v.reason}`}
        searchPlaceholder="Cari transaksi, kasir, atau alasan"
        emptyTitle="Belum ada permintaan void."
        emptyDescription="Permintaan yang diajukan kasir muncul di sini."
      />
      <VoidDrawer
        id={selected}
        list={q.data ?? []}
        threshold={threshold}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}

function ThresholdCard({ current }: { current: number }) {
  const [value, setValue] = useState<string | null>(null)
  const save = useSetVoidThreshold()
  const shown = value ?? String(current)
  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Ambang tanda void</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Field label="Nominal (Rp)" hint="Void di atas nominal ini diberi tanda khusus.">
          <Input
            inputMode="numeric"
            value={shown}
            onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
          />
        </Field>
        <div>
          <Button
            disabled={value === null || Number(value) === current || Number(value) <= 0}
            loading={save.isPending}
            onClick={() => save.mutate(Number(value), { onSuccess: () => setValue(null) })}
          >
            Simpan
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function VoidDrawer({
  id,
  list,
  threshold,
  onClose,
}: {
  id: string | null
  list: VoidRequestPublic[]
  threshold: number
  onClose: () => void
}) {
  const v = list.find((x) => x.id === id)
  return (
    <Sheet
      open={Boolean(v)}
      onOpenChange={(o) => !o && onClose()}
      title="Detail void"
      description={v ? `${v.customerName} - ${formatRupiah(v.amount)}` : undefined}
    >
      {v && <Detail v={v} threshold={threshold} />}
    </Sheet>
  )
}

function Detail({ v, threshold }: { v: VoidRequestPublic; threshold: number }) {
  const user = useCurrentUser()
  const bill = useBill(v.bookingId)
  const getCode = useGetVoidCode()
  const [code, setCode] = useState<{ token: string; expiresAt: string } | null>(null)
  const [rejecting, setRejecting] = useState(false)
  const own = user?.personId === v.requesterId
  const show = () =>
    getCode.mutate(v.id, {
      onSuccess: setCode,
      onError: (e) => toast.error(e.message),
    })
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <VoidStatusBadge status={v.status} />
        {isAboveThreshold(v.amount, threshold) && (
          <Badge tone="warning">Di atas {formatRupiah(threshold)}</Badge>
        )}
      </div>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-slate-600">Kasir pemohon</dt>
          <dd className="font-medium">{v.requesterName}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-600">Diajukan</dt>
          <dd className="font-medium">
            <DateTimeText value={v.createdAt} />
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs text-slate-600">Alasan</dt>
          <dd className="font-medium">{v.reason}</dd>
        </div>
        {v.note && (
          <div className="sm:col-span-2">
            <dt className="text-xs text-slate-600">Catatan owner</dt>
            <dd className="font-medium">{v.note}</dd>
          </div>
        )}
      </dl>
      <section>
        <h3 className="mb-1 font-semibold">Rincian tagihan</h3>
        <Async query={bill} skeleton={<Skeleton className="h-24" />}>
          {(b) => (
            <ul className="divide-y rounded-lg bg-slate-50 text-sm">
              {b.lines.map((l) => (
                <li key={l.id} className="flex justify-between px-3 py-2">
                  <span>
                    {l.name} x{l.qty}
                  </span>
                  <MoneyText value={l.price * l.qty} />
                </li>
              ))}
              <li className="flex justify-between bg-slate-50 px-3 py-2 font-semibold">
                <span>Total</span>
                <MoneyText value={b.bill?.total ?? v.amount} />
              </li>
            </ul>
          )}
        </Async>
      </section>
      <section>
        <h3 className="mb-1 font-semibold">Riwayat</h3>
        <ol className="flex flex-col gap-2 text-sm">
          <li>
            Diajukan oleh {v.requesterName}, {formatDateTime(v.createdAt)} WIB
          </li>
          {v.attempts > 0 && <li>{v.attempts} kali kode dimasukkan</li>}
          {v.decidedAt && (
            <li>
              {VOID_STATUS_LABEL[v.status]} pada {formatDateTime(v.decidedAt)} WIB
            </li>
          )}
          {v.status === "pending" && <li>Kode kedaluwarsa {formatDateTime(v.expiresAt)} WIB</li>}
        </ol>
      </section>
      {v.status === "pending" &&
        (own ? (
          <Banner tone="warning">Anda tidak dapat menyetujui permintaan Anda sendiri.</Banner>
        ) : (
          <section className="flex flex-col gap-3 rounded-lg bg-slate-50 p-4">
            {code ? (
              <>
                <p className="text-center text-xs text-slate-600">Kode persetujuan</p>
                <p
                  aria-label={`Kode ${code.token.split("").join(" ")}`}
                  className="text-center text-hero font-semibold tabular-nums text-slate-900"
                >
                  {code.token}
                </p>
                <div className="flex justify-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      void navigator.clipboard?.writeText(code.token).catch(() => undefined)
                      toast.success("Kode disalin.")
                    }}
                  >
                    <Copy className="size-4" aria-hidden />
                    Salin
                  </Button>
                </div>
                <p className="text-sm text-slate-600">
                  Berikan kode ini kepada kasir di luar aplikasi. Berlaku sampai{" "}
                  {formatDateTime(code.expiresAt)} WIB.
                </p>
              </>
            ) : (
              <Button variant="secondary" onClick={show} loading={getCode.isPending}>
                <Eye className="size-4" aria-hidden />
                Tampilkan kode
              </Button>
            )}
            <Button variant="danger" onClick={() => setRejecting(true)}>
              Tolak
            </Button>
          </section>
        ))}
      <RejectDialog id={v.id} open={rejecting} onOpenChange={setRejecting} />
    </div>
  )
}

function RejectDialog({
  id,
  open,
  onOpenChange,
}: {
  id: string
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const [note, setNote] = useState("")
  const [error, setError] = useState<string | undefined>()
  const m = useRejectVoid()
  const submit = () => {
    if (!note.trim()) return setError("Catatan wajib diisi.")
    setError(undefined)
    m.mutate(
      { voidId: id, note },
      {
        onSuccess: () => {
          onOpenChange(false)
          setNote("")
        },
        onError: (e) => setError(e.fields?.note ?? e.message),
      },
    )
  }
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Tolak void"
      description="Transaksi tetap selesai. Kasir melihat catatan Anda."
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Batalkan
          </Button>
          <Button variant="danger" onClick={submit} loading={m.isPending}>
            Tolak void
          </Button>
        </>
      }
    >
      <Field label="Catatan" required error={error}>
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Contoh: layanan sudah diterima"
        />
      </Field>
    </Dialog>
  )
}
