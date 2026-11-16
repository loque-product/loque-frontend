import type { ColumnDef } from "@tanstack/react-table"
import { MessageCircle } from "lucide-react"
import { useMemo, useState } from "react"
import {
  Badge,
  Banner,
  Button,
  DataTable,
  DateTimeText,
  Dialog,
  Field,
  Input,
  MoneyText,
  RefundBadge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components"
import { waLink } from "@/shared/lib/wa-link"
import type { Refund } from "@/shared/types"
import { formatAge, formatPhone, formatRupiah } from "@/shared/utils/format"
import { useMarkRefundDone, useRefunds } from "../hooks"

export function RefundList() {
  const q = useRefunds()
  const [target, setTarget] = useState<Refund | null>(null)
  const columns = useMemo<ColumnDef<Refund, unknown>[]>(
    () => [
      {
        header: "Pelanggan",
        cell: ({ row }) => (
          <span>
            <span className="font-medium">{row.original.customerName}</span>
            {row.original.customerPhone && (
              <span className="block text-xs text-slate-600">
                {formatPhone(row.original.customerPhone)}
              </span>
            )}
          </span>
        ),
      },
      {
        header: "Booking fee",
        cell: ({ row }) => <MoneyText value={row.original.amount} />,
      },
      {
        header: "Dibatalkan",
        cell: ({ row }) => <DateTimeText value={row.original.createdAt} />,
      },
      {
        header: "Usia permintaan",
        cell: ({ row }) => {
          if (row.original.status === "done") return row.original.reference ?? "-"
          const days = (Date.now() - new Date(row.original.createdAt).getTime()) / 86400000
          return (
            <span className="flex items-center gap-1">
              {formatAge(row.original.createdAt)}
              {days >= 2 && <Badge tone="warning">Hampir 3 hari</Badge>}
            </span>
          )
        },
      },
      {
        header: "Status",
        cell: ({ row }) => <RefundBadge status={row.original.status} />,
      },
      {
        header: "Aksi",
        meta: { hideOnCard: false },
        cell: ({ row }) =>
          row.original.status === "needed" ? (
            <span className="flex flex-wrap justify-end gap-2 md:justify-start">
              {row.original.customerPhone && (
                <Button asChild size="sm" variant="secondary">
                  <a
                    href={waLink(
                      row.original.customerPhone,
                      `Halo ${row.original.customerName}, booking Anda dibatalkan oleh toko. Mohon kirim tujuan transfer untuk pengembalian booking fee ${formatRupiah(row.original.amount)}.`,
                    )}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle className="size-4" aria-hidden />
                    Minta tujuan transfer
                  </a>
                </Button>
              )}
              <Button size="sm" onClick={() => setTarget(row.original)}>
                Tandai refund selesai
              </Button>
            </span>
          ) : null,
      },
    ],
    [],
  )
  const part = (status: Refund["status"]) => ({
    ...q,
    data: q.data?.filter((r) => r.status === status),
  })
  return (
    <div className="flex flex-col gap-4">
      <Banner tone="info">
        Kirim refund dalam 3 hari kerja. Hubungi pelanggan lewat WhatsApp untuk meminta tujuan
        transfer, lalu catat referensi transfernya.
      </Banner>
      <Tabs defaultValue="needed">
        <TabsList>
          <TabsTrigger value="needed">Perlu di-refund</TabsTrigger>
          <TabsTrigger value="done">Selesai</TabsTrigger>
        </TabsList>
        <TabsContent value="needed">
          <DataTable
            columns={columns}
            query={part("needed")}
            rowKey={(r) => r.id}
            emptyTitle="Tidak ada refund yang perlu diproses."
            emptyDescription="Booking yang dibatalkan toko akan muncul di sini."
          />
        </TabsContent>
        <TabsContent value="done">
          <DataTable
            columns={columns}
            query={part("done")}
            rowKey={(r) => r.id}
            emptyTitle="Belum ada refund selesai."
          />
        </TabsContent>
      </Tabs>
      <DoneDialog refund={target} onClose={() => setTarget(null)} />
    </div>
  )
}

function DoneDialog({ refund, onClose }: { refund: Refund | null; onClose: () => void }) {
  const [ref, setRef] = useState("")
  const [error, setError] = useState<string | undefined>()
  const m = useMarkRefundDone()
  const submit = () => {
    if (!refund) return
    if (!ref.trim()) return setError("Referensi transfer wajib diisi.")
    m.mutate(
      { id: refund.id, reference: ref },
      {
        onSuccess: () => {
          setRef("")
          setError(undefined)
          onClose()
        },
        onError: (e) => setError(e.fields?.reference ?? e.message),
      },
    )
  }
  return (
    <Dialog
      open={refund !== null}
      onOpenChange={(o) => {
        if (!o) {
          setRef("")
          setError(undefined)
          onClose()
        }
      }}
      title="Tandai refund selesai"
      description={
        refund
          ? `Booking fee ${formatRupiah(refund.amount)} untuk ${refund.customerName}.`
          : undefined
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Batalkan
          </Button>
          <Button onClick={submit} loading={m.isPending}>
            Tandai selesai
          </Button>
        </>
      }
    >
      <Field label="Referensi transfer" required error={error}>
        <Input
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          placeholder="Contoh: TRF-20261103-1234"
        />
      </Field>
    </Dialog>
  )
}
