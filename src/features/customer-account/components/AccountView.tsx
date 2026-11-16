import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronRight } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router"
import { z } from "zod"
import { ApiError } from "@/shared/api"
import {
  Async,
  Banner,
  Button,
  Card,
  CardContent,
  ConfirmDialog,
  Dialog,
  Field,
  Input,
  PageSkeleton,
} from "@/shared/components"
import { usePageMeta, useOnlineStatus } from "@/shared/hooks"
import { normalizePhone } from "@/shared/domain/phone"
import { formatPhone } from "@/shared/utils/format"
import { restoreSession, signOut } from "@/features/auth"
import { useDeleteAccount, useUpdateProfile } from "../hooks"
import { useCustomerProfile } from "../hooks"
import type { CustomerProfile } from "../types"

const schema = z.object({
  name: z.string().trim().min(2, "Nama wajib diisi."),
  phone: z.string().refine((v) => normalizePhone(v) !== null, "Nomor WhatsApp tidak valid."),
})
type Form = z.infer<typeof schema>

function ProfileForm({ p }: { p: CustomerProfile }) {
  const update = useUpdateProfile()
  const online = useOnlineStatus()
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { name: p.name, phone: p.phone ? formatPhone(p.phone) : "" },
  })
  const submit = handleSubmit((v) => {
    setError(null)
    update.mutate(
      { name: v.name.trim(), phone: normalizePhone(v.phone)! },
      {
        onSuccess: () => void restoreSession(),
        onError: (e) => setError(ApiError.from(e).message),
      },
    )
  })
  return (
    <form onSubmit={(e) => void submit(e)} className="flex flex-col gap-4" noValidate>
      {error && <Banner tone="danger">{error}</Banner>}
      <Field label="Nama" error={errors.name?.message}>
        <Input autoComplete="name" {...register("name")} />
      </Field>
      <Field label="Nomor WhatsApp" error={errors.phone?.message}>
        <Input type="tel" inputMode="tel" autoComplete="tel" {...register("phone")} />
      </Field>
      <Field label="Email" hint="Dari akun Google; tidak bisa diubah.">
        <Input value={p.email} readOnly disabled />
      </Field>
      <Button type="submit" loading={update.isPending} disabled={!isDirty || !online}>
        Simpan
      </Button>
    </form>
  )
}

const LINKS = [
  { to: "/bantuan", label: "Bantuan" },
  { to: "/syarat", label: "Syarat penggunaan" },
  { to: "/privasi", label: "Kebijakan privasi" },
  { to: "/ulasan-saya", label: "Ulasan saya" },
]

export function AccountView() {
  usePageMeta("Akun")
  const q = useCustomerProfile()
  const navigate = useNavigate()
  const online = useOnlineStatus()
  const del = useDeleteAccount()
  const [delOpen, setDelOpen] = useState(false)
  const [typed, setTyped] = useState("")
  const [delError, setDelError] = useState<string | null>(null)
  const [logoutOpen, setLogoutOpen] = useState(false)

  const confirmDelete = () => {
    setDelError(null)
    del.mutate(typed, {
      onSuccess: async () => {
        setDelOpen(false)
        await restoreSession()
        navigate("/", { replace: true })
      },
      onError: (e) => {
        const err = ApiError.from(e)
        setDelError(
          err.code === "HAS_UPCOMING_BOOKINGS" ? "Batalkan booking mendatang dulu." : err.message,
        )
      },
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-title font-semibold text-slate-900">Akun</h1>
      <Card>
        <CardContent className="p-4">
          <Async query={q} skeleton={<PageSkeleton rows={3} />}>
            {(p) => <ProfileForm key={p.id + p.name + p.phone} p={p} />}
          </Async>
        </CardContent>
      </Card>
      <ul className="divide-y rounded-xl bg-white px-4 shadow-card">
        {LINKS.map((l) => (
          <li key={l.to}>
            <Link
              to={l.to}
              className="flex min-h-11 items-center justify-between py-3 text-sm text-slate-900"
            >
              {l.label}
              <ChevronRight className="size-4 text-slate-500" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-2">
        <Button variant="secondary" onClick={() => setLogoutOpen(true)}>
          Keluar
        </Button>
        <Button
          variant="ghost"
          className="text-danger-700"
          disabled={!online}
          onClick={() => {
            setTyped("")
            setDelError(null)
            setDelOpen(true)
          }}
        >
          Hapus akun dan data
        </Button>
      </div>

      <ConfirmDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title="Keluar dari akun?"
        confirmLabel="Keluar"
        onConfirm={async () => {
          await signOut()
          navigate("/", { replace: true })
        }}
      />
      <Dialog
        open={delOpen}
        onOpenChange={setDelOpen}
        title="Hapus akun dan data"
        description="Akun, riwayat, dan ulasan Anda dihapus dan tidak bisa dipulihkan."
        footer={
          <>
            <Button variant="secondary" onClick={() => setDelOpen(false)} disabled={del.isPending}>
              Batalkan
            </Button>
            <Button
              variant="danger"
              loading={del.isPending}
              disabled={typed !== "HAPUS"}
              onClick={confirmDelete}
            >
              Hapus akun
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          {delError && <Banner tone="danger">{delError}</Banner>}
          <Field label='Ketik "HAPUS" untuk melanjutkan'>
            <Input value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
          </Field>
        </div>
      </Dialog>
    </div>
  )
}
