import { Plus, Trash2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import {
  Async,
  Badge,
  Banner,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DatePicker,
  EmptyState,
  Field,
  Input,
  Select,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components"
import { hhmmToMinutes, minutesToHhmm, todayYmd } from "@/shared/domain/time"
import type { Booking, DayHours, Id, ScheduleBlock } from "@/shared/types"
import { formatDate, formatDateTime } from "@/shared/utils/format"
import { useBarbers } from "@/features/barber-profile"
import { useSaveSchedule, useSchedule } from "../hooks"
import type { ScheduleData } from "../types"

const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]
const range = (from: string, to: string) => {
  const out: { value: string; label: string }[] = []
  for (let m = hhmmToMinutes(from); m <= hhmmToMinutes(to); m += 30)
    out.push({
      value: minutesToHhmm(m),
      label: minutesToHhmm(m).replace(":", "."),
    })
  return out
}
const ALL_TIMES = range("00:00", "23:30")

export function ScheduleEditor() {
  const q = useSchedule()
  return <Async query={q}>{(d) => <Editor key={JSON.stringify(d).length} initial={d} />}</Async>
}

function Editor({ initial }: { initial: ScheduleData }) {
  const barbers = useBarbers()
  const save = useSaveSchedule()
  const [draft, setDraft] = useState<ScheduleData>(initial)
  const [affected, setAffected] = useState<Booking[] | null>(null)
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(initial), [draft, initial])
  useEffect(() => setDraft(initial), [initial])

  const submit = (summary: string) => {
    setAffected(null)
    save.mutate(
      { next: draft, summary },
      {
        onError: (e) => {
          if (e.code === "CONFLICT")
            setAffected((e.details as { bookings?: Booking[] } | undefined)?.bookings ?? [])
        },
      },
    )
  }
  const bar = (summary: string) => (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <Button onClick={() => submit(summary)} loading={save.isPending} disabled={!dirty}>
        Simpan
      </Button>
      <Button
        variant="secondary"
        onClick={() => {
          setDraft(initial)
          setAffected(null)
        }}
        disabled={!dirty}
      >
        Kembalikan
      </Button>
      {dirty && <Badge tone="warning">Belum disimpan</Badge>}
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      {affected && (
        <Banner tone="warning" title={`${affected.length} booking terdampak`}>
          <p>Pindahkan atau batalkan booking itu dulu.</p>
          <ul className="mt-2 flex flex-col gap-1">
            {affected.map((b) => (
              <li key={b.id}>
                <Link className="font-medium underline" to={`/staf/booking/${b.id}`}>
                  {b.customerName}
                </Link>{" "}
                - {formatDateTime(b.start)} WIB -{" "}
                {barbers.data?.find((x) => x.id === b.barberId)?.name}
              </li>
            ))}
          </ul>
        </Banner>
      )}
      <Banner tone="info">
        Jadwal toko mengalahkan jam kerja barber, dan jam kerja barber mengalahkan blok barber.
        Perubahan tidak dapat disimpan jika menimpa booking yang ada.
      </Banner>
      <Tabs defaultValue="hours" onValueChange={() => setAffected(null)}>
        <TabsList>
          <TabsTrigger value="hours">Jam buka toko</TabsTrigger>
          <TabsTrigger value="holidays">Libur dan tutup</TabsTrigger>
          <TabsTrigger value="working">Jam kerja barber</TabsTrigger>
          <TabsTrigger value="blocks">Blok waktu</TabsTrigger>
        </TabsList>
        <TabsContent value="hours">
          <Card>
            <CardHeader>
              <CardTitle>Jam buka per hari</CardTitle>
            </CardHeader>
            <CardContent>
              <DayRows
                days={draft.shopHours.days}
                onChange={(days) =>
                  setDraft({
                    ...draft,
                    shopHours: { ...draft.shopHours, days },
                  })
                }
              />
              {bar("Jam buka toko")}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="holidays">
          <Card>
            <CardHeader>
              <CardTitle>Libur dan tutup mendadak</CardTitle>
            </CardHeader>
            <CardContent>
              <Holidays draft={draft} setDraft={setDraft} />
              {bar("Libur toko")}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="working">
          <Card>
            <CardHeader>
              <CardTitle>Jam kerja barber</CardTitle>
            </CardHeader>
            <CardContent>
              <Working draft={draft} setDraft={setDraft} />
              {bar("Jam kerja barber")}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="blocks">
          <Card>
            <CardHeader>
              <CardTitle>Blok waktu</CardTitle>
            </CardHeader>
            <CardContent>
              <Blocks draft={draft} setDraft={setDraft} />
              {bar("Blok waktu")}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export function DayRows({
  days,
  onChange,
  limit,
  onLabel = "Buka",
}: {
  days: DayHours[]
  onChange: (d: DayHours[]) => void
  limit?: DayHours[]
  /** Label saklar saat hari aktif: "Buka" untuk toko, "Kerja" untuk barber. */
  onLabel?: string
}) {
  const set = (i: number, patch: Partial<DayHours>) =>
    onChange(days.map((d, j) => (j === i ? { ...d, ...patch } : d)))
  return (
    <ul className="divide-y">
      {DAY_ORDER.map((i) => {
        const d = days[i]
        const lim = limit?.[i]
        const blocked = limit !== undefined && !lim?.open
        const opts = lim?.open ? range(lim.from, lim.to) : ALL_TIMES
        return (
          <li
            key={i}
            className="grid min-h-14 grid-cols-[7rem_1fr] items-center gap-3 py-2 sm:grid-cols-[8rem_auto_1fr]"
          >
            <span className="font-medium text-slate-900">{DAY_NAMES[i]}</span>
            <Switch
              checked={d.open && !blocked}
              disabled={blocked}
              onCheckedChange={(open) => set(i, { open })}
              label={blocked ? "Toko tutup" : d.open ? onLabel : "Libur"}
            />
            {d.open && !blocked && (
              <div className="col-span-2 flex items-center gap-2 sm:col-span-1">
                <Select
                  aria-label={`${DAY_NAMES[i]} jam mulai`}
                  className="w-28"
                  value={d.from}
                  onValueChange={(from) =>
                    set(i, {
                      from,
                      to:
                        hhmmToMinutes(d.to) <= hhmmToMinutes(from)
                          ? (opts.find((o) => hhmmToMinutes(o.value) > hhmmToMinutes(from))
                              ?.value ?? d.to)
                          : d.to,
                    })
                  }
                  options={opts.slice(0, -1)}
                />
                <span aria-hidden>-</span>
                <Select
                  aria-label={`${DAY_NAMES[i]} jam selesai`}
                  className="w-28"
                  value={d.to}
                  onValueChange={(to) => set(i, { to })}
                  options={opts.filter((o) => hhmmToMinutes(o.value) > hhmmToMinutes(d.from))}
                />
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

function Holidays({
  draft,
  setDraft,
}: {
  draft: ScheduleData
  setDraft: (d: ScheduleData) => void
}) {
  const [from, setFrom] = useState(todayYmd())
  const [to, setTo] = useState(todayYmd())
  const [label, setLabel] = useState("")
  const [error, setError] = useState<string | undefined>()
  const add = () => {
    if (!label.trim()) return setError("Keterangan wajib diisi.")
    if (to < from) return setError("Tanggal akhir tidak boleh sebelum tanggal mulai.")
    setError(undefined)
    setDraft({
      ...draft,
      shopHours: {
        ...draft.shopHours,
        holidays: [
          ...draft.shopHours.holidays,
          { id: `hol-${Date.now()}`, from, to, label: label.trim() },
        ],
      },
    })
    setLabel("")
  }
  const list = draft.shopHours.holidays
  return (
    <div className="flex flex-col gap-4">
      {list.length === 0 ? (
        <EmptyState title="Belum ada libur." className="py-6" />
      ) : (
        <ul className="divide-y rounded-lg bg-slate-50">
          {list.map((h) => (
            <li key={h.id} className="flex min-h-14 items-center justify-between gap-2 px-3">
              <span>
                <span className="font-medium">{h.label}</span>
                <span className="block text-sm text-slate-600">
                  {h.from === h.to
                    ? formatDate(h.from)
                    : `${formatDate(h.from)} sampai ${formatDate(h.to)}`}
                </span>
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Hapus ${h.label}`}
                onClick={() =>
                  setDraft({
                    ...draft,
                    shopHours: {
                      ...draft.shopHours,
                      holidays: list.filter((x) => x.id !== h.id),
                    },
                  })
                }
              >
                <Trash2 className="size-4" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <div className="grid items-end gap-3 sm:grid-cols-4">
        <Field label="Mulai">
          <DatePicker
            value={from}
            onChange={(v) => {
              setFrom(v)
              if (to < v) setTo(v)
            }}
          />
        </Field>
        <Field label="Sampai">
          <DatePicker value={to} onChange={setTo} min={from} />
        </Field>
        <Field label="Keterangan" error={error}>
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Contoh: Libur nasional"
          />
        </Field>
        <Button variant="secondary" onClick={add}>
          <Plus className="size-4" aria-hidden />
          Tambah libur
        </Button>
      </div>
    </div>
  )
}

function Working({
  draft,
  setDraft,
}: {
  draft: ScheduleData
  setDraft: (d: ScheduleData) => void
}) {
  const barbers = useBarbers()
  const [barberId, setBarberId] = useState<Id>("")
  const active = (barbers.data ?? []).filter((b) => b.active)
  const id = barberId || active[0]?.id || ""
  const wh = draft.workingHours.find((w) => w.barberId === id)
  if (!wh) return <EmptyState title="Pilih barber." className="py-6" />
  return (
    <div className="flex flex-col gap-3">
      <Field label="Barber" className="max-w-xs">
        <Select
          value={id}
          onValueChange={setBarberId}
          options={active.map((b) => ({ value: b.id, label: b.name }))}
        />
      </Field>
      <p className="text-sm text-slate-600">
        Jam kerja berada di dalam jam buka toko dan berkelipatan 30 menit. Hari saat toko tutup
        tidak dapat diatur.
      </p>
      <DayRows
        days={wh.days}
        limit={draft.shopHours.days}
        onChange={(days) =>
          setDraft({
            ...draft,
            workingHours: draft.workingHours.map((w) => (w.barberId === id ? { ...w, days } : w)),
          })
        }
      />
    </div>
  )
}

function Blocks({ draft, setDraft }: { draft: ScheduleData; setDraft: (d: ScheduleData) => void }) {
  const barbers = useBarbers()
  const [who, setWho] = useState("shop")
  const [from, setFrom] = useState(todayYmd())
  const [to, setTo] = useState(todayYmd())
  const [fullDay, setFullDay] = useState(false)
  const [start, setStart] = useState("12:00")
  const [end, setEnd] = useState("13:00")
  const [weekly, setWeekly] = useState(false)
  const [label, setLabel] = useState("")
  const [error, setError] = useState<string | undefined>()
  const nameOf = (id: Id | null) =>
    id === null ? "Seluruh toko" : (barbers.data?.find((b) => b.id === id)?.name ?? "-")
  const add = () => {
    if (!label.trim()) return setError("Keterangan wajib diisi.")
    if (!fullDay && hhmmToMinutes(end) <= hhmmToMinutes(start))
      return setError("Jam selesai harus setelah jam mulai.")
    setError(undefined)
    const block: ScheduleBlock = {
      id: `blk-${Date.now()}`,
      barberId: who === "shop" ? null : who,
      from,
      to: weekly && to === from ? to : to,
      startTime: fullDay ? null : start,
      endTime: fullDay ? null : end,
      weekly,
      label: label.trim(),
    }
    setDraft({ ...draft, blocks: [...draft.blocks, block] })
    setLabel("")
  }
  return (
    <div className="flex flex-col gap-4">
      {draft.blocks.length === 0 ? (
        <EmptyState title="Belum ada blok waktu." className="py-6" />
      ) : (
        <ul className="divide-y rounded-lg bg-slate-50">
          {draft.blocks.map((b) => (
            <li key={b.id} className="flex min-h-14 items-center justify-between gap-2 px-3">
              <span>
                <span className="font-medium">{b.label}</span>{" "}
                <Badge tone={b.barberId === null ? "warning" : "slate"}>{nameOf(b.barberId)}</Badge>
                <span className="block text-sm text-slate-600">
                  {b.from === b.to
                    ? formatDate(b.from)
                    : `${formatDate(b.from)} sampai ${formatDate(b.to)}`}
                  ,{" "}
                  {b.startTime
                    ? `${b.startTime.replace(":", ".")} - ${b.endTime?.replace(":", ".")}`
                    : "satu hari penuh"}
                  {b.weekly ? ", berulang tiap minggu" : ""}
                </span>
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Hapus ${b.label}`}
                onClick={() =>
                  setDraft({
                    ...draft,
                    blocks: draft.blocks.filter((x) => x.id !== b.id),
                  })
                }
              >
                <Trash2 className="size-4" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <div className="rounded-lg bg-slate-50 p-4">
        <h3 className="mb-3 font-semibold">Tambah blok waktu</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Untuk">
            <Select
              value={who}
              onValueChange={setWho}
              options={[
                { value: "shop", label: "Seluruh toko" },
                ...(barbers.data ?? [])
                  .filter((b) => b.active)
                  .map((b) => ({ value: b.id, label: b.name })),
              ]}
            />
          </Field>
          <Field label="Mulai tanggal">
            <DatePicker
              value={from}
              onChange={(v) => {
                setFrom(v)
                if (to < v) setTo(v)
              }}
            />
          </Field>
          <Field
            label="Sampai tanggal"
            hint={weekly ? "Pengulangan berakhir pada tanggal ini" : undefined}
          >
            <DatePicker value={to} onChange={setTo} min={from} />
          </Field>
          <Switch checked={fullDay} onCheckedChange={setFullDay} label="Satu hari penuh" />
          {!fullDay && (
            <Field label="Jam mulai">
              <Select value={start} onValueChange={setStart} options={ALL_TIMES} />
            </Field>
          )}
          {!fullDay && (
            <Field label="Jam selesai">
              <Select value={end} onValueChange={setEnd} options={ALL_TIMES} />
            </Field>
          )}
          <Switch checked={weekly} onCheckedChange={setWeekly} label="Ulangi tiap minggu" />
          <Field label="Keterangan" error={error}>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Contoh: Istirahat"
            />
          </Field>
          <div className="flex items-end">
            <Button variant="secondary" onClick={add}>
              <Plus className="size-4" aria-hidden />
              Tambah blok
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
