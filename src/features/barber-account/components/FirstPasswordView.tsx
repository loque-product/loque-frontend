import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { Navigate, useNavigate } from "react-router"
import { z } from "zod"
import { ApiError } from "@/shared/api"
import { Banner, Button, Card, CardContent, Checkbox, Field, Input } from "@/shared/components"
import { ROLE_HOME } from "@/shared/constants"
import { usePageMeta } from "@/shared/hooks"
import { finishFirstLogin, useSession } from "@/features/auth"
import { MIN_PASSWORD, passwordStrength } from "../domain/password"
import { StaffTermsSheet } from "./StaffTerms"

export const newPasswordRules = z
  .string()
  .min(MIN_PASSWORD, `Kata sandi minimal ${MIN_PASSWORD} karakter.`)

const schema = z
  .object({
    password: newPasswordRules,
    confirm: z.string().min(1, "Ulangi kata sandi baru."),
    terms: z.boolean().refine((v) => v, "Setujui Syarat staf untuk melanjutkan."),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Kata sandi tidak sama." })
type Form = z.infer<typeof schema>

export function Strength({ value }: { value: string }) {
  const s = passwordStrength(value)
  if (!s.label) return null
  return (
    <p className="text-xs text-slate-700" aria-live="polite">
      Kekuatan: <span className="font-medium">{s.label}</span>
    </p>
  )
}

/** Login pertama barber: kata sandi baru dan persetujuan Syarat staf wajib sebelum rute lain terbuka. */
export function FirstPasswordView() {
  usePageMeta("Ganti kata sandi")
  const session = useSession((s) => s.session)
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [terms, setTerms] = useState(false)
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirm: "", terms: false },
  })
  const password = useWatch({ control, name: "password" })

  if (session && !session.mustChangePassword)
    return <Navigate to={ROLE_HOME[session.role]} replace />

  const submit = handleSubmit(async (v) => {
    setError(null)
    try {
      await finishFirstLogin(v.password, v.terms)
      navigate(ROLE_HOME.barber, { replace: true })
    } catch (e) {
      setError(ApiError.from(e).message)
    }
  })

  return (
    <Card className="w-full max-w-xl">
      <CardContent className="flex flex-col gap-5 p-6 md:p-8">
        <div>
          <h1 className="text-title font-semibold text-slate-900">Ganti kata sandi</h1>
          <p className="mt-1 text-sm text-slate-600">
            Kata sandi sementara harus diganti sebelum Anda melanjutkan.
          </p>
        </div>
        <form onSubmit={(e) => void submit(e)} className="flex flex-col gap-4" noValidate>
          {error && <Banner tone="danger">{error}</Banner>}
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
          <div>
            <Controller
              control={control}
              name="terms"
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(v) => field.onChange(v === true)}
                  label="Saya menyetujui Syarat staf"
                />
              )}
            />
            <button
              type="button"
              onClick={() => setTerms(true)}
              className="flex min-h-11 items-center text-sm font-medium text-primary-800 underline"
            >
              Baca Syarat staf
            </button>
            {errors.terms && (
              <p role="alert" className="text-xs text-danger-700">
                {errors.terms.message}
              </p>
            )}
          </div>
          <Button type="submit" loading={isSubmitting}>
            Simpan kata sandi
          </Button>
        </form>
        <StaffTermsSheet open={terms} onOpenChange={setTerms} />
      </CardContent>
    </Card>
  )
}
