import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useLocation, useNavigate } from "react-router"
import { z } from "zod"
import { Button, Card, CardContent, Field, Input } from "@/shared/components"
import { ApiError } from "@/shared/api"
import { ROLE_HOME } from "@/shared/constants"
import { getSession, signIn, useRequestPasswordReset } from "@/features/auth"

const schema = z.object({
  email: z.string().min(1, "Email wajib diisi.").email("Format email tidak valid."),
  password: z.string().min(1, "Kata sandi wajib diisi."),
})
type Form = z.infer<typeof schema>

const resetSchema = z.object({
  email: z.string().min(1, "Email wajib diisi.").email("Format email tidak valid."),
})

/** Jawaban selalu netral agar tidak membuka email mana yang terdaftar. */
function ForgotPassword({ onBack }: { onBack: () => void }) {
  const reset = useRequestPasswordReset()
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>({ resolver: zodResolver(resetSchema) })
  const submit = handleSubmit(async ({ email }) => {
    setError(null)
    try {
      await reset.mutateAsync(email)
      setSent(true)
    } catch (e) {
      const err = ApiError.from(e)
      if (err.code === "RATE_LIMITED" || err.code === "NETWORK") setError(err.message)
      else setSent(true)
    }
  })
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-title font-semibold text-slate-900">Lupa kata sandi</h1>
        <p className="mt-1 text-sm text-slate-600">Masukkan email akun Anda.</p>
      </div>
      {sent ? (
        <p role="status" className="text-sm text-slate-800">
          Jika email terdaftar, tautan reset dikirim.
        </p>
      ) : (
        <form onSubmit={(e) => void submit(e)} className="flex flex-col gap-4" noValidate>
          <Field label="Email" error={errors.email?.message}>
            <Input
              type="email"
              autoComplete="email"
              placeholder="nama@toko.id"
              {...register("email")}
            />
          </Field>
          {error && (
            <p role="alert" className="text-sm text-danger-700">
              {error}
            </p>
          )}
          <Button type="submit" loading={reset.isPending}>
            Kirim tautan reset
          </Button>
        </form>
      )}
      <Button type="button" variant="ghost" onClick={onBack}>
        Kembali ke masuk
      </Button>
    </div>
  )
}

export default function LoginRoute() {
  const [forgot, setForgot] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) })

  const submit = handleSubmit(async (v) => {
    setFormError(null)
    try {
      await signIn(v.email, v.password)
    } catch (e) {
      const err = ApiError.from(e)
      setFormError(
        err.code === "RATE_LIMITED"
          ? err.message
          : err.code === "NETWORK"
            ? err.message
            : "Email atau kata sandi salah.",
      )
      return
    }
    const session = getSession()
    if (!session) return
    if (session.mustChangePassword) {
      navigate("/staf/ganti-password", { replace: true })
      return
    }
    // Guard rute memutuskan akses; tujuan awal dipakai selama bukan halaman masuk.
    const target =
      from && from !== "/" && !from.startsWith("/masuk") && !from.startsWith("/staf/masuk")
        ? from
        : undefined
    navigate(target ?? ROLE_HOME[session.role], { replace: true })
  })

  return (
    <Card className="w-full max-w-xl">
      <CardContent className="flex flex-col gap-6 p-6 md:p-8">
        {forgot ? (
          <ForgotPassword onBack={() => setForgot(false)} />
        ) : (
          <>
            <div>
              <h1 className="text-title font-semibold text-slate-900">Masuk staf dan barber</h1>
              <p className="mt-1 text-sm text-slate-600">Gunakan email dan kata sandi dari toko.</p>
            </div>
            <form onSubmit={(e) => void submit(e)} className="flex flex-col gap-4" noValidate>
              <Field label="Email" error={errors.email?.message}>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="nama@toko.id"
                  {...register("email")}
                />
              </Field>
              <Field label="Kata sandi" error={errors.password?.message}>
                <Input type="password" autoComplete="current-password" {...register("password")} />
              </Field>
              {formError && (
                <p role="alert" className="text-sm text-danger-700">
                  {formError}
                </p>
              )}
              <Button type="submit" loading={isSubmitting}>
                Masuk
              </Button>
              <Button type="button" variant="ghost" onClick={() => setForgot(true)}>
                Lupa kata sandi
              </Button>
            </form>
          </>
        )}
      </CardContent>
    </Card>
  )
}
