import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useLocation, useNavigate } from "react-router"
import { z } from "zod"
import { ApiError } from "@/shared/api"
import { Banner, Button, Card, CardContent, Dialog, Field, Input } from "@/shared/components"
import { buttonVariants } from "@/shared/components/ui/button"
import { usePageMeta } from "@/shared/hooks"
import { normalizePhone } from "@/shared/domain/phone"
import { formatPhone } from "@/shared/utils/format"
import { waLink } from "@/shared/lib/wa-link"
import { restoreSession, safeNext, useSession } from "@/features/auth"
import { useShopInfo } from "@/features/shop-info"
import { useCompleteProfile, useCustomerProfile } from "../hooks"

const schema = z.object({
  name: z.string().trim().min(2, "Nama wajib diisi."),
  phone: z
    .string()
    .refine(
      (v) => normalizePhone(v) !== null,
      "Nomor WhatsApp tidak valid. Contoh: 0812 3456 7890.",
    ),
})
type Form = z.infer<typeof schema>

export function CompleteProfile() {
  usePageMeta("Lengkapi profil")
  const navigate = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from
  const displayName = useSession((s) => s.session?.displayName ?? "")
  const profile = useCustomerProfile()
  const shop = useShopInfo()
  const save = useCompleteProfile()
  const [confirm, setConfirm] = useState<Form | null>(null)
  const [inUse, setInUse] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    values: { name: profile.data?.name ?? displayName, phone: "" },
    resetOptions: { keepDirtyValues: true },
  })

  const submit = (v: Form) => {
    const phone = normalizePhone(v.phone)
    if (!phone) return
    setFormError(null)
    setInUse(false)
    save.mutate(
      { name: v.name.trim(), phone },
      {
        onSuccess: async () => {
          setConfirm(null)
          await restoreSession()
          navigate(safeNext(from) ?? "/", { replace: true })
        },
        onError: (e) => {
          setConfirm(null)
          const err = ApiError.from(e)
          if (err.code === "PHONE_IN_USE") setInUse(true)
          else setFormError(err.message)
        },
      },
    )
  }

  const shown = confirm ? formatPhone(normalizePhone(confirm.phone) ?? confirm.phone) : ""
  return (
    <Card>
      <CardContent className="flex flex-col gap-5 p-5">
        <div>
          <h1 className="text-title font-semibold text-slate-900">Lengkapi profil</h1>
          <p className="mt-1 text-sm text-slate-600">
            Toko memakai nomor WhatsApp ini untuk menghubungi Anda tentang booking.
          </p>
        </div>
        {inUse && (
          <Banner
            tone="warning"
            title="Nomor ini sudah terdaftar di akun lain. Hubungi toko atau Loque."
          >
            {shop.data?.whatsapp && (
              <a
                href={waLink(
                  shop.data.whatsapp,
                  "Halo, nomor saya sudah terdaftar di akun lain. Mohon bantuannya.",
                )}
                target="_blank"
                rel="noreferrer"
                className={`${buttonVariants({ variant: "secondary", size: "sm" })} mt-2`}
              >
                WhatsApp toko
              </a>
            )}
          </Banner>
        )}
        {formError && <Banner tone="danger">{formError}</Banner>}
        <form
          onSubmit={(e) => void handleSubmit((v) => setConfirm(v))(e)}
          className="flex flex-col gap-4"
          noValidate
        >
          <Field label="Nama" required error={errors.name?.message}>
            <Input autoComplete="name" {...register("name")} />
          </Field>
          <Field
            label="Nomor WhatsApp"
            required
            error={errors.phone?.message}
            hint="Boleh diawali 08, +62, atau 62."
          >
            <Input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="0812 3456 7890"
              {...register("phone")}
            />
          </Field>
          <Button type="submit">Lanjut</Button>
        </form>
      </CardContent>
      <Dialog
        open={confirm !== null}
        onOpenChange={(o) => !o && setConfirm(null)}
        title="Nomor ini benar?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirm(null)} disabled={save.isPending}>
              Ubah
            </Button>
            <Button loading={save.isPending} onClick={() => confirm && submit(confirm)}>
              Ya, benar
            </Button>
          </>
        }
      >
        <p className="text-center text-title font-semibold tabular-nums text-slate-900">{shown}</p>
      </Dialog>
    </Card>
  )
}
