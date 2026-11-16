import type { Shop } from "@/shared/types"

export interface SetupStep {
  key: "created" | "owner" | "doku" | "catalog" | "hours" | "payment" | "open"
  label: string
  done: boolean
}

/** Checklist penyiapan toko, tujuh langkah berurutan. */
export function computeSetup(shop: Shop): {
  steps: SetupStep[]
  doneCount: number
  missing: string[]
  canOpen: boolean
} {
  const steps: SetupStep[] = [
    { key: "created", label: "Buat toko", done: true },
    { key: "owner", label: "Buat akun Owner", done: shop.setup.ownerCreated },
    {
      key: "doku",
      label: "Hubungkan merchant DOKU",
      done: shop.setup.dokuConnected && shop.doku.status === "connected",
    },
    {
      key: "catalog",
      label: "Isi katalog layanan dan harga",
      done: shop.setup.catalogFilled,
    },
    {
      key: "hours",
      label: "Atur jam buka dan jadwal",
      done: shop.setup.hoursSet,
    },
    { key: "payment", label: "Tes pembayaran", done: shop.setup.paymentTested },
    { key: "open", label: "Buka toko", done: shop.status !== "draft" },
  ]
  const missing = steps
    .slice(0, 6)
    .filter((s) => !s.done)
    .map((s) => s.label)
  return {
    steps,
    doneCount: steps.filter((s) => s.done).length,
    missing,
    canOpen: missing.length === 0,
  }
}
