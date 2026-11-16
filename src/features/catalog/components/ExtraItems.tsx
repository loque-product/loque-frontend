import type { ColumnDef } from "@tanstack/react-table"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"
import {
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  Field,
  Input,
  MoneyText,
  Select,
  Sheet,
  Switch,
} from "@/shared/components"
import type { ExtraItem, ExtraItemType } from "@/shared/types"
import { EXTRA_TYPE_LABEL, EXTRA_TYPE_TONE } from "../types"
import { useDeleteExtraItem, useExtraItems, useSaveExtraItem } from "../hooks"

const ALL = "all"

/** Tab "Add-on & Produk": master item untuk baris tagihan. */
export function ExtraItems() {
  const q = useExtraItems()
  const save = useSaveExtraItem()
  const del = useDeleteExtraItem()
  const [type, setType] = useState(ALL)
  const [editing, setEditing] = useState<{ item?: ExtraItem } | null>(null)
  const [removing, setRemoving] = useState<ExtraItem | null>(null)
  const [deactivating, setDeactivating] = useState<ExtraItem | null>(null)

  const columns = useMemo<ColumnDef<ExtraItem, unknown>[]>(
    () => [
      {
        header: "Nama",
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        header: "Jenis",
        cell: ({ row }) => (
          <Badge tone={EXTRA_TYPE_TONE[row.original.type]}>
            {EXTRA_TYPE_LABEL[row.original.type]}
          </Badge>
        ),
      },
      { header: "Harga", cell: ({ row }) => <MoneyText value={row.original.price} /> },
      {
        header: "Aktif",
        cell: ({ row }) => (
          <Switch
            aria-label={`${row.original.active ? "Nonaktifkan" : "Aktifkan"} ${row.original.name}`}
            checked={row.original.active}
            onCheckedChange={(c) =>
              c ? save.mutate({ ...row.original, active: true }) : setDeactivating(row.original)
            }
          />
        ),
      },
      {
        header: "Aksi",
        cell: ({ row }) => (
          <span className="flex flex-wrap justify-end gap-2 md:justify-start">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setEditing({ item: row.original })}
            >
              <Pencil className="size-4" aria-hidden />
              Ubah
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setRemoving(row.original)}
              aria-label={`Hapus ${row.original.name}`}
            >
              <Trash2 className="size-4" aria-hidden />
              Hapus
            </Button>
          </span>
        ),
      },
    ],
    [save],
  )
  const rows = q.data?.filter((x) => type === ALL || x.type === type)

  return (
    <>
      <p className="mb-3 text-sm text-slate-600">
        Item ini muncul di pilihan "Tambah add/ons" pada tagihan. Item nonaktif tidak muncul di
        pilihan, tetapi baris tagihan lama tetap utuh.
      </p>
      <DataTable
        columns={columns}
        query={{ ...q, data: rows }}
        rowKey={(x) => x.id}
        searchText={(x) => x.name}
        searchPlaceholder="Cari item"
        filters={
          <div className="w-56">
            <Select
              aria-label="Filter jenis"
              value={type}
              onValueChange={setType}
              options={[
                { value: ALL, label: "Semua jenis" },
                ...(Object.keys(EXTRA_TYPE_LABEL) as ExtraItemType[]).map((t) => ({
                  value: t,
                  label: EXTRA_TYPE_LABEL[t],
                })),
              ]}
            />
          </div>
        }
        toolbar={
          <Button onClick={() => setEditing({})}>
            <Plus className="size-4" aria-hidden />
            Tambah item
          </Button>
        }
        emptyTitle="Belum ada item."
        emptyDescription="Tambahkan add-on, minuman atau makanan, dan produk yang dijual di toko."
        pageSize={12}
      />
      <ItemSheet state={editing} onClose={() => setEditing(null)} />
      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(o) => !o && setRemoving(null)}
        title="Hapus item?"
        description={`${removing?.name} dihapus dari master. Baris tagihan lama yang memakai item ini tetap utuh.`}
        confirmLabel="Hapus item"
        variant="danger"
        loading={del.isPending}
        onConfirm={() =>
          removing && del.mutate(removing.id, { onSuccess: () => setRemoving(null) })
        }
      />
      <ConfirmDialog
        open={deactivating !== null}
        onOpenChange={(o) => !o && setDeactivating(null)}
        title="Nonaktifkan item?"
        description={`${deactivating?.name} tidak akan muncul di pilihan tagihan. Baris lama tetap utuh.`}
        confirmLabel="Nonaktifkan"
        variant="danger"
        loading={save.isPending}
        onConfirm={() =>
          deactivating &&
          save.mutate(
            { ...deactivating, active: false },
            { onSuccess: () => setDeactivating(null) },
          )
        }
      />
    </>
  )
}

function ItemSheet({
  state,
  onClose,
}: {
  state: { item?: ExtraItem } | null
  onClose: () => void
}) {
  const save = useSaveExtraItem()
  const item = state?.item
  const [name, setName] = useState("")
  const [type, setType] = useState<ExtraItemType>("addon")
  const [price, setPrice] = useState("")
  const [active, setActive] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [key, setKey] = useState<string | null>(null)
  const cur = state ? (item?.id ?? "new") : null
  if (cur !== key) {
    setKey(cur)
    if (state) {
      setName(item?.name ?? "")
      setType(item?.type ?? "addon")
      setPrice(item ? String(item.price) : "")
      setActive(item?.active ?? true)
      setErrors({})
    }
  }
  const submit = () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = "Nama wajib diisi."
    if (price === "") e.price = "Harga wajib diisi."
    setErrors(e)
    if (Object.keys(e).length) return
    save.mutate(
      { id: item?.id, name, type, price: Number(price), active },
      { onSuccess: onClose, onError: (err) => setErrors(err.fields ?? { name: err.message }) },
    )
  }
  return (
    <Sheet
      open={state !== null}
      onOpenChange={(o) => !o && onClose()}
      title={item ? `Ubah ${item.name}` : "Tambah item"}
      description="Perubahan harga dan item tercatat di log audit."
      className="md:max-w-md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={submit} loading={save.isPending}>
            Simpan
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Nama" required error={errors.name}>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Jenis">
          <Select
            value={type}
            onValueChange={(v) => setType(v as ExtraItemType)}
            options={(Object.keys(EXTRA_TYPE_LABEL) as ExtraItemType[]).map((t) => ({
              value: t,
              label: EXTRA_TYPE_LABEL[t],
            }))}
          />
        </Field>
        <Field label="Harga (Rp)" required error={errors.price}>
          <Input
            inputMode="numeric"
            value={price}
            onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))}
          />
        </Field>
        <Switch checked={active} onCheckedChange={setActive} label="Aktif" />
      </div>
    </Sheet>
  )
}
