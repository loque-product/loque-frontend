import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronRight } from "lucide-react"
import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { useNavigate } from "react-router"
import { z } from "zod"
import { ApiError } from "@/shared/api"
import {
  Async,
  Badge,
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
import { useOnlineStatus, usePageMeta } from "@/shared/hooks"
import { formatDate } from "@/shared/utils/format"
import { restoreSession, signOut, useChangePassword } from "@/features/auth"
import { useBarberMe, useDeleteBarberAccount, useUpdateBarberEmail } from "../hooks"
import { MIN_PASSWORD } from "../domain/password"
import type { BarberMe } from "../types"
import { Strength } from "./FirstPasswordView"
import { StaffTermsSheet } from "./StaffTerms"

const emailSchema = z.object({
  email: z.string().trim().min(1, "Email wajib diisi.").email("Format email tidak valid."),
})
const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, "Isi kata sandi saat ini."),
    password: z.string().min(MIN_PASSWORD, `Kata sandi minimal ${MIN_PASSWORD} karakter.`),
    confirm: z.string().min(1, "Ulangi kata sandi baru."),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Kata sandi tidak sama." })

function EmailForm({ me }: { me: BarberMe }) {
  const update = useUpdateBarberEmail()
  const online = useOnlineStatus()
  const [confirm, setConfirm] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: me.email },
  })
  return (
    <>
      <form
        onSubmit={(e) => void handleSubmit((v) => setConfirm(v.email.trim()))(e)}
        className="flex flex-col gap-3"
        noValidate
      >
        {error && <Banner tone="danger">{error}</Banner>}
        <Field label="Email" hint="Dipakai untuk masuk." error={errors.email?.message}>
          <Input type="email" autoComplete="email" {...register("email")} />
        </Field>
        <Button
          type="submit"
          variant="secondary"
          className="self-start"
          disabled={!isDirty || !online}
        >
          Ubah email
        </Button>
      </form>
      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(o) => !o && setConfirm(null)}
        title="Ubah email?"
        description={`Mulai sekarang Anda masuk dengan ${confirm}.`}
        confirmLabel="Ubah email"
        loading={update.isPending}
        onConfirm={() =>
          confirm &&
          update.mutate(confirm, {
            onSuccess: () => setConfirm(null),
            onError: (e) => {
              setConfirm(null)
              setError(
                e.code === "VALIDATION" ? "Email tidak bisa dipakai. Coba email lain." : e.message,
              )
            },
          })
        }
      />
    </>
  )
}

function PasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const change = useChangePassword()
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { oldPassword: "", password: "", confirm: "" },
  })
  const password = useWatch({ control, name: "password" })
  const close = (o: boolean) => {
    if (!o) {
      reset()
      setError(null)
    }
    onOpenChange(o)
  }
  const submit = handleSubmit((v) => {
    setError(null)
    change.mutate(
      { oldPassword: v.oldPassword, newPassword: v.password },
      {
        onSuccess: () => close(false),
        onError: (e) =>
          setError(
            e.code === "VALIDATION" || e.code === "FORBIDDEN"
              ? "Kata sandi saat ini salah."
              : e.message,
          ),
      },
    )
  })
  return (
    <Dialog
      open={open}
      onOpenChange={close}
      title="Ganti kata sandi"
      footer={
        <>
          <Button variant="secondary" onClick={() => close(false)}>
            Batalkan
          </Button>
          <Button loading={change.isPending} onClick={() => void submit()}>
            Simpan kata sandi
          </Button>
        </>
      }
    >
      <form onSubmit={(e) => void submit(e)} className="flex flex-col gap-3" noValidate>
        {error && <Banner tone="danger">{error}</Banner>}
        <Field label="Kata sandi saat ini" error={errors.oldPassword?.message}>
          <Input type="password" autoComplete="current-password" {...register("oldPassword")} />
        </Field>
        <Field
          label="Kata sandi baru"
          hint={`Minimal ${MIN_PASSWORD} karakter.`}
          error={errors.password?.message}
        >
          <Input type="password" autoComplete="new-password" {...register("password")} />
        </Field>
        <Strength value={password} />
        <Field label="Ulangi kata sandi baru" error={errors.confirm?.message}>
          <Input type="password" autoComplete="new-password" {...register("confirm")} />
        </Field>
        <button type="submit" className="sr-only" tabIndex={-1}>
          Simpan
        </button>
      </form>
    </Dialog>
  )
}

function Row({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex min-h-11 w-full items-center justify-between py-3 text-left text-sm text-slate-900"
      >
        {children}
        <ChevronRight className="size-4 text-slate-500" aria-hidden />
      </button>
    </li>
  )
}

export function BarberAccountView() {
  usePageMeta("Akun")
  const q = useBarberMe()
  const navigate = useNavigate()
  const online = useOnlineStatus()
  const del = useDeleteBarberAccount()
  const [terms, setTerms] = useState<null | "Syarat staf" | "Privasi">(null)
  const [password, setPassword] = useState(false)
  const [logout, setLogout] = useState(false)
  const [delOpen, setDelOpen] = useState(false)
  const [typed, setTyped] = useState("")
  const [delError, setDelError] = useState<string | null>(null)

  const confirmDelete = () => {
    setDelError(null)
    del.mutate(typed, {
      onSuccess: async () => {
        setDelOpen(false)
        await restoreSession()
        navigate("/staf/masuk", { replace: true })
      },
      onError: (e) => {
        const err = ApiError.from(e)
        setDelError(
          err.code === "HAS_UPCOMING_BOOKINGS"
            ? "Masih ada booking mendatang. Minta Admin memindahkan atau membatalkannya dulu."
            : err.message,
        )
      },
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-title font-semibold text-slate-900">Akun</h1>
      <Async query={q} skeleton={<PageSkeleton rows={4} />}>
        {(me) => (
          <>
            <Card>
              <CardContent className="flex flex-col gap-4">
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-slate-600">Nama</dt>
                    <dd className="font-medium text-slate-900">{me.name}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-600">Keanggotaan toko</dt>
                    <dd className="flex flex-wrap items-center gap-2 font-medium text-slate-900">
                      {me.shopName ?? "Belum terhubung"}
                      {me.shopName && (
                        <Badge tone={me.membership.active ? "primary" : "slate"}>
                          {me.membership.active ? "Aktif" : "Nonaktif"}
                        </Badge>
                      )}
                    </dd>
                    {me.membership.since && (
                      <dd className="text-xs text-slate-600">
                        Sejak {formatDate(me.membership.since)}
                      </dd>
                    )}
                  </div>
                </dl>
                <EmailForm key={me.email} me={me} />
              </CardContent>
            </Card>
            <ul className="divide-y rounded-xl bg-white px-4 shadow-card">
              <Row onClick={() => setPassword(true)}>Ganti kata sandi</Row>
              <Row onClick={() => setTerms("Syarat staf")}>Syarat staf</Row>
              <Row onClick={() => setTerms("Privasi")}>Privasi dan data pribadi</Row>
            </ul>
          </>
        )}
      </Async>
      <div className="flex flex-col gap-2">
        <Button variant="secondary" onClick={() => setLogout(true)}>
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

      <PasswordDialog open={password} onOpenChange={setPassword} />
      <StaffTermsSheet
        open={terms !== null}
        onOpenChange={(o) => !o && setTerms(null)}
        title={terms ?? "Syarat staf"}
      />
      <ConfirmDialog
        open={logout}
        onOpenChange={setLogout}
        title="Keluar dari akun?"
        confirmLabel="Keluar"
        onConfirm={async () => {
          await signOut()
          navigate("/staf/masuk", { replace: true })
        }}
      />
      <Dialog
        open={delOpen}
        onOpenChange={setDelOpen}
        title="Hapus akun dan data"
        description="Akun, profil, portofolio, dan tautan Anda dihapus dan tidak bisa dipulihkan."
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
