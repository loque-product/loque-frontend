import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, ImagePlus } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { Link } from "react-router"
import { z } from "zod"
import { ApiError } from "@/shared/api"
import {
  Async,
  Avatar,
  Banner,
  Button,
  Card,
  CardContent,
  Checkbox,
  Field,
  ImageWithFallback,
  PageSkeleton,
  Textarea,
} from "@/shared/components"
import { buttonVariants } from "@/shared/components/ui/button"
import { useOnlineStatus, usePageMeta } from "@/shared/hooks"
import { ImageError, type CompressedImage } from "@/shared/lib/image-compress"
import {
  PortfolioManager,
  prepareImage,
  uploadCompressed,
  type UploadPurpose,
} from "@/features/portfolio"
import { useBarberMe, useUpdateBarberProfile } from "../hooks"
import type { BarberMe } from "../types"

const BIO_MAX = 300
const schema = z.object({
  bio: z.string().trim().max(BIO_MAX, `Bio maksimal ${BIO_MAX} karakter.`),
  specialties: z.array(z.string()).min(1, "Pilih minimal satu spesialisasi."),
})
type Form = z.infer<typeof schema>

interface Picked {
  image: CompressedImage
  preview: string
}

/** Memilih foto, mengompres di peramban, dan menyimpan pratinjau lokal sampai profil disimpan. */
function useImagePick() {
  const [picked, setPicked] = useState<Picked | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  useEffect(() => () => void (picked && URL.revokeObjectURL(picked.preview)), [picked])
  const pick = async (file: File | undefined) => {
    if (!file) return
    setError(null)
    setBusy(true)
    try {
      const image = await prepareImage(file)
      setPicked({ image, preview: URL.createObjectURL(image.blob) })
    } catch (e) {
      setError(e instanceof ImageError ? e.message : "Foto tidak bisa diproses. Coba foto lain.")
    } finally {
      setBusy(false)
    }
  }
  return { picked, error, busy, pick, clear: () => setPicked(null) }
}

function PickButton({
  label,
  busy,
  onFile,
}: {
  label: string
  busy: boolean
  onFile: (f: File | undefined) => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        aria-label={label}
        tabIndex={-1}
        className="sr-only"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      <Button variant="secondary" size="sm" loading={busy} onClick={() => ref.current?.click()}>
        <ImagePlus className="size-4" aria-hidden />
        {label}
      </Button>
    </>
  )
}

function ProfileForm({ me }: { me: BarberMe }) {
  const update = useUpdateBarberProfile()
  const online = useOnlineStatus()
  const photo = useImagePick()
  const cover = useImagePick()
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { bio: me.bio, specialties: me.specialties },
  })
  const bio = useWatch({ control, name: "bio" })
  const changed = isDirty || photo.picked !== null || cover.picked !== null

  const submit = handleSubmit(async (v) => {
    setError(null)
    setSaving(true)
    try {
      const photoKey = photo.picked
        ? await uploadCompressed("avatar" satisfies UploadPurpose, photo.picked.image)
        : undefined
      const coverKey = cover.picked
        ? await uploadCompressed("cover" satisfies UploadPurpose, cover.picked.image)
        : undefined
      await update.mutateAsync({
        bio: v.bio.trim(),
        specialties: v.specialties,
        photoKey,
        coverKey,
      })
      photo.clear()
      cover.clear()
    } catch (e) {
      setError(ApiError.from(e).message)
    } finally {
      setSaving(false)
    }
  })

  return (
    <form onSubmit={(e) => void submit(e)} className="flex flex-col gap-4" noValidate>
      {error && <Banner tone="danger">{error}</Banner>}
      <div className="flex flex-col gap-2">
        <ImageWithFallback
          src={cover.picked?.preview ?? me.coverUrl}
          alt="Sampul profil"
          ratio={3}
          className="w-full rounded-lg"
        />
        <div className="flex items-center gap-3">
          <Avatar
            name={me.name}
            src={photo.picked?.preview ?? me.photoUrl}
            className="size-16 rounded-lg"
          />
          <div className="flex flex-wrap gap-2">
            <PickButton label="Ganti foto" busy={photo.busy} onFile={(f) => void photo.pick(f)} />
            <PickButton label="Ganti sampul" busy={cover.busy} onFile={(f) => void cover.pick(f)} />
          </div>
        </div>
        {(photo.error || cover.error) && (
          <p role="alert" className="text-sm text-danger-700">
            {photo.error ?? cover.error}
          </p>
        )}
      </div>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-slate-600">Nama</dt>
          <dd className="font-medium text-slate-900">{me.name}</dd>
        </div>
        <div>
          <dt className="text-slate-600">Toko</dt>
          <dd className="font-medium text-slate-900">{me.shopName ?? "Belum terhubung"}</dd>
        </div>
      </dl>
      <Field
        label="Bio"
        hint={`${bio.length} dari ${BIO_MAX} karakter`}
        error={errors.bio?.message}
      >
        <Textarea maxLength={BIO_MAX + 50} {...register("bio")} />
      </Field>
      <fieldset>
        <legend className="mb-1 text-sm font-medium text-slate-700">Spesialisasi</legend>
        <Controller
          control={control}
          name="specialties"
          render={({ field }) => (
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {me.specialtyOptions.map((o) => (
                <Checkbox
                  key={o}
                  label={o}
                  checked={field.value.includes(o)}
                  onCheckedChange={(on) =>
                    field.onChange(
                      on === true ? [...field.value, o] : field.value.filter((x) => x !== o),
                    )
                  }
                />
              ))}
            </div>
          )}
        />
        {errors.specialties && (
          <p role="alert" className="text-xs text-danger-700">
            {errors.specialties.message}
          </p>
        )}
      </fieldset>
      <Button type="submit" loading={saving} disabled={!changed || !online}>
        Simpan profil
      </Button>
    </form>
  )
}

export function BarberProfileView() {
  usePageMeta("Profil")
  const q = useBarberMe()
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-title font-semibold text-slate-900">Profil</h1>
        <Link
          to="/barber/profil/pratinjau"
          className={buttonVariants({ variant: "secondary", size: "sm" })}
        >
          <Eye className="size-4" aria-hidden />
          Pratinjau customer
        </Link>
      </div>
      <Card>
        <CardContent>
          <Async query={q} skeleton={<PageSkeleton rows={4} />}>
            {(me) => (
              <ProfileForm
                key={`${me.bio}|${me.specialties.join()}|${me.photoUrl}|${me.coverUrl}`}
                me={me}
              />
            )}
          </Async>
        </CardContent>
      </Card>
      <PortfolioManager />
    </div>
  )
}
