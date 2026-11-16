import type { ColumnDef } from "@tanstack/react-table"
import { Plus } from "lucide-react"
import { useMemo, useState } from "react"
import { useNavigate } from "react-router"
import { Badge, Button, DataTable, Dialog, Field, Input } from "@/shared/components"
import type { Shop } from "@/shared/types"
import { formatDate } from "@/shared/utils/format"
import { computeSetup } from "../domain/setup"
import { useCreateShop, useShopList } from "../hooks"
import type { ShopRow } from "../types"
import { ShopActions } from "./ShopActions"

export function dokuBadge(status: "not_connected" | "connected" | "problem") {
  return status === "connected" ? (
    <Badge tone="primary">Terhubung</Badge>
  ) : status === "problem" ? (
    <Badge tone="danger">Bermasalah</Badge>
  ) : (
    <Badge tone="slate">Belum terhubung</Badge>
  )
}

export function shopStatusBadge(shop: Shop) {
  if (shop.status === "open") return <Badge tone="primary">Buka</Badge>
  if (shop.status === "frozen") return <Badge tone="info">Beku</Badge>
  return <Badge tone="warning">Draf - {computeSetup(shop).doneCount} dari 7 langkah</Badge>
}

export function ShopList() {
  const q = useShopList()
  const nav = useNavigate()
  const [creating, setCreating] = useState(false)
  const columns = useMemo<ColumnDef<ShopRow, unknown>[]>(
    () => [
      {
        header: "Nama",
        cell: ({ row }) => <span className="font-medium">{row.original.shop.name}</span>,
      },
      { header: "Status", cell: ({ row }) => shopStatusBadge(row.original.shop) },
      { header: "Owner", cell: ({ row }) => row.original.ownerName ?? "Belum dibuat" },
      { header: "DOKU", cell: ({ row }) => dokuBadge(row.original.shop.doku.status) },
      { header: "Barber", cell: ({ row }) => row.original.barberCount },
      { header: "Dibuat", cell: ({ row }) => formatDate(row.original.shop.createdAt) },
      {
        header: "Aksi",
        cell: ({ row }) => (
          <ShopActions shop={row.original.shop} upcomingBookings={row.original.upcomingBookings} />
        ),
      },
    ],
    [],
  )
  return (
    <>
      <DataTable
        columns={columns}
        query={q}
        rowKey={(r) => r.shop.id}
        onRowClick={(r) => nav(`/sa/toko/${r.shop.id}`)}
        searchText={(r) => `${r.shop.name} ${r.ownerName ?? ""}`}
        searchPlaceholder="Cari toko atau Owner"
        toolbar={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" aria-hidden />
            Tambah toko
          </Button>
        }
        emptyTitle="Belum ada toko."
      />
      <CreateShopDialog
        open={creating}
        onOpenChange={setCreating}
        onCreated={(id) => nav(`/sa/toko/${id}`)}
      />
    </>
  )
}

function CreateShopDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onCreated: (id: string) => void
}) {
  const create = useCreateShop()
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const submit = () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = "Nama toko wajib diisi."
    if (!address.trim()) e.address = "Alamat wajib diisi."
    if (!city.trim()) e.city = "Kota atau kabupaten wajib diisi."
    setErrors(e)
    if (Object.keys(e).length) return
    create.mutate(
      { name, address, city, whatsapp: "", instagram: "", tiktok: "" },
      {
        onSuccess: (s) => {
          setName("")
          setAddress("")
          setCity("")
          onOpenChange(false)
          onCreated(s.id)
        },
        onError: (err) => setErrors(err.fields ?? { name: err.message }),
      },
    )
  }
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Tambah toko"
      description="Toko baru berstatus Draf sampai semua langkah penyiapan selesai."
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Batalkan
          </Button>
          <Button onClick={submit} loading={create.isPending}>
            Buat toko
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Field label="Nama toko" required error={errors.name}>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Alamat" required error={errors.address}>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} />
        </Field>
        <Field label="Kota atau kabupaten" required error={errors.city}>
          <Input value={city} onChange={(e) => setCity(e.target.value)} />
        </Field>
        <Field label="Zona waktu">
          <Input value="WIB (UTC+7)" readOnly disabled />
        </Field>
      </div>
    </Dialog>
  )
}
