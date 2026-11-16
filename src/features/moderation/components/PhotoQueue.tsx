import type { ColumnDef } from "@tanstack/react-table"
import { SlidersHorizontal } from "lucide-react"
import { useMemo, useState } from "react"
import {
  Badge,
  Banner,
  Button,
  DataTable,
  DateTimeText,
  Field,
  Select,
  Sheet,
  SlaBadge,
  ReasonDialog,
} from "@/shared/components"
import { useIsDesktop, useNow } from "@/shared/hooks"
import type { PhotoReport } from "@/shared/types"
import { formatDateTime } from "@/shared/utils/format"
import { formatRemaining, photoSla } from "../domain/sla"
import { useDecidePhoto, usePhotoReports } from "../hooks"
import { PHOTO_DECISION_LABEL, PHOTO_REASON_LABEL, type PhotoDecision } from "../types"

const ALL = "all"

export function PhotoQueue() {
  const q = usePhotoReports()
  const now = useNow(60000)
  const desktop = useIsDesktop()
  const [status, setStatus] = useState(ALL)
  const [reason, setReason] = useState(ALL)
  const [level, setLevel] = useState(ALL)
  const [filterOpen, setFilterOpen] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)

  const rows = q.data
    ?.filter(
      (r) =>
        (status === ALL || (status === "pending" ? !r.decision : Boolean(r.decision))) &&
        (reason === ALL || r.reason === reason) &&
        (level === ALL || photoSla(r, now).level === level),
    )
    .sort(
      (a, b) =>
        Number(Boolean(a.decision)) - Number(Boolean(b.decision)) ||
        Number(b.hidden) - Number(a.hidden) ||
        photoSla(a, now).remainingMs - photoSla(b, now).remainingMs,
    )

  const columns = useMemo<ColumnDef<PhotoReport, unknown>[]>(
    () => [
      {
        header: "Foto",
        meta: { hideOnCard: false },
        cell: ({ row }) => (
          <img
            loading="lazy"
            decoding="async"
            src={row.original.imageUrl}
            alt={`Foto portofolio ${row.original.barberName}`}
            className="aspect-4/3 w-20 rounded-lg object-cover"
          />
        ),
      },
      {
        header: "Barber",
        cell: ({ row }) => <span className="font-medium">{row.original.barberName}</span>,
      },
      {
        header: "Alasan",
        cell: ({ row }) => (
          <span className="flex flex-wrap justify-end gap-1 md:justify-start">
            {PHOTO_REASON_LABEL[row.original.reason]}
            {row.original.hidden && !row.original.decision && (
              <Badge tone="warning">Disembunyikan</Badge>
            )}
          </span>
        ),
      },
      {
        header: "Dilaporkan",
        cell: ({ row }) => <DateTimeText value={row.original.reportedAt} />,
      },
      {
        header: "Sisa waktu",
        cell: ({ row }) => {
          if (row.original.decision)
            return <Badge tone="primary">{PHOTO_DECISION_LABEL[row.original.decision]}</Badge>
          const s = photoSla(row.original, now)
          return (
            <span className="flex flex-col items-end gap-1 md:items-start">
              <span className="text-xs text-slate-600">
                {formatRemaining(s.remainingMs)} ({row.original.hidden ? "48 jam" : "7 hari"})
              </span>
              <SlaBadge level={s.level} />
            </span>
          )
        },
      },
    ],
    [now],
  )

  const filters = (
    <div className="flex flex-wrap items-end gap-3">
      <Field label="Status" className="w-44">
        <Select
          value={status}
          onValueChange={setStatus}
          options={[
            { value: ALL, label: "Semua status" },
            { value: "pending", label: "Menunggu keputusan" },
            { value: "decided", label: "Sudah diputuskan" },
          ]}
        />
      </Field>
      <Field label="Alasan" className="w-52">
        <Select
          value={reason}
          onValueChange={setReason}
          options={[
            { value: ALL, label: "Semua alasan" },
            ...Object.entries(PHOTO_REASON_LABEL).map(([value, label]) => ({
              value,
              label,
            })),
          ]}
        />
      </Field>
      <Field label="Batas waktu" className="w-48">
        <Select
          value={level}
          onValueChange={setLevel}
          options={[
            { value: ALL, label: "Semua" },
            { value: "ok", label: "Dalam batas" },
            { value: "near", label: "Mendekati batas" },
            { value: "over", label: "Melewati batas" },
          ]}
        />
      </Field>
    </div>
  )
  const current = q.data?.find((r) => r.id === selected)

  return (
    <div className="flex flex-col gap-4">
      <Banner tone="info">
        Foto yang sudah disembunyikan otomatis (Saya ada di foto ini, Anak saya) diputuskan dalam 48
        jam. Laporan lain memiliki batas 7 hari.
      </Banner>
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
        query={{ ...q, data: rows }}
        rowKey={(r) => r.id}
        onRowClick={(r) => setSelected(r.id)}
        searchText={(r) => r.barberName}
        searchPlaceholder="Cari barber"
        emptyTitle="Tidak ada laporan foto."
      />
      <Sheet
        open={Boolean(current)}
        onOpenChange={(o) => !o && setSelected(null)}
        title="Laporan foto"
        description={current ? `Barber ${current.barberName}` : undefined}
      >
        {current && <Detail r={current} now={now} />}
      </Sheet>
    </div>
  )
}

function Detail({ r, now }: { r: PhotoReport; now: number }) {
  const decide = useDecidePhoto()
  const [pending, setPending] = useState<PhotoDecision | null>(null)
  const [err, setErr] = useState<string | undefined>()
  const s = photoSla(r, now)
  const options: {
    d: PhotoDecision
    label: string
    variant: "danger" | "primary" | "secondary"
  }[] = [
    { d: "deleted", label: "Hapus foto", variant: "danger" },
    { d: "restored", label: "Pulihkan foto", variant: "primary" },
    { d: "kept_hidden", label: "Tetap disembunyikan", variant: "secondary" },
  ]
  return (
    <div className="flex flex-col gap-4">
      <img
        loading="lazy"
        decoding="async"
        src={r.imageUrl}
        alt={`Foto portofolio ${r.barberName}`}
        className="aspect-4/3 w-full rounded-xl object-cover"
      />
      <div className="flex flex-wrap items-center gap-2">
        {r.decision ? (
          <Badge tone="primary">{PHOTO_DECISION_LABEL[r.decision]}</Badge>
        ) : (
          <SlaBadge level={s.level} />
        )}
        {r.hidden && <Badge tone="warning">Disembunyikan</Badge>}
      </div>
      <dl className="grid gap-3 text-sm">
        <div>
          <dt className="text-xs text-slate-600">Keterangan barber</dt>
          <dd className="font-medium">{r.caption}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-600">Alasan laporan</dt>
          <dd className="font-medium">{PHOTO_REASON_LABEL[r.reason]}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-600">Catatan pelapor</dt>
          <dd className="font-medium">{r.reporterNote}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-600">Kontak pelapor</dt>
          <dd className="font-medium">{r.reporterContact ?? "Tidak dicantumkan"}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-600">Persetujuan saat unggah</dt>
          <dd className="font-medium">{r.consent}</dd>
        </div>
      </dl>
      <section>
        <h3 className="mb-1 font-semibold">Riwayat</h3>
        <ol className="flex flex-col gap-1 text-sm">
          <li>Dilaporkan {formatDateTime(r.reportedAt)} WIB</li>
          {r.hidden && !r.decision && (
            <li>Foto disembunyikan otomatis, {formatRemaining(s.remainingMs).toLowerCase()}</li>
          )}
          {r.decidedAt && (
            <li>
              {PHOTO_DECISION_LABEL[r.decision as PhotoDecision]} pada {formatDateTime(r.decidedAt)}{" "}
              WIB. Alasan: {r.decisionReason}
            </li>
          )}
        </ol>
      </section>
      {!r.decision && (
        <div className="flex flex-col gap-2">
          {options.map((o) => (
            <Button
              key={o.d}
              variant={o.variant}
              onClick={() => {
                setErr(undefined)
                setPending(o.d)
              }}
            >
              {o.label}
            </Button>
          ))}
        </div>
      )}
      <ReasonDialog
        open={pending !== null}
        onOpenChange={(o) => !o && setPending(null)}
        title={pending ? PHOTO_DECISION_LABEL[pending] : ""}
        description="Alasan wajib. Barber diberi tahu hasil dan alasannya, dan keputusan tercatat di audit."
        confirmLabel="Simpan keputusan"
        variant={pending === "deleted" ? "danger" : "primary"}
        loading={decide.isPending}
        serverError={err}
        onSubmit={(reason) =>
          pending &&
          decide.mutate(
            { id: r.id, decision: pending, reason },
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
