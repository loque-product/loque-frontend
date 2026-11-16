import type { ColumnDef } from "@tanstack/react-table"
import { Copy, KeyRound, Plus, RefreshCw } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import {
  Badge,
  Banner,
  Button,
  ConfirmDialog,
  DataTable,
  Dialog,
  Field,
  Input,
  RoleBadge,
  Select,
} from "@/shared/components"
import type { StaffAccount } from "@/shared/types"
import { can, useRole } from "@/features/auth"
import { generateTempPassword } from "../domain"
import { useAccounts, useCreateAccount, useResetPassword, useSetAccountActive } from "../hooks"

export function StaffManager() {
  const q = useAccounts()
  const role = useRole()
  const [creating, setCreating] = useState(false)
  const [reset, setReset] = useState<{
    account: StaffAccount
    password: string
  } | null>(null)
  const [deactivate, setDeactivate] = useState<StaffAccount | null>(null)
  const resetM = useResetPassword()
  const activeM = useSetAccountActive()
  const isOwner = can(role, "staff.create.admin")
  const manageable = (a: StaffAccount) => a.role !== "owner" && (isOwner || a.role === "barber")

  const columns = useMemo<ColumnDef<StaffAccount, unknown>[]>(
    () => [
      {
        header: "Nama",
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      { header: "Email", cell: ({ row }) => row.original.email },
      {
        header: "Peran",
        cell: ({ row }) => <RoleBadge role={row.original.role} />,
      },
      {
        header: "Status",
        cell: ({ row }) =>
          row.original.active ? (
            <Badge tone="primary">Aktif</Badge>
          ) : (
            <Badge tone="slate">Nonaktif</Badge>
          ),
      },
      {
        header: "Aksi",
        cell: ({ row }) =>
          manageable(row.original) ? (
            <span className="flex flex-wrap justify-end gap-2 md:justify-start">
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  resetM.mutate(row.original.id, {
                    onSuccess: (r) =>
                      setReset({
                        account: row.original,
                        password: r.temporaryPassword,
                      }),
                  })
                }
              >
                <KeyRound className="size-4" aria-hidden />
                Reset kata sandi
              </Button>
              {row.original.active ? (
                <Button size="sm" variant="secondary" onClick={() => setDeactivate(row.original)}>
                  Nonaktifkan
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => activeM.mutate({ id: row.original.id, active: true })}
                >
                  Aktifkan
                </Button>
              )}
            </span>
          ) : (
            <span className="text-xs text-slate-600">-</span>
          ),
      },
    ],
    [isOwner],
  )

  return (
    <>
      {!isOwner && (
        <Banner tone="info" className="mb-4">
          Admin & Kasir hanya dapat membuat akun Barber.
        </Banner>
      )}
      <DataTable
        columns={columns}
        query={q}
        rowKey={(a) => a.id}
        searchText={(a) => `${a.name} ${a.email}`}
        searchPlaceholder="Cari nama atau email"
        toolbar={
          can(role, "staff.create.barber") ? (
            <Button onClick={() => setCreating(true)}>
              <Plus className="size-4" aria-hidden />
              Buat akun
            </Button>
          ) : undefined
        }
      />
      <CreateDialog open={creating} onOpenChange={setCreating} isOwner={isOwner} />
      <Dialog
        open={reset !== null}
        onOpenChange={(o) => !o && setReset(null)}
        title="Kata sandi sementara"
        description={reset ? `Untuk ${reset.account.name}.` : undefined}
        footer={<Button onClick={() => setReset(null)}>Selesai</Button>}
      >
        {reset && <PasswordBox password={reset.password} />}
      </Dialog>
      <ConfirmDialog
        open={deactivate !== null}
        onOpenChange={(o) => !o && setDeactivate(null)}
        title="Nonaktifkan keanggotaan?"
        description={`${deactivate?.name} kehilangan akses ke booking dan data pelanggan. Portofolio dan ulasannya tetap.`}
        confirmLabel="Nonaktifkan"
        variant="danger"
        loading={activeM.isPending}
        onConfirm={() =>
          deactivate &&
          activeM.mutate(
            { id: deactivate.id, active: false },
            {
              onSuccess: () => setDeactivate(null),
              onError: () => setDeactivate(null),
            },
          )
        }
      />
    </>
  )
}

function PasswordBox({ password }: { password: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2 rounded-lg bg-slate-100 p-3">
        <code className="text-base font-semibold">{password}</code>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            void navigator.clipboard?.writeText(password).catch(() => undefined)
            toast.success("Kata sandi disalin.")
          }}
        >
          <Copy className="size-4" aria-hidden />
          Salin
        </Button>
      </div>
      <p className="text-sm text-slate-600">Wajib diganti saat masuk pertama.</p>
    </div>
  )
}

function CreateDialog({
  open,
  onOpenChange,
  isOwner,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  isOwner: boolean
}) {
  const create = useCreateAccount()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"barber" | "admin_kasir">("barber")
  const [password, setPassword] = useState(() => generateTempPassword())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const submit = () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = "Nama wajib diisi."
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Format email tidak valid."
    setErrors(e)
    if (Object.keys(e).length) return
    create.mutate(
      { name: name.trim(), email: email.trim(), role, password },
      {
        onSuccess: () => {
          setName("")
          setEmail("")
          setPassword(generateTempPassword())
          onOpenChange(false)
        },
        onError: (err) => setErrors({ email: err.message }),
      },
    )
  }
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Buat akun staf"
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Batalkan
          </Button>
          <Button onClick={submit} loading={create.isPending}>
            Buat akun
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Field label="Nama" required error={errors.name}>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Email" required error={errors.email}>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field
          label="Peran"
          hint={isOwner ? undefined : "Admin & Kasir hanya dapat membuat Barber."}
        >
          {isOwner ? (
            <Select
              value={role}
              onValueChange={(v) => setRole(v as "barber" | "admin_kasir")}
              options={[
                { value: "barber", label: "Barber" },
                { value: "admin_kasir", label: "Admin & Kasir" },
              ]}
            />
          ) : (
            <Input value="Barber" readOnly disabled />
          )}
        </Field>
        <Field label="Kata sandi sementara" hint="Wajib diganti saat masuk pertama.">
          <div className="flex gap-2">
            <Input value={password} readOnly />
            <Button
              variant="secondary"
              size="icon"
              aria-label="Buat kata sandi baru"
              onClick={() => setPassword(generateTempPassword())}
            >
              <RefreshCw className="size-4" aria-hidden />
            </Button>
          </div>
        </Field>
      </div>
    </Dialog>
  )
}
