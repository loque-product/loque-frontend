import type { ColumnDef } from "@tanstack/react-table"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  Badge,
  Banner,
  Button,
  DataTable,
  DateTimeText,
  ReasonDialog,
  Sheet,
} from "@/shared/components"
import type { PhoneDispute } from "@/shared/types"
import { formatDateTime } from "@/shared/utils/format"
import { useDecideDispute, useDisputes, useOpenDispute } from "../hooks"
import { EVIDENCE_LABEL, type DisputeDecision } from "../types"

const STATUS = {
  new: <Badge tone="warning">Baru</Badge>,
  reviewing: <Badge tone="info">Diperiksa</Badge>,
  decided: <Badge tone="primary">Diputuskan</Badge>,
}

export function DisputeList() {
  const q = useDisputes()
  const [selected, setSelected] = useState<string | null>(null)
  const open = useOpenDispute()
  const opened = useRef<string | null>(null)
  const columns = useMemo<ColumnDef<PhoneDispute, unknown>[]>(
    () => [
      {
        header: "Nomor",
        cell: ({ row }) => <span className="font-medium">{row.original.phone}</span>,
      },
      {
        header: "Pemilik saat ini",
        cell: ({ row }) => row.original.currentOwner,
      },
      { header: "Pelapor", cell: ({ row }) => row.original.reporter },
      { header: "Status", cell: ({ row }) => STATUS[row.original.status] },
      {
        header: "Tanggal",
        cell: ({ row }) => <DateTimeText value={row.original.createdAt} mode="date" />,
      },
      {
        header: "Bukti",
        cell: ({ row }) => EVIDENCE_LABEL[row.original.evidenceType],
      },
    ],
    [],
  )
  // Membuka detail mencatat entri audit "Super Admin membuka data pelanggan".
  useEffect(() => {
    if (selected && opened.current !== selected) {
      opened.current = selected
      open.mutate(selected)
    }
    if (!selected) opened.current = null
  }, [selected])
  const current = q.data?.find((d) => d.id === selected)
  return (
    <>
      <DataTable
        columns={columns}
        query={q}
        rowKey={(d) => d.id}
        onRowClick={(d) => setSelected(d.id)}
        searchText={(d) => `${d.phone} ${d.currentOwner} ${d.reporter}`}
        searchPlaceholder="Cari nomor atau nama"
        emptyTitle="Tidak ada sengketa nomor."
      />
      <Sheet
        open={Boolean(current)}
        onOpenChange={(o) => !o && setSelected(null)}
        title="Sengketa nomor"
        description={current?.phone}
      >
        {current && <Detail d={current} />}
      </Sheet>
    </>
  )
}

function Detail({ d }: { d: PhoneDispute }) {
  const decide = useDecideDispute()
  const [pending, setPending] = useState<DisputeDecision | null>(null)
  const [err, setErr] = useState<string | undefined>()
  return (
    <div className="flex flex-col gap-4">
      <Banner tone="info">
        Membuka detail ini dicatat di log audit sebagai akses data pelanggan oleh Super Admin.
      </Banner>
      <div>{STATUS[d.status]}</div>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-slate-600">Nomor</dt>
          <dd className="font-medium">{d.phone}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-600">Akun pemilik saat ini</dt>
          <dd className="font-medium">{d.currentOwner}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-600">Pelapor</dt>
          <dd className="font-medium">{d.reporter}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-600">Dilaporkan</dt>
          <dd className="font-medium">{formatDateTime(d.createdAt)} WIB</dd>
        </div>
      </dl>
      <section>
        <h3 className="mb-1 font-semibold">Bukti</h3>
        <Banner tone="info">
          Bukti yang diterima: kode booking, tangkapan layar percakapan dengan toko, atau konfirmasi
          tertulis dari toko.
        </Banner>
        <p className="mt-2 text-sm">
          <strong>{EVIDENCE_LABEL[d.evidenceType]}.</strong> {d.evidenceText}
        </p>
        {d.evidenceImage && (
          <img
            loading="lazy"
            decoding="async"
            src={d.evidenceImage}
            alt="Tangkapan layar bukti"
            className="mt-2 aspect-4/3 w-full rounded-lg object-cover"
          />
        )}
      </section>
      <section>
        <h3 className="mb-1 font-semibold">Riwayat nomor per akun</h3>
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-slate-600">
            <tr>
              <th className="py-1 font-medium">Waktu</th>
              <th className="py-1 font-medium">Dari</th>
              <th className="py-1 font-medium">Ke</th>
              <th className="py-1 font-medium">Oleh</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {d.history.map((h, i) => (
              <tr key={i}>
                <td className="py-2">{formatDateTime(h.at)}</td>
                <td className="py-2">{h.from}</td>
                <td className="py-2">{h.to}</td>
                <td className="py-2">{h.by}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {d.decision && (
        <Banner
          tone="success"
          title={d.decision === "reassigned" ? "Ditetapkan ulang ke pelapor" : "Ditolak"}
        >
          {d.decisionReason}
        </Banner>
      )}
      {d.status !== "decided" && (
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => {
              setErr(undefined)
              setPending("reassigned")
            }}
          >
            Tetapkan ulang ke pelapor
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setErr(undefined)
              setPending("rejected")
            }}
          >
            Tolak
          </Button>
        </div>
      )}
      <ReasonDialog
        open={pending !== null}
        onOpenChange={(o) => !o && setPending(null)}
        title={pending === "reassigned" ? "Tetapkan ulang nomor" : "Tolak laporan"}
        confirmLabel={pending === "reassigned" ? "Tetapkan ulang" : "Tolak laporan"}
        variant={pending === "reassigned" ? "warning" : "danger"}
        loading={decide.isPending}
        serverError={err}
        notice={
          pending === "reassigned" ? (
            <Banner tone="warning">
              Kunjungan walk-in dan ulasan yang terkait nomor ini ikut dipindahkan. Pemilik lama
              tidak diberi tahu.
            </Banner>
          ) : undefined
        }
        onSubmit={(reason) =>
          pending &&
          decide.mutate(
            { id: d.id, decision: pending, reason },
            {
              onSuccess: () => setPending(null),
              onError: (e) => setErr(e.message),
            },
          )
        }
      />
    </div>
  )
}
