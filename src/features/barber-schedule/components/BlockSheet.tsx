import { useEffect, useState } from "react"
import {
  Banner,
  Button,
  DatePicker,
  Field,
  Input,
  RadioGroup,
  RadioRow,
  Sheet,
  Switch,
} from "@/shared/components"
import { todayYmd } from "@/shared/domain/time"
import type { ApiError } from "@/shared/api"
import type { ShopHours } from "@/shared/types"
import { useSaveBlock } from "../hooks"
import {
  coveredByShopClosure,
  defaultRepeatUntil,
  toSaveInput,
  validateBlockForm,
  type FieldErrors,
} from "../domain/blocks"
import type { BlockForm, BlockKind } from "../types"

const initial = (): BlockForm => ({
  kind: "partial",
  date: todayYmd(),
  endDate: todayYmd(),
  startTime: "12:00",
  endTime: "13:00",
  weekly: false,
  repeatUntil: defaultRepeatUntil(),
  reason: "",
})

/** Jumlah booking terdampak dari galat BLOCK_CONFLICT (atau CONFLICT berisi daftar booking). */
export function affectedCount(e: ApiError): number | null {
  const d = e.details as { affectedBookings?: number; bookings?: unknown[] } | undefined
  if (e.code === "BLOCK_CONFLICT") return d?.affectedBookings ?? 1
  if (e.code === "CONFLICT" && Array.isArray(d?.bookings)) return d.bookings.length
  return null
}

export const conflictText = (n: number) =>
  `${n} booking terdampak. Minta Admin memindahkan atau membatalkan booking itu dulu.`

export function BlockSheet({
  open,
  onOpenChange,
  shop,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  shop: ShopHours
}) {
  const save = useSaveBlock()
  const [form, setForm] = useState<BlockForm>(initial)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [conflict, setConflict] = useState<number | null>(null)
  const [closed, setClosed] = useState(false)
  const set = (patch: Partial<BlockForm>) => setForm((f) => ({ ...f, ...patch }))

  useEffect(() => {
    if (!open) return
    setForm(initial())
    setErrors({})
    setConflict(null)
    setClosed(false)
  }, [open])

  const submit = () => {
    setConflict(null)
    setClosed(false)
    const e = validateBlockForm(form)
    setErrors(e)
    if (Object.keys(e).length) return
    const input = toSaveInput(form)
    if (coveredByShopClosure(input, shop)) return setClosed(true)
    save.mutate(input, {
      onSuccess: () => onOpenChange(false),
      onError: (err) => {
        const n = affectedCount(err)
        if (n !== null) setConflict(n)
        else if (err.code === "VALIDATION" && err.fields)
          setErrors({ endTime: err.fields.endTime ?? err.message })
        else setErrors({ endTime: err.message })
      },
    })
  }

  const range = form.kind === "range"
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Tambah blok"
      description="Blok menutup jam Anda sehingga tidak bisa dipesan."
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Batalkan
          </Button>
          <Button onClick={submit} loading={save.isPending}>
            Simpan blok
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {conflict !== null && (
          <Banner tone="warning" title="Blok tidak bisa disimpan">
            {conflictText(conflict)}
          </Banner>
        )}
        {closed && <Banner tone="info">Sudah ditutup toko. Blok tidak diperlukan.</Banner>}
        <fieldset>
          <legend className="mb-1 text-sm font-medium text-slate-700">Jenis blok</legend>
          <RadioGroup
            value={form.kind}
            onValueChange={(v) => set({ kind: v as BlockKind })}
            className="divide-y"
          >
            <RadioRow value="partial" label="Sebagian jam" />
            <RadioRow value="fullDay" label="Satu hari penuh" />
            <RadioRow value="range" label="Rentang tanggal" />
          </RadioGroup>
        </fieldset>
        <div className="grid grid-cols-2 gap-3">
          <Field label={range ? "Tanggal mulai" : "Tanggal"} error={errors.date}>
            <DatePicker
              value={form.date}
              onChange={(v) => set({ date: v, endDate: form.endDate < v ? v : form.endDate })}
            />
          </Field>
          {range && (
            <Field label="Tanggal selesai" error={errors.endDate}>
              <DatePicker
                value={form.endDate}
                min={form.date}
                onChange={(v) => set({ endDate: v })}
              />
            </Field>
          )}
        </div>
        {form.kind === "partial" && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Jam mulai">
              <Input
                type="time"
                step={1800}
                value={form.startTime}
                onChange={(e) => set({ startTime: e.target.value })}
              />
            </Field>
            <Field label="Jam selesai" error={errors.endTime}>
              <Input
                type="time"
                step={1800}
                value={form.endTime}
                onChange={(e) => set({ endTime: e.target.value })}
              />
            </Field>
          </div>
        )}
        {!range && (
          <div>
            <Switch
              checked={form.weekly}
              onCheckedChange={(weekly) => set({ weekly })}
              label="Ulangi tiap minggu"
            />
            {form.weekly && (
              <Field label="Berulang sampai" error={errors.repeatUntil} className="mt-2">
                <DatePicker
                  value={form.repeatUntil}
                  min={form.date}
                  onChange={(v) => set({ repeatUntil: v })}
                />
              </Field>
            )}
          </div>
        )}
        <Field label="Alasan (opsional)" hint="Contoh: Istirahat">
          <Input
            value={form.reason}
            maxLength={60}
            onChange={(e) => set({ reason: e.target.value })}
          />
        </Field>
        {form.kind !== "partial" && errors.endTime && (
          <p role="alert" className="text-sm text-danger-700">
            {errors.endTime}
          </p>
        )}
      </div>
    </Sheet>
  )
}
