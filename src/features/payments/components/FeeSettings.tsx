import { useEffect, useState } from "react"
import {
  Async,
  Banner,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  Field,
  Input,
  MoneyText,
} from "@/shared/components"
import { FEE_MODE_LABEL } from "@/shared/constants"
import type { FeeMode } from "@/shared/types"
import { cn } from "@/shared/utils/cn"
import { formatRupiah } from "@/shared/utils/format"
import { computeFee } from "../domain/computeFee"
import { useFeeConfig, useSaveFeeConfig } from "../hooks"
import type { FeeConfig } from "../types"

const MODES: { value: FeeMode; desc: string }[] = [
  {
    value: "deduct",
    desc: "Fee menjadi kredit atas tagihan. Pelanggan membayar sisanya di toko.",
  },
  {
    value: "separate",
    desc: "Fee berdiri sendiri di luar tagihan. Tagihan dibayar penuh di toko.",
  },
  {
    value: "none",
    desc: "Tanpa pembayaran online. Booking langsung terkonfirmasi.",
  },
]
const SAMPLE = 55000

export function FeeSettings() {
  const q = useFeeConfig()
  return <Async query={q}>{(c) => <Form initial={c} />}</Async>
}

function Form({ initial }: { initial: FeeConfig }) {
  const [amount, setAmount] = useState(String(initial.amount))
  const [mode, setMode] = useState<FeeMode>(initial.mode)
  const [confirm, setConfirm] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const save = useSaveFeeConfig()
  useEffect(() => {
    setAmount(String(initial.amount))
    setMode(initial.mode)
  }, [initial])
  const value = mode === "none" ? 0 : Number(amount || 0)
  const preview = computeFee(mode, value, SAMPLE)
  const dirty = value !== initial.amount || mode !== initial.mode
  const onSave = () => {
    if (mode !== "none" && !(value > 0)) return setError("Nominal harus lebih dari nol.")
    setError(undefined)
    setConfirm(true)
  }
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan booking fee</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Banner tone="info">Perubahan hanya berlaku untuk booking baru.</Banner>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-medium text-slate-700">Skema</legend>
            {MODES.map((m) => (
              <label
                key={m.value}
                className={cn(
                  "flex min-h-11 cursor-pointer items-start gap-3 rounded-lg bg-slate-50 p-3",
                  mode === m.value ? "bg-primary-100" : "bg-white hover:bg-slate-50",
                )}
              >
                <input
                  type="radio"
                  name="mode"
                  value={m.value}
                  checked={mode === m.value}
                  onChange={() => setMode(m.value)}
                  className="mt-1 size-4 accent-emerald-700"
                />
                <span>
                  <span className="block font-medium text-slate-900">
                    {FEE_MODE_LABEL[m.value]}
                  </span>
                  <span className="block text-sm text-slate-600">{m.desc}</span>
                </span>
              </label>
            ))}
          </fieldset>
          <Field
            label="Nominal booking fee (Rp)"
            error={error}
            hint={
              mode === "none"
                ? "Tidak dipakai pada skema Tidak ada."
                : "Nominal tetap, bukan persen."
            }
          >
            <Input
              inputMode="numeric"
              value={mode === "none" ? "0" : amount}
              disabled={mode === "none"}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
            />
          </Field>
          <div>
            <Button onClick={onSave} disabled={!dirty}>
              Simpan
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Pratinjau</CardTitle>
          <span className="text-sm text-slate-600">Contoh layanan {formatRupiah(SAMPLE)}</span>
        </CardHeader>
        <CardContent>
          <dl className="flex flex-col gap-3 text-sm" aria-live="polite">
            <div className="flex justify-between">
              <dt>Dibayar online</dt>
              <dd className="font-semibold">
                <MoneyText value={preview.onlineAmount} />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Dibayar di toko</dt>
              <dd className="font-semibold">
                <MoneyText value={preview.payAtShop} />
              </dd>
            </div>
            <div className="flex justify-between border-t pt-3 text-base">
              <dt>Total pelanggan</dt>
              <dd className="font-semibold text-primary-800">
                <MoneyText value={preview.onlineAmount + preview.payAtShop} />
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-slate-600">
            {mode === "deduct"
              ? "Skema Potong tagihan: fee mengurangi sisa bayar."
              : mode === "separate"
                ? "Skema Terpisah: fee ditambahkan di luar harga layanan."
                : "Tanpa booking fee."}
          </p>
        </CardContent>
      </Card>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Simpan booking fee?"
        description={`Booking fee menjadi ${formatRupiah(value)} dengan skema ${FEE_MODE_LABEL[mode]}. Booking yang sudah ada tidak berubah. Perubahan tercatat di log audit.`}
        confirmLabel="Simpan"
        loading={save.isPending}
        onConfirm={() =>
          save.mutate(
            { amount: value, mode },
            {
              onSuccess: () => setConfirm(false),
            },
          )
        }
      />
    </div>
  )
}
