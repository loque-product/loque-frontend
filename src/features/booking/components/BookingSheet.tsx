import { MessageCircle } from "lucide-react"
import { useEffect, useMemo, useState, type ReactNode } from "react"
import { Link } from "react-router"
import {
  Banner,
  Button,
  DatePicker,
  Field,
  Input,
  MoneyText,
  Select,
  Sheet,
  Skeleton,
  Textarea,
} from "@/shared/components"
import { addMinutes, toHhmm, toIso, toYmd, todayYmd } from "@/shared/domain/time"
import { useDebounce } from "@/shared/hooks"
import { waLink } from "@/shared/lib/wa-link"
import type { Id } from "@/shared/types"
import {
  formatDate,
  formatDuration,
  formatPhone,
  formatRupiah,
  formatTime,
} from "@/shared/utils/format"
import { useBarbers } from "@/features/barber-profile"
import { useOverrides, useServices } from "@/features/catalog"
import { useCustomerSearch, usePhoneMatch } from "@/features/customers"
import { computeFee, useFeeConfig } from "@/features/payments"
import { nearestAvailable, type SlotReason } from "@/features/schedule"
import { useShopProfile } from "@/features/shops"
import { itemsDuration, itemsTotal, quoteItems } from "../domain/pricing"
import { useBooking, useCreateBooking, useSlots, useUpdateBooking } from "../hooks"
import type { UpdateBookingResult } from "../types"
import { ServicePicker } from "./ServicePicker"

export interface BookingPrefill {
  barberId: Id
  date: string
  time: string
}

export type BookingSheetMode = "walkin" | "booking" | "edit"
export type BookingSection = "schedule" | "customer" | "services"

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  mode: BookingSheetMode
  prefill?: BookingPrefill | null
  /** Wajib pada mode edit. */
  bookingId?: string | null
  /** Bagian yang langsung dibuka dan difokuskan. */
  focusSection?: BookingSection
  onSaved?: (bookingId: string) => void
}

const REASON_TEXT: Record<SlotReason, string> = {
  booked: "Bentrok dengan booking lain pada jam ini.",
  block: "Bentrok dengan timeblock atau blok waktu pada jam ini.",
  closed: "Layanan tidak muat sebelum jam tutup atau jam kerja barber berakhir.",
  past: "Jam ini sudah terlalu dekat dengan waktu sekarang.",
}

const TITLE: Record<BookingSheetMode, string> = {
  walkin: "Tambah booking walk-in",
  booking: "Tambah booking",
  edit: "Ubah booking",
}

function Step({
  n,
  id,
  title,
  children,
}: {
  n: number
  id: string
  title: string
  children: ReactNode
}) {
  return (
    <section
      id={`bs-${id}`}
      aria-labelledby={`bs-${id}-h`}
      className="flex scroll-mt-2 flex-col gap-3"
    >
      <h3
        id={`bs-${id}-h`}
        className="flex items-center gap-2 text-base font-semibold text-slate-900"
      >
        <span
          className="flex size-6 items-center justify-center rounded-full bg-primary-700 text-xs text-white"
          aria-hidden
        >
          {n}
        </span>
        <span>
          <span className="sr-only">Langkah {n}: </span>
          {title}
        </span>
      </h3>
      {children}
    </section>
  )
}

/**
 * Satu sheet untuk membuat booking, membuat walk-in, dan mengubah booking.
 * Sheet dari kanan di desktop dan tablet, dari bawah di mobile.
 */
export function BookingSheet({
  open,
  onOpenChange,
  mode,
  prefill,
  bookingId,
  focusSection,
  onSaved,
}: Props) {
  const edit = mode === "edit"
  const detail = useBooking(edit && bookingId ? bookingId : "")
  const booking = edit ? detail.data?.booking : undefined
  const nextBooking = edit ? (detail.data?.nextBooking ?? null) : null
  const barbers = useBarbers()
  const services = useServices()
  const overrides = useOverrides()
  const shop = useShopProfile()
  const fee = useFeeConfig()
  const create = useCreateBooking()
  const update = useUpdateBooking()

  const [date, setDate] = useState(todayYmd())
  const [time, setTime] = useState("")
  const [barberId, setBarberId] = useState<Id>("")
  const [serviceIds, setServiceIds] = useState<Id[]>([])
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [note, setNote] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [result, setResult] = useState<UpdateBookingResult | null>(null)
  const [nameFocus, setNameFocus] = useState(false)

  const ready = !edit || Boolean(booking)
  useEffect(() => {
    if (!open || !ready) return
    setErrors({})
    setFormError(null)
    setResult(null)
    if (booking) {
      setDate(toYmd(booking.start))
      setTime(toHhmm(booking.start))
      setBarberId(booking.barberId)
      setServiceIds(booking.items.map((i) => i.serviceId))
      setName(booking.customerName)
      setPhone(booking.customerPhone ?? "")
      setNote(booking.note ?? "")
    } else {
      setDate(prefill?.date ?? todayYmd())
      setTime(prefill?.time ?? "")
      setBarberId(prefill?.barberId ?? "")
      setServiceIds([])
      setName("")
      setPhone("")
      setNote("")
    }
  }, [open, ready, booking, prefill])

  // Fokus ke bagian tertentu (mis. "Tambah layanan" dari halaman tagihan).
  useEffect(() => {
    if (!open || !ready || !focusSection) return
    const t = setTimeout(() => {
      const el = document.getElementById(`bs-${focusSection}`)
      el?.scrollIntoView({ block: "start" })
      el?.querySelector<HTMLElement>("input, button[role='checkbox'], [role='combobox']")?.focus()
    }, 200)
    return () => clearTimeout(t)
  }, [open, ready, focusSection])

  const barberChanged = edit && booking ? barberId !== booking.barberId : true
  const timeChanged =
    edit && booking ? date !== toYmd(booking.start) || time !== toHhmm(booking.start) : true
  const scheduleChanged = barberChanged || timeChanged
  const items = useMemo(
    () =>
      quoteItems({
        existing: booking?.items ?? [],
        serviceIds,
        barberChanged,
        barberId,
        services: services.data ?? [],
        overrides: overrides.data ?? [],
      }),
    [booking?.items, serviceIds, barberChanged, barberId, services.data, overrides.data],
  )
  const total = itemsTotal(items)
  const duration = itemsDuration(items)
  const slots = useSlots(
    barberId ? { date, barberId, serviceIds, isWalkIn: true, ignoreBookingId: booking?.id } : null,
  )
  const slotList = slots.data ?? []
  const currentSlot = slotList.find((s) => s.time === time)
  const options = useMemo(
    () =>
      slotList.map((s) => {
        const keep =
          edit && booking && !timeChanged && !barberChanged && s.time === toHhmm(booking.start)
        const unavailable = !s.available && !keep
        return {
          value: s.time,
          label: `${s.time.replace(":", ".")}${unavailable ? " (tidak tersedia)" : ""}`,
          disabled: unavailable,
        }
      }),
    [slotList, edit, booking, timeChanged, barberChanged],
  )
  const conflict =
    scheduleChanged && time && currentSlot && !currentSlot.available ? currentSlot : null
  const startIso = time ? toIso(date, time) : null
  const endTime = startIso ? formatTime(addMinutes(startIso, duration)) : null
  const delta = booking ? total - booking.serviceTotal : 0
  const conflictNext =
    edit &&
    !scheduleChanged &&
    nextBooking &&
    booking &&
    new Date(nextBooking.start) < addMinutes(booking.start, duration)
      ? nextBooking
      : null

  const debouncedPhone = useDebounce(phone, 300)
  const match = usePhoneMatch(debouncedPhone)
  const debouncedName = useDebounce(name, 250)
  const suggestions = useCustomerSearch(
    nameFocus && debouncedName.trim().length >= 2 ? debouncedName : "__none__",
  )
  const feeMode =
    edit && booking ? booking.feeMode : mode === "walkin" ? "none" : (fee.data?.mode ?? "none")
  const feeAmount =
    edit && booking ? booking.feeAmount : mode === "walkin" ? 0 : (fee.data?.amount ?? 0)
  const feeCalc = computeFee(feeMode, feeAmount, total)

  const submit = () => {
    const e: Record<string, string> = {}
    if (!barberId) e.barberId = "Pilih barber."
    if (!time) e.time = "Pilih jam mulai."
    else if (conflict) e.time = REASON_TEXT[conflict.reason ?? "booked"]
    if (!name.trim()) e.name = "Nama wajib diisi."
    if (serviceIds.length === 0) e.serviceIds = "Pilih minimal satu layanan."
    setErrors(e)
    setFormError(null)
    if (Object.keys(e).length) return
    const onError = (err: { fields?: Record<string, string>; message: string }) => {
      if (err.fields) setErrors(err.fields)
      else setFormError(err.message)
    }
    if (edit && booking) {
      update.mutate(
        { id: booking.id, date, time, barberId, serviceIds, name, phone, note },
        {
          onSuccess: (r) => {
            onSaved?.(booking.id)
            if (r.scheduleOrBarberChanged) setResult(r)
            else onOpenChange(false)
          },
          onError,
        },
      )
    } else {
      create.mutate(
        {
          mode: mode === "walkin" ? "walkin" : "booking",
          name,
          phone: phone || undefined,
          note: note || undefined,
          barberId,
          date,
          time,
          serviceIds,
        },
        {
          onSuccess: (b) => {
            onOpenChange(false)
            onSaved?.(b.id)
          },
          onError,
        },
      )
    }
  }

  const shopName = shop.data?.name ?? "Toko"
  const newBarber = barbers.data?.find((x) => x.id === barberId)?.name
  const pending = create.isPending || update.isPending

  if (result) {
    const message = `Halo ${result.booking.customerName}, booking Anda di ${shopName} dipindahkan ke ${formatDate(result.booking.start)} pukul ${formatTime(result.booking.start)} bersama ${newBarber}.${result.requiresCustomerApproval ? ` Harga menjadi ${formatRupiah(result.booking.serviceTotal)}. Mohon konfirmasi persetujuan Anda.` : " Mohon konfirmasi jika jadwal ini sesuai."}`
    return (
      <Sheet
        open={open}
        onOpenChange={onOpenChange}
        title="Perubahan disimpan"
        className="md:max-w-lg"
        footer={<Button onClick={() => onOpenChange(false)}>Selesai</Button>}
      >
        <div className="flex flex-col gap-3">
          <Banner tone="success">Perubahan booking tersimpan dan tercatat di riwayat.</Banner>
          <section className="rounded-lg bg-slate-50 p-3">
            <h3 className="font-semibold text-slate-900">Beri tahu pelanggan</h3>
            <p className="mt-1 text-sm text-slate-600">Kirim pesan WhatsApp yang sudah terisi.</p>
            {result.booking.customerPhone ? (
              <Button asChild className="mt-3">
                <a
                  href={waLink(result.booking.customerPhone, message)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="size-4" aria-hidden />
                  Buka WhatsApp
                </a>
              </Button>
            ) : (
              <p className="mt-2 text-sm text-slate-600">Nomor telepon pelanggan belum diisi.</p>
            )}
          </section>
          {result.requiresCustomerApproval && (
            <Banner tone="warning">
              Harga lebih mahal. Pelanggan harus menyetujui lewat WhatsApp lebih dulu. Jika menolak,
              booking dibatalkan oleh toko dengan refund.
            </Banner>
          )}
          {result.conflictWith && (
            <Banner tone="warning">
              Layanan ini bentrok dengan booking berikutnya pukul{" "}
              {formatTime(result.conflictWith.start)}. Geser booking itu lewat form ubah.{" "}
              <Link
                className="font-medium underline"
                to={`/staf/booking/${result.conflictWith.id}`}
              >
                Buka booking
              </Link>
            </Banner>
          )}
        </div>
      </Sheet>
    )
  }

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={TITLE[mode]}
      description={
        mode === "walkin"
          ? "Walk-in langsung dikonfirmasi tanpa booking fee."
          : mode === "booking"
            ? "Booking dibuat staf memakai skema booking fee yang aktif."
            : "Semua perubahan masuk riwayat booking."
      }
      className="md:max-w-lg"
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={submit} loading={pending} disabled={!ready}>
            Simpan
          </Button>
        </>
      }
    >
      {!ready ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-40" />
          <Skeleton className="h-56" />
        </div>
      ) : edit && booking && booking.status !== "confirmed" ? (
        <Banner tone="warning">Hanya booking berstatus Terkonfirmasi yang dapat diubah.</Banner>
      ) : (
        <div className="flex flex-col gap-6">
          {formError && <Banner tone="danger">{formError}</Banner>}

          <Step n={1} id="schedule" title="Jadwal dan barber">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tanggal">
                <DatePicker
                  value={date}
                  onChange={(v) => {
                    setDate(v)
                    setTime("")
                  }}
                />
              </Field>
              <Field label="Jam mulai" required error={errors.time}>
                <Select
                  value={time}
                  onValueChange={setTime}
                  options={options}
                  placeholder={barberId ? "Pilih jam" : "Pilih barber dulu"}
                  disabled={!barberId}
                />
              </Field>
            </div>
            <Field label="Barber" required error={errors.barberId}>
              <Select
                value={barberId}
                onValueChange={(v) => {
                  setBarberId(v)
                  setTime("")
                }}
                options={(barbers.data ?? [])
                  .filter((b) => b.active)
                  .map((b) => ({ value: b.id, label: b.name }))}
              />
            </Field>
            {endTime && (
              <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                Selesai pukul <strong>{endTime}</strong> WIB. Total durasi{" "}
                {formatDuration(duration)}.
              </p>
            )}
            {conflict && (
              <Banner tone="warning" title="Jadwal bentrok">
                {REASON_TEXT[conflict.reason ?? "booked"]}
                {nearestAvailable(slotList, time, 3).length > 0 && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span>Jam kosong terdekat:</span>
                    {nearestAvailable(slotList, time, 3).map((t) => (
                      <Button key={t} size="sm" variant="secondary" onClick={() => setTime(t)}>
                        {t.replace(":", ".")}
                      </Button>
                    ))}
                  </div>
                )}
              </Banner>
            )}
            {edit && barberChanged && booking && (
              <p className="rounded-lg bg-slate-50 p-3 text-sm">
                Harga lama <strong>{formatRupiah(booking.serviceTotal)}</strong>, harga baru{" "}
                <strong>{formatRupiah(total)}</strong>. Harga dan durasi mengikuti barber baru.
              </p>
            )}
            {edit && barberChanged && delta > 0 && (
              <Banner tone="warning">
                Harga lebih mahal. Pelanggan harus menyetujui lewat WhatsApp lebih dulu. Jika
                menolak, booking dibatalkan oleh toko dengan refund.
              </Banner>
            )}
          </Step>

          <Step n={2} id="customer" title="Detail customer">
            <Field label="Nama" required error={errors.name}>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setNameFocus(true)}
                onBlur={() => setTimeout(() => setNameFocus(false), 150)}
                autoComplete="off"
              />
            </Field>
            {nameFocus &&
              suggestions.data &&
              suggestions.data.length > 0 &&
              debouncedName.trim().length >= 2 && (
                <ul
                  className="-mt-2 flex flex-col rounded-lg bg-white"
                  aria-label="Pelanggan terdaftar"
                >
                  {suggestions.data.slice(0, 4).map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        className="flex min-h-11 w-full items-center justify-between gap-2 px-3 text-left text-sm hover:bg-slate-50"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setName(c.name)
                          setPhone(c.phone)
                          setNameFocus(false)
                        }}
                      >
                        <span className="font-medium">{c.name}</span>
                        <span className="text-xs text-slate-600">{formatPhone(c.phone)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            <Field label="Nomor WhatsApp" hint="Jika diisi, kunjungan masuk ke riwayat pelanggan">
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                placeholder="0812-0000-0000"
              />
            </Field>
            {match.data && (
              <Banner tone="success">
                Cocok dengan {match.data.name}. Kunjungan akan masuk ke riwayatnya.
              </Banner>
            )}
            <Field label="Catatan (opsional)">
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Contoh: minta potongan pendek di samping"
              />
            </Field>
          </Step>

          <Step n={3} id="services" title="Layanan">
            {errors.serviceIds && <p className="text-xs text-danger-700">{errors.serviceIds}</p>}
            {barberId ? (
              <ServicePicker
                services={services.data ?? []}
                overrides={overrides.data ?? []}
                barberId={barberId}
                value={serviceIds}
                onChange={setServiceIds}
                snapshot={edit && !barberChanged ? booking?.items : undefined}
              />
            ) : (
              <p className="text-sm text-slate-600">Pilih barber untuk melihat harga layanan.</p>
            )}
            {conflictNext && (
              <Banner tone="warning">
                Layanan ini bentrok dengan booking berikutnya pukul {formatTime(conflictNext.start)}
                . Geser booking itu lewat form ubah.{" "}
                <Link className="font-medium underline" to={`/staf/booking/${conflictNext.id}`}>
                  Buka booking berikutnya
                </Link>
              </Banner>
            )}
            <dl className="flex flex-col gap-1.5 rounded-lg bg-slate-50 p-3 text-sm">
              <div className="flex justify-between">
                <dt>Total harga</dt>
                <dd className="font-semibold">
                  <MoneyText value={total} />
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Total durasi</dt>
                <dd>{formatDuration(duration)}</dd>
              </div>
              {feeMode === "none" ? (
                <div className="flex justify-between text-slate-600">
                  <dt>Booking fee</dt>
                  <dd>Tidak ada</dd>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-slate-600">
                    <dt>Booking fee dibayar online</dt>
                    <dd>
                      <MoneyText value={feeCalc.onlineAmount} />
                    </dd>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <dt>Kredit atas tagihan</dt>
                    <dd>
                      <MoneyText value={feeCalc.creditToBill} />
                    </dd>
                  </div>
                  <div className="flex justify-between border-t pt-1.5 font-semibold">
                    <dt>Sisa bayar di toko</dt>
                    <dd>
                      <MoneyText value={feeCalc.payAtShop} />
                    </dd>
                  </div>
                </>
              )}
            </dl>
          </Step>
        </div>
      )}
    </Sheet>
  )
}
