import type { ColumnDef } from "@tanstack/react-table"
import { Pencil, Plus } from "lucide-react"
import { useMemo, useState } from "react"
import {
  Async,
  Badge,
  Banner,
  Button,
  ConfirmDialog,
  DataTable,
  Dialog,
  Field,
  Input,
  MoneyText,
  Select,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components"
import { CATEGORY_LABEL } from "@/shared/constants"
import type { Service, ServiceCategory, ServiceOverride } from "@/shared/types"
import { formatDuration, formatRupiah } from "@/shared/utils/format"
import { useBarbers } from "@/features/barber-profile"
import { DURATION_OPTIONS, resolveService } from "../domain/pricing"
import { ExtraItems } from "./ExtraItems"
import {
  useOverrides,
  useSaveService,
  useServices,
  useSetOverride,
  useSetServiceActive,
} from "../hooks"

const MAIN: ServiceCategory[] = ["haircut", "longtrim", "treatment", "coloring"]

export function CatalogManager() {
  const services = useServices()
  const overrides = useOverrides()
  const [editing, setEditing] = useState<{ service?: Service } | null>(null)
  const [toggle, setToggle] = useState<Service | null>(null)
  const setActive = useSetServiceActive()

  const columns = useMemo<ColumnDef<Service, unknown>[]>(
    () => [
      {
        header: "Nama",
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      { header: "Kategori", cell: ({ row }) => CATEGORY_LABEL[row.original.category] },
      {
        header: "Harga standar",
        cell: ({ row }) => (
          <span>
            {row.original.startingFrom && (
              <Badge tone="info" className="mr-1">
                Mulai dari
              </Badge>
            )}
            <MoneyText value={row.original.basePrice} />
          </span>
        ),
      },
      {
        header: "Durasi",
        cell: ({ row }) =>
          row.original.duration === 0
            ? "Tanpa tambahan waktu"
            : formatDuration(row.original.duration),
      },
      {
        header: "Aktif",
        cell: ({ row }) => (
          <Switch
            aria-label={`${row.original.active ? "Nonaktifkan" : "Aktifkan"} ${row.original.name}`}
            checked={row.original.active}
            onCheckedChange={(c) =>
              c ? setActive.mutate({ id: row.original.id, active: true }) : setToggle(row.original)
            }
          />
        ),
      },
      {
        header: "Aksi",
        cell: ({ row }) => (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setEditing({ service: row.original })}
          >
            <Pencil className="size-4" aria-hidden />
            Ubah
          </Button>
        ),
      },
    ],
    [setActive],
  )

  return (
    <>
      <Tabs defaultValue="services">
        <TabsList>
          <TabsTrigger value="services">Layanan</TabsTrigger>
          <TabsTrigger value="extras">Add-on & Produk</TabsTrigger>
        </TabsList>
        <TabsContent value="services">
          <div className="flex flex-col gap-8">
            <DataTable
              columns={columns}
              query={services}
              rowKey={(s) => s.id}
              searchText={(s) => s.name}
              searchPlaceholder="Cari layanan"
              toolbar={
                <Button onClick={() => setEditing({})}>
                  <Plus className="size-4" aria-hidden />
                  Tambah layanan
                </Button>
              }
              pageSize={12}
            />
            <section aria-labelledby="harga-barber" className="flex flex-col gap-3">
              <h2 id="harga-barber" className="text-section font-semibold text-slate-900">
                Harga per barber
              </h2>
              <PriceMatrix
                services={services.data ?? []}
                overrides={overrides.data ?? []}
                loading={services.isLoading || overrides.isLoading}
                error={services.isError || overrides.isError}
                retry={() => {
                  void services.refetch()
                  void overrides.refetch()
                }}
              />
            </section>
          </div>
        </TabsContent>
        <TabsContent value="extras">
          <ExtraItems />
        </TabsContent>
      </Tabs>
      <ServiceDialog state={editing} onClose={() => setEditing(null)} />
      <ConfirmDialog
        open={toggle !== null}
        onOpenChange={(o) => !o && setToggle(null)}
        title="Nonaktifkan layanan?"
        description={`${toggle?.name} tidak akan tampil untuk booking baru. Booking yang sudah ada tidak berubah.`}
        confirmLabel="Nonaktifkan"
        variant="danger"
        loading={setActive.isPending}
        onConfirm={() =>
          toggle &&
          setActive.mutate({ id: toggle.id, active: false }, { onSuccess: () => setToggle(null) })
        }
      />
    </>
  )
}

function ServiceDialog({
  state,
  onClose,
}: {
  state: { service?: Service } | null
  onClose: () => void
}) {
  const s = state?.service
  const save = useSaveService()
  const [name, setName] = useState("")
  const [category, setCategory] = useState<ServiceCategory>("haircut")
  const [price, setPrice] = useState("")
  const [duration, setDuration] = useState("30")
  const [startingFrom, setStartingFrom] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [key, setKey] = useState<string | null>(null)
  const cur = state ? (s?.id ?? "new") : null
  if (cur !== key) {
    setKey(cur)
    if (state) {
      setName(s?.name ?? "")
      setCategory(s?.category ?? "haircut")
      setPrice(s ? String(s.basePrice) : "")
      setDuration(String(s?.duration ?? 30))
      setStartingFrom(s?.startingFrom ?? false)
      setErrors({})
    }
  }
  const categories: ServiceCategory[] = [...MAIN, "addon"]
  const submit = () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = "Nama wajib diisi."
    if (price === "" || Number(price) < 0) e.price = "Harga wajib diisi."
    setErrors(e)
    if (Object.keys(e).length) return
    save.mutate(
      {
        id: s?.id,
        name: name.trim(),
        category,
        basePrice: Number(price),
        duration: Number(duration),
        startingFrom,
      },
      {
        onSuccess: onClose,
        onError: (err) => setErrors(err.fields ?? { name: err.message }),
      },
    )
  }
  return (
    <Dialog
      open={state !== null}
      onOpenChange={(o) => !o && onClose()}
      title={s ? `Ubah ${s.name}` : "Tambah layanan"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Batalkan
          </Button>
          <Button onClick={submit} loading={save.isPending}>
            Simpan
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Banner tone="info">
          Berlaku untuk booking baru. Booking yang sudah ada tidak berubah.
        </Banner>
        <Field label="Nama" required error={errors.name}>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Kategori">
          <Select
            value={category}
            onValueChange={(v) => setCategory(v as ServiceCategory)}
            options={categories.map((c) => ({
              value: c,
              label: CATEGORY_LABEL[c],
            }))}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Harga standar (Rp)" required error={errors.price}>
            <Input
              inputMode="numeric"
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))}
            />
          </Field>
          <Field label="Durasi" hint="Kelipatan 30 menit">
            <Select
              value={duration}
              onValueChange={setDuration}
              options={DURATION_OPTIONS.filter((d) => category === "addon" || d > 0).map((d) => ({
                value: String(d),
                label: d === 0 ? "Tanpa tambahan" : formatDuration(d),
              }))}
            />
          </Field>
        </div>
        {category === "coloring" && (
          <Switch
            checked={startingFrom}
            onCheckedChange={setStartingFrom}
            label="Tampilkan sebagai Mulai dari"
          />
        )}
      </div>
    </Dialog>
  )
}

function PriceMatrix({
  services,
  overrides,
  loading,
  error,
  retry,
}: {
  services: Service[]
  overrides: ServiceOverride[]
  loading: boolean
  error: boolean
  retry: () => void
}) {
  const barbers = useBarbers()
  const [cell, setCell] = useState<{
    service: Service
    barberId: string
  } | null>(null)
  const list = services.filter((s) => s.active)
  return (
    <Async
      query={{
        data: barbers.data && !loading ? barbers.data : undefined,
        isLoading: loading || barbers.isLoading,
        isError: error || barbers.isError,
        refetch: retry,
      }}
    >
      {(bs) => (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-slate-600">
            Sel yang menyimpang dari harga standar diberi tanda. Ketuk sel untuk mengubah harga atau
            durasi barber.
          </p>
          <div className="overflow-x-auto rounded-xl bg-white shadow-card">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-600">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Layanan
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Standar
                  </th>
                  {bs
                    .filter((b) => b.active)
                    .map((b) => (
                      <th scope="col" key={b.id} className="px-4 py-3">
                        {b.name}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {list.map((s) => (
                  <tr key={s.id}>
                    <th scope="row" className="px-4 py-2 font-medium">
                      {s.name}
                    </th>
                    <td className="px-4 py-2 text-slate-600">{formatRupiah(s.basePrice)}</td>
                    {bs
                      .filter((b) => b.active)
                      .map((b) => {
                        const r = resolveService(s, overrides, b.id)
                        return (
                          <td key={b.id} className="px-2 py-1">
                            <button
                              type="button"
                              onClick={() => setCell({ service: s, barberId: b.id })}
                              aria-label={`${s.name} ${b.name}: ${formatRupiah(r.price)}${
                                r.overridden ? ", berbeda dari standar" : ""
                              }`}
                              className={`flex min-h-11 w-full flex-col items-start rounded-lg px-2 py-1 text-left hover:bg-slate-100 ${
                                r.overridden ? "bg-warning-50 text-warning-800" : ""
                              }`}
                            >
                              <span className="font-medium">{formatRupiah(r.price)}</span>
                              <span className="text-xs">
                                {r.duration === 0 ? "-" : formatDuration(r.duration)}
                                {r.overridden ? " - berbeda" : ""}
                              </span>
                            </button>
                          </td>
                        )
                      })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <OverrideDialog
            cell={cell}
            overrides={overrides}
            barberName={bs.find((b) => b.id === cell?.barberId)?.name ?? ""}
            onClose={() => setCell(null)}
          />
        </div>
      )}
    </Async>
  )
}

function OverrideDialog({
  cell,
  overrides,
  barberName,
  onClose,
}: {
  cell: { service: Service; barberId: string } | null
  overrides: ServiceOverride[]
  barberName: string
  onClose: () => void
}) {
  const set = useSetOverride()
  const [price, setPrice] = useState("")
  const [duration, setDuration] = useState("30")
  const [key, setKey] = useState<string | null>(null)
  const cur = cell ? `${cell.service.id}-${cell.barberId}` : null
  if (cur !== key) {
    setKey(cur)
    if (cell) {
      const r = resolveService(cell.service, overrides, cell.barberId)
      setPrice(String(r.price))
      setDuration(String(r.duration))
    }
  }
  if (!cell)
    return (
      <Dialog open={false} onOpenChange={onClose} title="">
        <span />
      </Dialog>
    )
  const s = cell.service
  const submit = () => {
    const p = Number(price)
    const d = Number(duration)
    set.mutate(
      {
        serviceId: s.id,
        barberId: cell.barberId,
        price: p === s.basePrice ? undefined : p,
        duration: d === s.duration ? undefined : d,
      },
      { onSuccess: onClose },
    )
  }
  return (
    <Dialog
      open
      onOpenChange={(o) => !o && onClose()}
      title={`${s.name} - ${barberName}`}
      description="Berlaku untuk booking baru. Booking yang sudah ada tidak berubah."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Batalkan
          </Button>
          <Button onClick={submit} loading={set.isPending}>
            Simpan
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="Harga (Rp)" hint={`Standar ${formatRupiah(s.basePrice)}`}>
          <Input
            inputMode="numeric"
            value={price}
            onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))}
          />
        </Field>
        <Field
          label="Durasi"
          hint={`Standar ${s.duration === 0 ? "tanpa tambahan" : formatDuration(s.duration)}`}
        >
          <Select
            value={duration}
            onValueChange={setDuration}
            options={DURATION_OPTIONS.filter((d) => s.category === "addon" || d > 0).map((d) => ({
              value: String(d),
              label: d === 0 ? "Tanpa tambahan" : formatDuration(d),
            }))}
          />
        </Field>
      </div>
    </Dialog>
  )
}
