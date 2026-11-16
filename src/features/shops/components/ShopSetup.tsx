import { zodResolver } from "@hookform/resolvers/zod"
import { Copy, Plus, RefreshCw, Trash2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { z } from "zod"
import {
  Async,
  Badge,
  Banner,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Field,
  Input,
  MoneyText,
  Select,
  Skeleton,
  Stepper,
  Switch,
  Textarea,
} from "@/shared/components"
import { CATEGORY_LABEL } from "@/shared/constants"
import { hhmmToMinutes } from "@/shared/domain/time"
import type { DayHours, ServiceCategory } from "@/shared/types"
import { formatDateTime } from "@/shared/utils/format"
import { generateTempPassword } from "@/features/accounts"
import { useActiveShop } from "@/features/auth"
import { computeSetup } from "../domain/setup"
import {
  useCompletePaymentTest,
  useOpenShop,
  usePaymentTestStep,
  useSaveBasics,
  useSaveCatalog,
  useSaveDoku,
  useSaveHours,
  useSaveOwner,
  useSetupData,
  useTestDoku,
} from "../hooks"
import type { CatalogDraftRow, ShopSetupData } from "../types"
import { ShopActions } from "./ShopActions"
import { dokuBadge, shopStatusBadge } from "./ShopList"

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
const ORDER = [1, 2, 3, 4, 5, 6, 0]
const CATEGORIES = Object.keys(CATEGORY_LABEL) as ServiceCategory[]
const DURATIONS = [0, 30, 60, 90, 120, 150, 180]

export function ShopSetup({ shopId }: { shopId: string }) {
  const q = useSetupData(shopId)
  const navigate = useNavigate()
  return (
    <Async query={q} skeleton={<Skeleton className="h-96" />}>
      {(d) => <Body data={d} onDeleted={() => navigate("/sa/toko")} />}
    </Async>
  )
}

function Body({ data, onDeleted }: { data: ShopSetupData; onDeleted: () => void }) {
  const { shop } = data
  const setup = computeSetup(shop)
  const firstOpen = setup.steps.findIndex((s) => !s.done)
  const [index, setIndex] = useState(firstOpen === -1 ? 6 : firstOpen)
  const readOnly = shop.status !== "draft"
  const next = () => setIndex((i) => Math.min(6, i + 1))
  useEffect(() => {
    if (!readOnly && firstOpen !== -1 && firstOpen < index) return
  }, [firstOpen, index, readOnly])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-section font-semibold">{shop.name}</h2>
        {shopStatusBadge(shop)}
        <span className="text-sm text-slate-600">{setup.doneCount} dari 7 langkah selesai</span>
        <div className="ml-auto">
          <ShopActions shop={shop} upcomingBookings={data.upcomingBookings} onDeleted={onDeleted} />
        </div>
      </div>
      {shop.status === "draft" ? (
        <Banner tone="info">Toko tidak tampil ke publik sebelum semua langkah selesai.</Banner>
      ) : null}
      {shop.status === "frozen" && (
        <Banner tone="info" title="Toko sedang dibekukan">
          {shop.frozenReason}
        </Banner>
      )}
      {readOnly && (
        <Banner tone="info">
          Toko sudah pernah dibuka. Data penyiapan tidak dapat diubah di sini. Gunakan Kelola
          sebagai Owner.
        </Banner>
      )}
      <Stepper
        steps={setup.steps.map((s) => ({
          label: s.label,
          done: s.done,
          description: s.done ? "Selesai" : undefined,
        }))}
        currentIndex={index}
        onSelect={setIndex}
      />
      <Card>
        <CardHeader>
          <CardTitle>{`Langkah ${index + 1}: ${setup.steps[index].label}`}</CardTitle>
          {setup.steps[index].done && <Badge tone="primary">Selesai</Badge>}
        </CardHeader>
        <CardContent>
          {index === 0 && <BasicsStep data={data} readOnly={readOnly} onNext={next} />}
          {index === 1 && <OwnerStep data={data} readOnly={readOnly} onNext={next} />}
          {index === 2 && <DokuStep data={data} readOnly={readOnly} onNext={next} />}
          {index === 3 && <CatalogStep data={data} readOnly={readOnly} onNext={next} />}
          {index === 4 && <HoursStep data={data} readOnly={readOnly} onNext={next} />}
          {index === 5 && <PaymentStep data={data} readOnly={readOnly} onNext={next} />}
          {index === 6 && <OpenStep data={data} onGoto={setIndex} />}
        </CardContent>
      </Card>
    </div>
  )
}

/* ---------------------------- Langkah 1 ---------------------------- */
const basicsSchema = z.object({
  name: z.string().trim().min(1, "Nama toko wajib diisi."),
  address: z.string().trim().min(1, "Alamat lengkap wajib diisi."),
  city: z.string().trim().min(1, "Kota atau kabupaten wajib diisi."),
  whatsapp: z
    .string()
    .trim()
    .min(9, "Nomor WhatsApp minimal 9 digit.")
    .regex(/^[0-9+\-\s]+$/, "Nomor WhatsApp hanya berisi angka."),
  instagram: z.string(),
  tiktok: z.string(),
})
type Basics = z.infer<typeof basicsSchema>

function BasicsStep({ data, readOnly, onNext }: StepProps) {
  const save = useSaveBasics(data.shop.id)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Basics>({
    resolver: zodResolver(basicsSchema),
    defaultValues: {
      name: data.shop.name,
      address: data.shop.address,
      city: data.shop.city,
      whatsapp: data.shop.whatsapp,
      instagram: data.shop.instagram,
      tiktok: data.shop.tiktok,
    },
  })
  return (
    <form
      noValidate
      className="grid max-w-3xl gap-4 sm:grid-cols-2"
      onSubmit={handleSubmit((v) =>
        save.mutate(v, {
          onSuccess: onNext,
          onError: (e) =>
            Object.entries(e.fields ?? {}).forEach(([k, m]) =>
              setError(k as keyof Basics, { message: m }),
            ),
        }),
      )}
    >
      <fieldset disabled={readOnly} className="contents">
        <Field label="Nama toko" required error={errors.name?.message} className="sm:col-span-2">
          <Input {...register("name")} />
        </Field>
        <Field
          label="Alamat lengkap"
          required
          error={errors.address?.message}
          className="sm:col-span-2"
        >
          <Textarea {...register("address")} />
        </Field>
        <Field label="Kota atau kabupaten" required error={errors.city?.message}>
          <Input {...register("city")} />
        </Field>
        <Field label="Nomor WhatsApp toko" required error={errors.whatsapp?.message}>
          <Input inputMode="tel" {...register("whatsapp")} />
        </Field>
        <Field label="Instagram (opsional)">
          <Input {...register("instagram")} />
        </Field>
        <Field label="TikTok (opsional)">
          <Input {...register("tiktok")} />
        </Field>
        <Field label="Zona waktu" hint="Terkunci">
          <Input value="WIB (UTC+7)" readOnly disabled />
        </Field>
      </fieldset>
      {!readOnly && (
        <div className="sm:col-span-2">
          <Button type="submit" loading={save.isPending}>
            Simpan dan lanjut
          </Button>
        </div>
      )}
    </form>
  )
}

interface StepProps {
  data: ShopSetupData
  readOnly: boolean
  onNext: () => void
}

/* ---------------------------- Langkah 2 ---------------------------- */
const ownerSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi."),
  email: z.string().trim().min(1, "Email wajib diisi.").email("Format email tidak valid."),
  phone: z.string().trim().min(9, "Nomor telepon minimal 9 digit."),
  password: z.string(),
})
type OwnerForm = z.infer<typeof ownerSchema>

function OwnerStep({ data, readOnly, onNext }: StepProps) {
  const save = useSaveOwner(data.shop.id)
  const owner = data.owner
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<OwnerForm>({
    resolver: zodResolver(ownerSchema),
    defaultValues: {
      name: owner?.name ?? "",
      email: owner?.email ?? "",
      phone: owner?.phone ?? "",
      password: owner ? "" : generateTempPassword(),
    },
  })
  const password = watch("password")
  return (
    <form
      noValidate
      className="grid max-w-3xl gap-4 sm:grid-cols-2"
      onSubmit={handleSubmit((v) => {
        if (!owner && v.password.length < 8)
          return setError("password", { message: "Kata sandi sementara minimal 8 karakter." })
        save.mutate(
          { ...v, password: v.password || undefined },
          {
            onSuccess: onNext,
            onError: (e) =>
              Object.entries(e.fields ?? {}).forEach(([k, m]) =>
                setError(k as keyof OwnerForm, { message: m }),
              ),
          },
        )
      })}
    >
      <fieldset disabled={readOnly} className="contents">
        <Field label="Nama Owner" required error={errors.name?.message}>
          <Input {...register("name")} />
        </Field>
        <Field label="Email" required error={errors.email?.message}>
          <Input type="email" {...register("email")} />
        </Field>
        <Field label="Nomor telepon" required error={errors.phone?.message}>
          <Input inputMode="tel" {...register("phone")} />
        </Field>
        <Field
          label="Kata sandi sementara"
          error={errors.password?.message}
          hint={owner ? "Kosongkan bila tidak diganti." : undefined}
        >
          <div className="flex gap-2">
            <Input {...register("password")} readOnly={false} />
            <Button
              type="button"
              variant="secondary"
              onClick={() => setValue("password", generateTempPassword())}
            >
              <RefreshCw className="size-4" aria-hidden />
              Buat otomatis
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={!password}
              onClick={() => {
                void navigator.clipboard?.writeText(password).catch(() => undefined)
                toast.success("Kata sandi disalin.")
              }}
            >
              <Copy className="size-4" aria-hidden />
              Salin
            </Button>
          </div>
        </Field>
      </fieldset>
      <Banner tone="info" className="sm:col-span-2">
        Owner wajib mengganti kata sandi saat masuk pertama.
      </Banner>
      {!readOnly && (
        <div className="sm:col-span-2">
          <Button type="submit" loading={save.isPending}>
            Simpan dan lanjut
          </Button>
        </div>
      )}
    </form>
  )
}

/* ---------------------------- Langkah 3 ---------------------------- */
function DokuStep({ data, readOnly, onNext }: StepProps) {
  const { shop } = data
  const save = useSaveDoku(shop.id)
  const test = useTestDoku(shop.id)
  const [clientId, setClientId] = useState("")
  const [secret, setSecret] = useState("")
  const [mode, setMode] = useState<"sandbox" | "production">(shop.dokuMode)
  const [editing, setEditing] = useState(!shop.doku.credentialsSaved)
  const [error, setError] = useState<string | undefined>()
  const submit = () => {
    if (!clientId.trim() || !secret.trim()) return setError("Client ID dan Secret Key wajib diisi.")
    setError(undefined)
    save.mutate(
      { clientId, secretKey: secret, mode },
      {
        onSuccess: () => {
          setClientId("")
          setSecret("")
          setEditing(false)
        },
        onError: (e) => setError(e.message),
      },
    )
  }
  return (
    <div className="flex max-w-xl flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm">Status:</span>
        {dokuBadge(shop.doku.status)}
        {shop.doku.checkedAt && (
          <span className="text-xs text-slate-600">
            Dicek {formatDateTime(shop.doku.checkedAt)} WIB
          </span>
        )}
      </div>
      <Field label="Mode">
        <Select
          value={mode}
          onValueChange={(v) => setMode(v as "sandbox" | "production")}
          disabled={readOnly || !editing}
          options={[
            { value: "sandbox", label: "Sandbox (uji coba)" },
            { value: "production", label: "Produksi" },
          ]}
        />
      </Field>
      {editing && !readOnly ? (
        <>
          <Banner tone="info">
            Kredensial bersifat write-only. Setelah disimpan, nilainya tidak pernah ditampilkan lagi
            dan hanya bisa diganti.
          </Banner>
          <Field label="Client ID" required error={error}>
            <Input
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
          </Field>
          <Field label="Secret Key" required>
            <Input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              autoComplete="new-password"
              spellCheck={false}
            />
          </Field>
          <div className="flex gap-2">
            <Button onClick={submit} loading={save.isPending}>
              Simpan kredensial
            </Button>
            {shop.doku.credentialsSaved && (
              <Button variant="secondary" onClick={() => setEditing(false)}>
                Batalkan
              </Button>
            )}
          </div>
        </>
      ) : (
        <>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-slate-600">Client ID</dt>
              <dd className="font-medium">Tersimpan</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-600">Secret Key</dt>
              <dd className="font-medium">Tersimpan</dd>
            </div>
          </dl>
          {!readOnly && (
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => test.mutate(undefined)} loading={test.isPending}>
                Tes koneksi
              </Button>
              <Button variant="secondary" onClick={() => setEditing(true)}>
                Ganti
              </Button>
            </div>
          )}
        </>
      )}
      {shop.doku.status === "problem" && (
        <Banner tone="danger">Koneksi bermasalah. Periksa kredensial lalu tes lagi.</Banner>
      )}
      {!readOnly && (
        <div>
          <Button onClick={onNext} disabled={shop.doku.status !== "connected"}>
            Simpan dan lanjut
          </Button>
          {shop.doku.status !== "connected" && (
            <p className="mt-1 text-xs text-slate-600">Tes koneksi harus menghasilkan Terhubung.</p>
          )}
        </div>
      )}
    </div>
  )
}

/* ---------------------------- Langkah 4 ---------------------------- */
function CatalogStep({ data, readOnly, onNext }: StepProps) {
  const save = useSaveCatalog(data.shop.id)
  const navigate = useNavigate()
  const setShop = useActiveShop((s) => s.setShop)
  const [rows, setRows] = useState<CatalogDraftRow[]>(() =>
    data.services.map((s) => ({
      name: s.name,
      category: s.category,
      basePrice: s.basePrice,
      duration: s.duration,
    })),
  )
  const [errors, setErrors] = useState<Record<number, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const patch = (i: number, p: Partial<CatalogDraftRow>) =>
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...p } : r)))
  const submit = () => {
    const errs: Record<number, string> = {}
    rows.forEach((r, i) => {
      if (!r.name.trim()) errs[i] = "Nama layanan wajib diisi."
    })
    setErrors(errs)
    setFormError(rows.length === 0 ? "Isi minimal satu layanan." : null)
    if (rows.length === 0 || Object.keys(errs).length) return
    save.mutate(rows, { onSuccess: onNext, onError: (e) => setFormError(e.message) })
  }
  return (
    <div className="flex flex-col gap-4">
      {!readOnly && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              setShop(data.shop.id)
              navigate("/staf/kelola/katalog")
            }}
          >
            Buka halaman Katalog
          </Button>
        </div>
      )}
      {formError && <Banner tone="danger">{formError}</Banner>}
      {rows.length === 0 ? (
        <p className="text-sm text-slate-600">Belum ada layanan. Tambahkan baris.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((r, i) => (
            <li
              key={i}
              className="grid items-start gap-2 rounded-lg bg-slate-50 p-3 md:grid-cols-[1fr_12rem_9rem_9rem_auto]"
            >
              <Field label="Nama layanan" error={errors[i]}>
                <Input
                  value={r.name}
                  disabled={readOnly}
                  onChange={(e) => patch(i, { name: e.target.value })}
                />
              </Field>
              <Field label="Kategori">
                <Select
                  value={r.category}
                  disabled={readOnly}
                  onValueChange={(v) => patch(i, { category: v as ServiceCategory })}
                  options={CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABEL[c] }))}
                />
              </Field>
              <Field label="Harga (Rp)">
                <Input
                  inputMode="numeric"
                  value={String(r.basePrice)}
                  disabled={readOnly}
                  onChange={(e) =>
                    patch(i, { basePrice: Number(e.target.value.replace(/\D/g, "")) })
                  }
                />
              </Field>
              <Field label="Durasi">
                <Select
                  value={String(r.duration)}
                  disabled={readOnly}
                  onValueChange={(v) => patch(i, { duration: Number(v) })}
                  options={DURATIONS.map((d) => ({
                    value: String(d),
                    label: d === 0 ? "Tanpa tambahan" : `${d} menit`,
                  }))}
                />
              </Field>
              {!readOnly && (
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Hapus ${r.name || "baris"}`}
                    onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {!readOnly && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() =>
              setRows((rs) => [
                ...rs,
                { name: "", category: "haircut", basePrice: 0, duration: 30 },
              ])
            }
          >
            <Plus className="size-4" aria-hidden />
            Tambah layanan
          </Button>
          <Button onClick={submit} loading={save.isPending}>
            Simpan dan lanjut
          </Button>
        </div>
      )}
    </div>
  )
}

/* ---------------------------- Langkah 5 ---------------------------- */
interface BarberDraft {
  name: string
  days: DayHours[]
}
const openDays = (): DayHours[] =>
  Array.from({ length: 7 }, () => ({ open: true, from: "09:00", to: "21:00" }))

function HoursStep({ data, readOnly, onNext }: StepProps) {
  const save = useSaveHours(data.shop.id)
  const [days, setDays] = useState<DayHours[]>(
    () => data.hours?.days.map((d) => ({ ...d })) ?? openDays(),
  )
  const [breakFrom, setBreakFrom] = useState(data.breakFrom ?? "")
  const [breakTo, setBreakTo] = useState(data.breakTo ?? "")
  const [barbers, setBarbers] = useState<BarberDraft[]>(() =>
    data.barbers.length
      ? data.barbers.map((b) => ({
          name: b.barber.name,
          days: b.hours?.days.map((d) => ({ ...d })) ?? openDays(),
        }))
      : [{ name: "", days: openDays() }],
  )
  const [error, setError] = useState<string | null>(null)
  const patchDay = (i: number, p: Partial<DayHours>) =>
    setDays((ds) => ds.map((d, j) => (j === i ? { ...d, ...p } : d)))
  const patchBarberDay = (b: number, i: number, p: Partial<DayHours>) =>
    setBarbers((bs) =>
      bs.map((x, k) =>
        k === b ? { ...x, days: x.days.map((d, j) => (j === i ? { ...d, ...p } : d)) } : x,
      ),
    )

  // Ringkasan slot per hari: jam buka dikurangi istirahat, per 30 menit, dikali jumlah barber yang bekerja.
  const slotsPerDay = useMemo(() => {
    const breakMin =
      breakFrom && breakTo && hhmmToMinutes(breakTo) > hhmmToMinutes(breakFrom)
        ? hhmmToMinutes(breakTo) - hhmmToMinutes(breakFrom)
        : 0
    return ORDER.map((i) => {
      const d = days[i]
      if (!d.open || hhmmToMinutes(d.to) <= hhmmToMinutes(d.from))
        return { day: DAYS[i], perBarber: 0, total: 0 }
      const per = Math.max(
        0,
        Math.floor((hhmmToMinutes(d.to) - hhmmToMinutes(d.from) - breakMin) / 30),
      )
      const working = barbers.filter((b) => b.name.trim() && b.days[i].open).length
      return { day: DAYS[i], perBarber: per, total: per * working }
    })
  }, [days, breakFrom, breakTo, barbers])

  const submit = () => {
    setError(null)
    save.mutate(
      {
        days,
        breakFrom: breakFrom || null,
        breakTo: breakTo || null,
        barbers: barbers.filter((b) => b.name.trim()),
      },
      { onSuccess: onNext, onError: (e) => setError(e.message) },
    )
  }
  return (
    <div className="flex flex-col gap-6">
      {error && <Banner tone="danger">{error}</Banner>}
      <fieldset disabled={readOnly} className="flex flex-col gap-3">
        <legend className="mb-1 font-semibold">Jam buka toko</legend>
        <ul className="divide-y rounded-lg bg-slate-50">
          {ORDER.map((i) => (
            <li
              key={i}
              className="grid min-h-14 grid-cols-[6rem_1fr] items-center gap-3 px-3 py-2 sm:grid-cols-[7rem_auto_1fr]"
            >
              <span className="font-medium">{DAYS[i]}</span>
              <Switch
                checked={days[i].open}
                onCheckedChange={(open) => patchDay(i, { open })}
                label={days[i].open ? "Buka" : "Libur"}
              />
              {days[i].open && (
                <div className="col-span-2 flex items-center gap-2 sm:col-span-1">
                  <Input
                    type="time"
                    step={1800}
                    aria-label={`${DAYS[i]} jam buka`}
                    value={days[i].from}
                    onChange={(e) => patchDay(i, { from: e.target.value })}
                    className="w-32"
                  />
                  <span aria-hidden>-</span>
                  <Input
                    type="time"
                    step={1800}
                    aria-label={`${DAYS[i]} jam tutup`}
                    value={days[i].to}
                    onChange={(e) => patchDay(i, { to: e.target.value })}
                    className="w-32"
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
        <div className="grid max-w-md grid-cols-2 gap-3">
          <Field label="Istirahat mulai (opsional)">
            <Input
              type="time"
              step={1800}
              value={breakFrom}
              onChange={(e) => setBreakFrom(e.target.value)}
            />
          </Field>
          <Field label="Istirahat selesai">
            <Input
              type="time"
              step={1800}
              value={breakTo}
              onChange={(e) => setBreakTo(e.target.value)}
            />
          </Field>
        </div>
      </fieldset>

      <fieldset disabled={readOnly} className="flex flex-col gap-3">
        <legend className="mb-1 font-semibold">Barber awal dan jadwal kerja</legend>
        {barbers.map((b, bi) => (
          <div key={bi} className="flex flex-col gap-3 rounded-lg bg-slate-50 p-3">
            <div className="flex items-end gap-2">
              <Field label={`Nama barber ${bi + 1}`} className="flex-1">
                <Input
                  value={b.name}
                  onChange={(e) =>
                    setBarbers((bs) =>
                      bs.map((x, k) => (k === bi ? { ...x, name: e.target.value } : x)),
                    )
                  }
                />
              </Field>
              {barbers.length > 1 && !readOnly && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Hapus barber ${bi + 1}`}
                  onClick={() => setBarbers((bs) => bs.filter((_, k) => k !== bi))}
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              )}
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {ORDER.map((i) => (
                <li key={i} className="flex min-h-11 items-center gap-2">
                  <Checkbox
                    checked={b.days[i].open && days[i].open}
                    disabled={!days[i].open}
                    onCheckedChange={(c) => patchBarberDay(bi, i, { open: c === true })}
                    label={DAYS[i]}
                    className="w-28"
                  />
                  {b.days[i].open && days[i].open && (
                    <>
                      <Input
                        type="time"
                        step={1800}
                        aria-label={`${DAYS[i]} mulai ${b.name || "barber"}`}
                        value={b.days[i].from}
                        onChange={(e) => patchBarberDay(bi, i, { from: e.target.value })}
                        className="w-28"
                      />
                      <Input
                        type="time"
                        step={1800}
                        aria-label={`${DAYS[i]} selesai ${b.name || "barber"}`}
                        value={b.days[i].to}
                        onChange={(e) => patchBarberDay(bi, i, { to: e.target.value })}
                        className="w-28"
                      />
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
        {!readOnly && (
          <div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setBarbers((bs) => [...bs, { name: "", days: openDays() }])}
            >
              <Plus className="size-4" aria-hidden />
              Tambah barber
            </Button>
          </div>
        )}
      </fieldset>

      <section aria-labelledby="slot-hari" className="rounded-lg bg-slate-50 p-3">
        <h3 id="slot-hari" className="mb-2 text-sm font-semibold">
          Slot per hari
        </h3>
        <ul className="grid gap-1 text-sm sm:grid-cols-2">
          {slotsPerDay.map((s) => (
            <li key={s.day} className="flex justify-between">
              <span>{s.day}</span>
              <span className="text-slate-700">
                {s.perBarber === 0 ? "Libur" : `${s.perBarber} slot per barber, ${s.total} total`}
              </span>
            </li>
          ))}
        </ul>
      </section>
      {!readOnly && (
        <div>
          <Button onClick={submit} loading={save.isPending}>
            Simpan dan lanjut
          </Button>
        </div>
      )}
    </div>
  )
}

/* ---------------------------- Langkah 6 ---------------------------- */
function PaymentStep({ data, readOnly, onNext }: StepProps) {
  const { shop } = data
  const step = usePaymentTestStep(shop.id)
  const done = useCompletePaymentTest(shop.id)
  const [amount, setAmount] = useState(String(shop.paymentTest.amount))
  const [pass, setPass] = useState(shop.setup.paymentTested)
  const [error, setError] = useState<string | undefined>()
  const blocked = !shop.setup.dokuConnected
  const { feeCreated, refunded } = shop.paymentTest
  const run = (s: "create" | "refund") => {
    setError(undefined)
    step.mutate(
      { step: s, amount: Number(amount) },
      { onError: (e) => setError(e.fields?.amount ?? e.message) },
    )
  }
  return (
    <div className="flex max-w-xl flex-col gap-4">
      {blocked && <Banner tone="warning">Hubungkan merchant DOKU lebih dulu (langkah 3).</Banner>}
      <p className="text-sm text-slate-700">
        Simulasi bertahap: buat booking fee uji bernominal kecil, lalu refund uji, kemudian tandai
        lulus.
      </p>
      <Field label="Nominal booking fee uji (Rp)" error={error}>
        <Input
          inputMode="numeric"
          value={amount}
          disabled={readOnly || feeCreated}
          onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
        />
      </Field>
      <ol className="flex flex-col gap-2">
        <li className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 p-3">
          <span className="text-sm">
            <strong>1. Booking fee uji</strong>{" "}
            {feeCreated ? (
              <Badge tone="primary">
                Berhasil <MoneyText value={shop.paymentTest.amount} />
              </Badge>
            ) : (
              <Badge tone="slate">Belum dibuat</Badge>
            )}
          </span>
          <Button
            variant="secondary"
            disabled={readOnly || blocked || feeCreated}
            loading={step.isPending && !feeCreated}
            onClick={() => run("create")}
          >
            Buat booking fee uji
          </Button>
        </li>
        <li className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 p-3">
          <span className="text-sm">
            <strong>2. Refund uji</strong>{" "}
            {refunded ? (
              <Badge tone="primary">Selesai</Badge>
            ) : (
              <Badge tone="slate">{feeCreated ? "Menunggu" : "Belum bisa"}</Badge>
            )}
          </span>
          <Button
            variant="secondary"
            disabled={readOnly || !feeCreated || refunded}
            loading={step.isPending && feeCreated && !refunded}
            onClick={() => run("refund")}
          >
            Refund uji
          </Button>
        </li>
      </ol>
      <Checkbox
        checked={pass}
        disabled={readOnly || !(feeCreated && refunded)}
        onCheckedChange={(c) => setPass(c === true)}
        label="Tandai lulus"
      />
      {!readOnly && (
        <div>
          <Button
            disabled={!pass || !(feeCreated && refunded)}
            loading={done.isPending}
            onClick={() => done.mutate(undefined, { onSuccess: onNext })}
          >
            Simpan dan lanjut
          </Button>
        </div>
      )}
    </div>
  )
}

/* ---------------------------- Langkah 7 ---------------------------- */
function OpenStep({ data, onGoto }: { data: ShopSetupData; onGoto: (i: number) => void }) {
  const open = useOpenShop(data.shop.id)
  const setup = computeSetup(data.shop)
  const [error, setError] = useState<string | null>(null)
  if (data.shop.status === "open")
    return <Banner tone="success">Toko sudah dibuka ke publik.</Banner>
  if (data.shop.status === "frozen")
    return (
      <Banner tone="info">
        Toko sedang dibekukan. Gunakan menu aksi toko untuk mengaktifkannya kembali.
      </Banner>
    )
  return (
    <div className="flex max-w-xl flex-col gap-4">
      <ul className="divide-y rounded-lg bg-slate-50">
        {setup.steps.slice(0, 6).map((s, i) => (
          <li key={s.key} className="flex min-h-11 items-center justify-between gap-2 px-3">
            <span className="text-sm">
              {i + 1}. {s.label}
            </span>
            <span className="flex items-center gap-2">
              {s.done ? <Badge tone="primary">Selesai</Badge> : <Badge tone="warning">Belum</Badge>}
              <Button size="sm" variant="ghost" onClick={() => onGoto(i)}>
                {s.done ? "Lihat" : "Isi"}
              </Button>
            </span>
          </li>
        ))}
      </ul>
      {!setup.canOpen && (
        <Banner tone="warning" title="Langkah yang masih kurang">
          <ul className="list-disc pl-5">
            {setup.missing.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </Banner>
      )}
      {error && <Banner tone="danger">{error}</Banner>}
      <div>
        <Button
          disabled={!setup.canOpen}
          loading={open.isPending}
          onClick={() => open.mutate(undefined, { onError: (e) => setError(e.message) })}
        >
          Buka toko
        </Button>
      </div>
    </div>
  )
}
