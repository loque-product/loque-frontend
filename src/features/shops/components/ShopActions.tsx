import { MoreVertical, Snowflake, Store, Trash2 } from "lucide-react"
import { DropdownMenu } from "radix-ui"
import { useState } from "react"
import { useNavigate } from "react-router"
import {
  Banner,
  Button,
  ConfirmDialog,
  Dialog,
  Field,
  Input,
  ReasonDialog,
  Textarea,
} from "@/shared/components"
import type { Shop } from "@/shared/types"
import { useActiveShop } from "@/features/auth"
import { useDeleteShop, useFreezeShop, useUnfreezeShop } from "../hooks"

interface Props {
  shop: Shop
  upcomingBookings: number
  /** Dipanggil setelah toko dihapus (mis. kembali ke daftar). */
  onDeleted?: () => void
  /** Tombol "Kelola sebagai Owner" ditampilkan terpisah dari menu. */
  showManage?: boolean
}

/** Tombol Kelola sebagai Owner dan menu aksi toko (lihat detail, bekukan, aktifkan kembali, hapus). */
export function ShopActions({ shop, upcomingBookings, onDeleted, showManage = true }: Props) {
  const navigate = useNavigate()
  const setShop = useActiveShop((s) => s.setShop)
  const freeze = useFreezeShop()
  const unfreeze = useUnfreezeShop()
  const [freezing, setFreezing] = useState(false)
  const [unfreezing, setUnfreezing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const live = shop.status === "open" || shop.status === "frozen"
  const canDelete = shop.status === "draft" && !shop.everOpened

  const manage = (to: string) => {
    setShop(shop.id)
    navigate(to)
  }
  return (
    <div
      className="flex items-center gap-2"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {showManage && (
        <Button size="sm" variant="secondary" onClick={() => manage("/owner")}>
          <Store className="size-4" aria-hidden />
          Kelola sebagai Owner
        </Button>
      )}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button size="icon" variant="ghost" aria-label={`Aksi toko ${shop.name}`}>
            <MoreVertical className="size-4" aria-hidden />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={4}
            className="z-70 min-w-56 rounded-xl bg-white p-1 shadow-pop"
          >
            {live && (
              <DropdownMenu.Item
                onSelect={() => manage("/owner/toko")}
                className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm outline-none data-highlighted:bg-slate-100"
              >
                <Store className="size-4" aria-hidden />
                Lihat detail toko
              </DropdownMenu.Item>
            )}
            {shop.status === "open" && (
              <DropdownMenu.Item
                onSelect={() => {
                  setError(undefined)
                  setFreezing(true)
                }}
                className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm text-warning-800 outline-none data-highlighted:bg-warning-50"
              >
                <Snowflake className="size-4" aria-hidden />
                Bekukan toko
              </DropdownMenu.Item>
            )}
            {shop.status === "frozen" && (
              <DropdownMenu.Item
                onSelect={() => setUnfreezing(true)}
                className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm outline-none data-highlighted:bg-slate-100"
              >
                <Snowflake className="size-4" aria-hidden />
                Aktifkan kembali
              </DropdownMenu.Item>
            )}
            {shop.status === "draft" && (
              <DropdownMenu.Item
                onSelect={() => navigate(`/sa/toko/${shop.id}`)}
                className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm outline-none data-highlighted:bg-slate-100"
              >
                <Store className="size-4" aria-hidden />
                Lanjutkan penyiapan
              </DropdownMenu.Item>
            )}
            {canDelete && (
              <>
                <DropdownMenu.Separator className="my-1 h-px bg-slate-200" />
                <DropdownMenu.Item
                  onSelect={() => setDeleting(true)}
                  className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm text-danger-700 outline-none data-highlighted:bg-danger-50"
                >
                  <Trash2 className="size-4" aria-hidden />
                  Hapus toko
                </DropdownMenu.Item>
              </>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <ReasonDialog
        open={freezing}
        onOpenChange={setFreezing}
        title={`Bekukan ${shop.name}`}
        confirmLabel="Bekukan toko"
        variant="warning"
        loading={freeze.isPending}
        serverError={error}
        notice={
          <Banner tone="warning" title={`${upcomingBookings} booking mendatang`}>
            Toko tidak tampil ke publik dan tidak menerima booking baru. Data tetap utuh. Booking
            mendatang perlu ditangani oleh toko.
          </Banner>
        }
        onSubmit={(reason) =>
          freeze.mutate(
            { id: shop.id, reason },
            { onSuccess: () => setFreezing(false), onError: (e) => setError(e.message) },
          )
        }
      />
      <ConfirmDialog
        open={unfreezing}
        onOpenChange={setUnfreezing}
        title="Aktifkan kembali toko?"
        description="Toko kembali tampil ke publik dan menerima booking baru."
        confirmLabel="Aktifkan kembali"
        loading={unfreeze.isPending}
        onConfirm={() => unfreeze.mutate(shop.id, { onSuccess: () => setUnfreezing(false) })}
      />
      <DeleteShopDialog
        shop={shop}
        open={deleting}
        onOpenChange={setDeleting}
        onDeleted={onDeleted}
      />
    </div>
  )
}

/** Hapus permanen: alasan wajib dan nama toko harus diketik persis. */
function DeleteShopDialog({
  shop,
  open,
  onOpenChange,
  onDeleted,
}: {
  shop: Shop
  open: boolean
  onOpenChange: (o: boolean) => void
  onDeleted?: () => void
}) {
  const del = useDeleteShop()
  const activeShop = useActiveShop()
  const [reason, setReason] = useState("")
  const [typed, setTyped] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const matches = typed === shop.name
  const submit = () => {
    if (!reason.trim()) return setErrors({ reason: "Alasan wajib diisi." })
    setErrors({})
    del.mutate(
      { id: shop.id, reason, confirmName: typed },
      {
        onSuccess: () => {
          if (activeShop.shopId === shop.id) activeShop.setShop(null)
          onOpenChange(false)
          onDeleted?.()
        },
        onError: (e) => setErrors(e.fields ?? { reason: e.message }),
      },
    )
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) {
          setReason("")
          setTyped("")
          setErrors({})
        }
      }}
      title={`Hapus ${shop.name}`}
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Batalkan
          </Button>
          <Button variant="danger" disabled={!matches} loading={del.isPending} onClick={submit}>
            Hapus permanen
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Banner tone="danger">
          Toko, akun Owner, dan semua isian penyiapan akan dihapus permanen. Tindakan ini tidak
          dapat dibatalkan.
        </Banner>
        <Field label="Alasan" required error={errors.reason}>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} />
        </Field>
        <Field label={`Ketik nama toko untuk melanjutkan: ${shop.name}`} error={errors.confirmName}>
          <Input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        </Field>
      </div>
    </Dialog>
  )
}
