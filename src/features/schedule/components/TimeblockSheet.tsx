import { useEffect, useState } from "react"
import { Link } from "react-router"
import {
  Banner,
  Button,
  ConfirmDialog,
  DatePicker,
  Field,
  Input,
  Select,
  Sheet,
  Switch,
  Textarea,
} from "@/shared/components"
import {
  addDaysYmd,
  minutesToHhmm,
  hhmmToMinutes,
  toHhmm,
  toYmd,
  todayYmd,
} from "@/shared/domain/time"
import type { Booking, Id, Timeblock } from "@/shared/types"
import { formatDateTime } from "@/shared/utils/format"
import { useBarbers } from "@/features/barber-profile"
import { useDeleteTimeblock, useSaveTimeblock } from "../hooks"

export interface TimeblockPrefill {
  barberId: Id
  date: string
  time: string
}

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  prefill?: TimeblockPrefill | null
  /** Mode ubah: Timeblock yang sudah ada. */
  timeblock?: Timeblock | null
}

/** Sheet kanan untuk menambah atau mengubah Timeblock (penutup slot satu barber). */
export function TimeblockSheet({ open, onOpenChange, prefill, timeblock }: Props) {
  const barbers = useBarbers()
  const save = useSaveTimeblock()
  const del = useDeleteTimeblock()
  const [barberId, setBarberId] = useState<Id>("")
  const [startDate, setStartDate] = useState(todayYmd())
  const [startTime, setStartTime] = useState("12:00")
  const [endDate, setEndDate] = useState(todayYmd())
  const [endTime, setEndTime] = useState("12:30")
  const [allDay, setAllDay] = useState(false)
  const [reason, setReason] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [conflicts, setConflicts] = useState<Booking[] | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const editing = Boolean(timeblock)

  useEffect(() => {
    if (!open) return
    setErrors({})
    setConflicts(null)
    if (timeblock) {
      setBarberId(timeblock.barberId)
      setStartDate(toYmd(timeblock.startAt))
      setStartTime(toHhmm(timeblock.startAt))
      // Batas akhir eksklusif: sehari penuh berakhir pada 00.00 hari berikutnya.
      const lastDay = timeblock.allDay
        ? addDaysYmd(toYmd(timeblock.endAt), -1)
        : toYmd(timeblock.endAt)
      setEndDate(lastDay)
      setEndTime(timeblock.allDay ? "23:30" : toHhmm(timeblock.endAt))
      setAllDay(timeblock.allDay)
      setReason(timeblock.reason)
    } else if (prefill) {
      setBarberId(prefill.barberId)
      setStartDate(prefill.date)
      setStartTime(prefill.time)
      // Durasi awal 30 menit.
      const end = hhmmToMinutes(prefill.time) + 30
      setEndDate(prefill.date)
      setEndTime(minutesToHhmm(Math.min(end, 24 * 60 - 30)))
      setAllDay(false)
      setReason("")
    }
  }, [open, timeblock, prefill])

  const submit = () => {
    const e: Record<string, string> = {}
    if (!barberId) e.barberId = "Pilih barber."
    if (!allDay && (!startTime || !endTime)) e.endTime = "Isi jam mulai dan jam selesai."
    if (endDate < startDate) e.endDate = "Tanggal selesai tidak boleh sebelum tanggal mulai."
    else if (!allDay && endDate === startDate && endTime <= startTime)
      e.endTime = "Jam selesai harus setelah jam mulai."
    setErrors(e)
    setConflicts(null)
    if (Object.keys(e).length) return
    save.mutate(
      { id: timeblock?.id, barberId, startDate, startTime, endDate, endTime, allDay, reason },
      {
        onSuccess: () => onOpenChange(false),
        onError: (err) => {
          if (err.code === "CONFLICT")
            setConflicts((err.details as { bookings?: Booking[] } | undefined)?.bookings ?? [])
          else setErrors(err.fields ?? { endTime: err.message })
        },
      },
    )
  }

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={onOpenChange}
        title={editing ? "Ubah timeblock" : "Tambah timeblock"}
        description="Timeblock menutup slot barber sehingga tidak bisa dipesan online maupun walk-in."
        className="md:max-w-lg"
        footer={
          <>
            {editing && (
              <Button
                variant="danger"
                className="sm:mr-auto"
                onClick={() => setConfirmDelete(true)}
              >
                Hapus timeblock
              </Button>
            )}
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button onClick={submit} loading={save.isPending}>
              Simpan
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {conflicts && (
            <Banner tone="warning" title={`${conflicts.length} booking aktif ada di rentang ini`}>
              <p>Pindahkan atau batalkan booking itu dulu, lalu simpan lagi.</p>
              <ul className="mt-2 flex flex-col gap-1">
                {conflicts.map((b) => (
                  <li key={b.id}>
                    <Link className="font-medium underline" to={`/staf/booking/${b.id}`}>
                      {b.customerName}
                    </Link>{" "}
                    - {formatDateTime(b.start)} WIB
                  </li>
                ))}
              </ul>
            </Banner>
          )}
          <Field label="Barber" required error={errors.barberId}>
            <Select
              value={barberId}
              onValueChange={setBarberId}
              options={(barbers.data ?? [])
                .filter((b) => b.active)
                .map((b) => ({ value: b.id, label: b.name }))}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tanggal mulai">
              <DatePicker
                value={startDate}
                onChange={(v) => {
                  setStartDate(v)
                  if (endDate < v) setEndDate(v)
                }}
              />
            </Field>
            <Field label="Jam mulai">
              <Input
                type="time"
                step={1800}
                value={startTime}
                disabled={allDay}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </Field>
            <Field label="Tanggal selesai" error={errors.endDate}>
              <DatePicker value={endDate} min={startDate} onChange={setEndDate} />
            </Field>
            <Field label="Jam selesai" error={errors.endTime}>
              <Input
                type="time"
                step={1800}
                value={endTime}
                disabled={allDay}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </Field>
          </div>
          <div>
            <Switch checked={allDay} onCheckedChange={setAllDay} label="Satu hari penuh" />
            {allDay && (
              <p className="text-xs text-slate-600">
                {startDate === endDate
                  ? "Menutup seluruh jam buka toko pada tanggal ini."
                  : "Menutup seluruh jam buka toko pada semua hari dari tanggal mulai sampai tanggal selesai."}
              </p>
            )}
          </div>
          <Field label="Alasan (opsional)" hint="Contoh: Istirahat, Keperluan pribadi">
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} />
          </Field>
        </div>
      </Sheet>
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Hapus timeblock?"
        description="Slot pada rentang ini kembali bisa dipesan."
        confirmLabel="Hapus timeblock"
        variant="danger"
        loading={del.isPending}
        onConfirm={() =>
          timeblock &&
          del.mutate(timeblock.id, {
            onSuccess: () => {
              setConfirmDelete(false)
              onOpenChange(false)
            },
          })
        }
      />
    </>
  )
}
