import { Plus, Trash2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import {
  Async,
  Badge,
  Banner,
  Button,
  Card,
  CardContent,
  ConfirmDialog,
  EmptyState,
  PageSkeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components"
import { DAY_LABEL } from "@/shared/constants"
import { usePageMeta, useOnlineStatus } from "@/shared/hooks"
import type { DayHours, ScheduleBlock } from "@/shared/types"
import { formatDate } from "@/shared/utils/format"
import { NoMembership, useBarberMe } from "@/features/barber-account"
import { DayRows } from "@/features/schedule"
import { blockSummary, validateWorkingHours } from "../domain/blocks"
import { useBarberSchedule, useDeleteBlock, useSaveWorkingHours } from "../hooks"
import type { BarberSchedule } from "../types"
import { affectedCount, BlockSheet, conflictText } from "./BlockSheet"
import { MonthCalendar } from "./MonthCalendar"

const ORDER = [1, 2, 3, 4, 5, 6, 0]

function ShopRules({ shop }: { shop: BarberSchedule["shopHours"] }) {
  return (
    <section aria-labelledby="shop-rules" className="flex flex-col gap-2">
      <h2 id="shop-rules" className="text-base font-semibold text-slate-900">
        Aturan toko
      </h2>
      <p className="text-sm text-slate-600">
        Hanya baca. Jadwal toko mengalahkan jam kerja dan blok Anda.
      </p>
      <ul className="divide-y rounded-xl bg-white px-3 shadow-card">
        {ORDER.map((i) => (
          <li key={i} className="flex min-h-11 items-center justify-between gap-3 text-sm">
            <span className="text-slate-700">{DAY_LABEL[i]}</span>
            <span className="tabular-nums text-slate-900">
              {shop.days[i]?.open
                ? `${shop.days[i].from.replace(":", ".")} sampai ${shop.days[i].to.replace(":", ".")}`
                : "Tutup"}
            </span>
          </li>
        ))}
        {shop.holidays.map((h) => (
          <li key={h.id} className="flex min-h-11 items-center justify-between gap-3 text-sm">
            <span className="text-slate-700">{h.label}</span>
            <span className="text-slate-900">
              {h.from === h.to
                ? formatDate(h.from)
                : `${formatDate(h.from)} sampai ${formatDate(h.to)}`}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function WorkingHours({ data }: { data: BarberSchedule }) {
  const save = useSaveWorkingHours()
  const online = useOnlineStatus()
  const [draft, setDraft] = useState<DayHours[]>(data.workingHours)
  const [conflict, setConflict] = useState<number | null>(null)
  useEffect(() => setDraft(data.workingHours), [data.workingHours])
  const dirty = JSON.stringify(draft) !== JSON.stringify(data.workingHours)
  const errors = useMemo(() => validateWorkingHours(draft, data.shopHours), [draft, data.shopHours])
  const failed = Object.entries(errors)
  const submit = () => {
    setConflict(null)
    save.mutate(draft, { onError: (e) => setConflict(affectedCount(e)) })
  }
  return (
    <div className="flex flex-col gap-4">
      {conflict !== null && (
        <Banner tone="warning" title="Jam kerja tidak bisa disimpan">
          {conflictText(conflict)}
        </Banner>
      )}
      <Card>
        <CardContent>
          <DayRows days={draft} limit={data.shopHours.days} onLabel="Kerja" onChange={setDraft} />
        </CardContent>
      </Card>
      {failed.length > 0 && (
        <ul role="alert" className="flex flex-col gap-0.5 text-sm text-danger-700">
          {failed.map(([i, msg]) => (
            <li key={i}>
              {DAY_LABEL[Number(i)]}: {msg}
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={submit}
          loading={save.isPending}
          disabled={!dirty || failed.length > 0 || !online}
        >
          Simpan jam kerja
        </Button>
        <Button
          variant="secondary"
          disabled={!dirty}
          onClick={() => {
            setDraft(data.workingHours)
            setConflict(null)
          }}
        >
          Kembalikan
        </Button>
        {dirty && <Badge tone="warning">Belum disimpan</Badge>}
      </div>
      <ShopRules shop={data.shopHours} />
    </div>
  )
}

function Blocks({ data }: { data: BarberSchedule }) {
  const del = useDeleteBlock()
  const online = useOnlineStatus()
  const [open, setOpen] = useState(false)
  const [target, setTarget] = useState<ScheduleBlock | null>(null)
  const sorted = [...data.blocks].sort(
    (a, b) => a.from.localeCompare(b.from) || (a.startTime ?? "").localeCompare(b.startTime ?? ""),
  )
  return (
    <div className="flex flex-col gap-3">
      <Button className="self-start" disabled={!online} onClick={() => setOpen(true)}>
        <Plus className="size-4" aria-hidden />
        Tambah blok
      </Button>
      {sorted.length === 0 ? (
        <EmptyState
          title="Belum ada blok waktu."
          description="Tambahkan blok untuk istirahat atau keperluan lain."
        />
      ) : (
        <ul className="divide-y rounded-xl bg-white px-3 shadow-card">
          {sorted.map((b) => {
            const s = blockSummary(b)
            return (
              <li key={b.id} className="flex min-h-14 items-center justify-between gap-3 py-2">
                <div className="min-w-0 text-sm">
                  <p className="font-medium text-slate-900">{b.label || s.kind}</p>
                  <p className="text-slate-700">
                    {b.from === b.to
                      ? formatDate(b.from)
                      : `${formatDate(b.from)} sampai ${formatDate(b.to)}`}
                    {b.startTime ? `, ${s.range}` : ""}
                  </p>
                  <p className="text-xs text-slate-600">
                    {s.kind}
                    {s.repeat ? ` · ${s.repeat}` : ""}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Hapus blok ${b.label || s.kind}`}
                  disabled={!online}
                  onClick={() => setTarget(b)}
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </li>
            )
          })}
        </ul>
      )}
      <BlockSheet open={open} onOpenChange={setOpen} shop={data.shopHours} />
      <ConfirmDialog
        open={target !== null}
        onOpenChange={(o) => !o && setTarget(null)}
        title="Hapus blok ini?"
        description="Jam pada blok ini kembali bisa dipesan."
        confirmLabel="Hapus blok"
        variant="danger"
        loading={del.isPending}
        onConfirm={() => target && del.mutate(target.id, { onSuccess: () => setTarget(null) })}
      />
    </div>
  )
}

export function BarberScheduleView() {
  usePageMeta("Jadwal")
  const me = useBarberMe()
  const active = me.data?.membership.active === true
  const q = useBarberSchedule(active)
  if (me.isLoading) return <PageSkeleton rows={4} />
  if (me.data && !active) return <NoMembership title="Jadwal" />
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-title font-semibold text-slate-900">Jadwal</h1>
      <Async query={q} skeleton={<PageSkeleton rows={6} />}>
        {(data) => (
          <Tabs defaultValue="hours">
            <TabsList>
              <TabsTrigger value="hours">Jam kerja</TabsTrigger>
              <TabsTrigger value="blocks">Blok waktu</TabsTrigger>
              <TabsTrigger value="calendar">Kalender</TabsTrigger>
            </TabsList>
            <TabsContent value="hours">
              <WorkingHours data={data} />
            </TabsContent>
            <TabsContent value="blocks">
              <Blocks data={data} />
            </TabsContent>
            <TabsContent value="calendar">
              <MonthCalendar shop={data.shopHours} hours={data.workingHours} blocks={data.blocks} />
            </TabsContent>
          </Tabs>
        )}
      </Async>
    </div>
  )
}
