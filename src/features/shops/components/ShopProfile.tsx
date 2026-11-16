import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2, ImagePlus, OctagonAlert } from "lucide-react"
import { useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Async,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DateTimeText,
  Field,
  Input,
  Skeleton,
  Textarea,
} from "@/shared/components"
import { DAY_LABELS } from "./labels"
import { useSchedule } from "@/features/schedule"
import { useAddGalleryPhoto, useDokuStatus, useShopProfile, useUpdateProfile } from "../hooks"
import type { ShopProfileInput } from "../types"

const schema = z.object({
  name: z.string().min(1, "Nama toko wajib diisi."),
  address: z.string().min(1, "Alamat wajib diisi."),
  whatsapp: z.string().min(1, "Nomor WhatsApp wajib diisi."),
  instagram: z.string(),
  tiktok: z.string(),
})

export function ShopProfile() {
  const q = useShopProfile()
  return (
    <Async query={q} skeleton={<Skeleton className="h-96" />}>
      {(shop) => <Content shop={shop} />}
    </Async>
  )
}

function Content({ shop }: { shop: NonNullable<ReturnType<typeof useShopProfile>["data"]> }) {
  const update = useUpdateProfile()
  const add = useAddGalleryPhoto()
  const doku = useDokuStatus()
  const schedule = useSchedule()
  const file = useRef<HTMLInputElement>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ShopProfileInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: shop.name,
      address: shop.address,
      whatsapp: shop.whatsapp,
      instagram: shop.instagram,
      tiktok: shop.tiktok,
    },
  })
  useEffect(
    () =>
      reset({
        name: shop.name,
        address: shop.address,
        whatsapp: shop.whatsapp,
        instagram: shop.instagram,
        tiktok: shop.tiktok,
      }),
    [shop, reset],
  )
  const days = schedule.data?.shopHours.days
  const summary = days
    ? days.every((d) => d.open && d.from === days[0].from && d.to === days[0].to)
      ? `Buka setiap hari ${days[0].from.replace(":", ".")} sampai ${days[0].to.replace(":", ".")} WIB`
      : days
          .map(
            (d, i) =>
              `${DAY_LABELS[i]} ${
                d.open ? `${d.from.replace(":", ".")}-${d.to.replace(":", ".")}` : "tutup"
              }`,
          )
          .join(", ")
    : "..."

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Profil toko</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit((v) => update.mutate(v))}
            className="flex flex-col gap-4"
            noValidate
          >
            <Field label="Nama toko" required error={errors.name?.message}>
              <Input {...register("name")} />
            </Field>
            <Field label="Alamat" required error={errors.address?.message}>
              <Textarea {...register("address")} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="WhatsApp toko" required error={errors.whatsapp?.message}>
                <Input inputMode="tel" {...register("whatsapp")} />
              </Field>
              <Field label="Instagram">
                <Input {...register("instagram")} />
              </Field>
              <Field label="TikTok">
                <Input {...register("tiktok")} />
              </Field>
            </div>
            <Field label="Jam buka" hint="Diatur di Kelola, Jadwal.">
              <Input value={summary} readOnly disabled />
            </Field>
            <div>
              <Button type="submit" loading={update.isPending} disabled={!isDirty}>
                Simpan profil
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Status DOKU</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Async query={doku} skeleton={<Skeleton className="h-16" />}>
              {(d) => (
                <>
                  {d.status === "connected" ? (
                    <Badge tone="primary" className="w-fit">
                      <CheckCircle2 className="size-3.5" aria-hidden />
                      Terhubung
                    </Badge>
                  ) : (
                    <Badge tone="danger" className="w-fit">
                      <OctagonAlert className="size-3.5" aria-hidden />
                      Bermasalah
                    </Badge>
                  )}
                  <p className="text-sm text-slate-600">
                    {d.checkedAt ? (
                      <>
                        Pengecekan terakhir <DateTimeText value={d.checkedAt} />.
                      </>
                    ) : (
                      "Belum pernah dicek."
                    )}
                  </p>
                </>
              )}
            </Async>
            <p className="text-sm text-slate-600">Kredensial dikelola oleh tim Loque.</p>
          </CardContent>
        </Card>
      </div>
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Foto dan galeri</CardTitle>
          <>
            <input
              ref={file}
              type="file"
              accept="image/*"
              className="sr-only"
              aria-label="Pilih foto"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) add.mutate(f.name.replace(/\.[^.]+$/, ""))
                e.target.value = ""
              }}
            />
            <Button
              variant="secondary"
              onClick={() => file.current?.click()}
              loading={add.isPending}
            >
              <ImagePlus className="size-4" aria-hidden />
              Unggah foto
            </Button>
          </>
        </CardHeader>
        <CardContent>
          {shop.gallery.length === 0 ? (
            <p className="text-sm text-slate-600">Belum ada foto.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {shop.gallery.map((src, i) => (
                <li key={i}>
                  <img
                    loading="lazy"
                    decoding="async"
                    src={src}
                    alt={`Foto galeri ${i + 1}`}
                    className="aspect-4/3 w-full rounded-lg object-cover"
                  />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
