import type { ColumnDef } from "@tanstack/react-table"
import { Eye, SlidersHorizontal, X } from "lucide-react"
import { useMemo, useState } from "react"
import {
  Badge,
  Banner,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  DatePicker,
  DateTimeText,
  Dialog,
  Field,
  RoleBadge,
  Select,
  Sheet,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components"
import { toYmd } from "@/shared/domain/time"
import { useIsDesktop } from "@/shared/hooks"
import type { AuditCategory, AuditLog } from "@/shared/types"
import { useGlobalAudit, useShopAudit } from "../hooks"
import { AUDIT_CATEGORY_LABEL } from "../types"

const ALL = "all"
const ADMIN_CATEGORIES: AuditCategory[] = ["price", "schedule", "fee", "void", "no_show"]

export function AuditTable({ scope }: { scope: "shop" | "global" }) {
  const shop = useShopAudit(scope === "shop")
  const global = useGlobalAudit(scope === "global")
  const q = scope === "shop" ? shop : global
  const desktop = useIsDesktop()
  const [actor, setActor] = useState(ALL)
  const [category, setCategory] = useState(ALL)
  const [shopId, setShopId] = useState(ALL)
  const [date, setDate] = useState<string | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [detail, setDetail] = useState<AuditLog | null>(null)

  const actors = useMemo(
    () => [...new Map((q.data ?? []).map((a) => [a.actorId, a.actorName]))],
    [q.data],
  )
  // Nama toko diambil dari entri audit sehingga tetap tampil setelah toko dihapus.
  const shops = useMemo(
    () => [
      ...new Map(
        (q.data ?? [])
          .filter((a): a is typeof a & { shopId: string } => a.shopId !== null)
          .map((a) => [a.shopId, a.shopName ?? "Toko dihapus"] as const),
      ),
    ],
    [q.data],
  )
  const base = (q.data ?? []).filter(
    (a) =>
      (actor === ALL || a.actorId === actor) &&
      (category === ALL || a.category === category) &&
      (shopId === ALL || a.shopId === shopId) &&
      (!date || toYmd(a.at) === date),
  )
  const mk = (rows: AuditLog[]) => ({ ...q, data: q.data ? rows : undefined })

  const columns = useMemo<ColumnDef<AuditLog, unknown>[]>(
    () => [
      {
        header: "Waktu",
        cell: ({ row }) => <DateTimeText value={row.original.at} />,
      },
      ...(scope === "global"
        ? [
            {
              header: "Toko",
              cell: ({ row }) =>
                row.original.shopId === null ? "Loque" : (row.original.shopName ?? "Toko dihapus"),
            } as ColumnDef<AuditLog, unknown>,
          ]
        : []),
      {
        header: "Pelaku",
        cell: ({ row }) => (
          <span className="flex flex-col items-end gap-1 md:items-start">
            <span className="font-medium">{row.original.actorName}</span>
            <RoleBadge role={row.original.actorRole} />
          </span>
        ),
      },
      {
        header: "Aksi",
        cell: ({ row }) => (
          <span className="flex flex-col items-end gap-1 md:items-start">
            <span>{row.original.action}</span>
            <Badge tone="slate">{AUDIT_CATEGORY_LABEL[row.original.category]}</Badge>
          </span>
        ),
      },
      { header: "Objek", cell: ({ row }) => row.original.object },
      {
        header: "Perubahan",
        cell: ({ row }) =>
          row.original.before || row.original.after ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                setDetail(row.original)
              }}
            >
              <Eye className="size-4" aria-hidden />
              Buka
            </Button>
          ) : (
            <span className="text-slate-500">-</span>
          ),
      },
    ],
    [scope],
  )

  const filters = (
    <div className="flex flex-wrap items-end gap-3">
      <Field label="Pelaku" className="w-48">
        <Select
          value={actor}
          onValueChange={setActor}
          options={[
            { value: ALL, label: "Semua pelaku" },
            ...actors.map(([id, n]) => ({ value: id, label: n })),
          ]}
        />
      </Field>
      <Field label="Jenis aksi" className="w-52">
        <Select
          value={category}
          onValueChange={setCategory}
          options={[
            { value: ALL, label: "Semua jenis" },
            ...(Object.keys(AUDIT_CATEGORY_LABEL) as AuditCategory[]).map((c) => ({
              value: c,
              label: AUDIT_CATEGORY_LABEL[c],
            })),
          ]}
        />
      </Field>
      {scope === "global" && (
        <Field label="Toko" className="w-48">
          <Select
            value={shopId}
            onValueChange={setShopId}
            options={[
              { value: ALL, label: "Semua toko" },
              ...shops.map(([id, name]) => ({ value: id, label: name })),
            ]}
          />
        </Field>
      )}
      <Field label="Tanggal">
        <div className="flex gap-1">
          <DatePicker value={date ?? toYmd(Date.now())} onChange={setDate} />
          {date && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Hapus filter tanggal"
              onClick={() => setDate(null)}
            >
              <X className="size-4" aria-hidden />
            </Button>
          )}
        </div>
      </Field>
    </div>
  )

  const adminRows = base.filter(
    (a) => a.actorRole === "admin_kasir" && ADMIN_CATEGORIES.includes(a.category),
  )
  const byActor = [
    ...adminRows.reduce(
      (m, a) => m.set(a.actorName, [...(m.get(a.actorName) ?? []), a]),
      new Map<string, AuditLog[]>(),
    ),
  ]

  return (
    <div className="flex flex-col gap-4">
      {desktop ? (
        filters
      ) : (
        <div>
          <Button variant="secondary" onClick={() => setFilterOpen(true)}>
            <SlidersHorizontal className="size-4" aria-hidden />
            Filter
          </Button>
        </div>
      )}
      <Sheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        title="Filter"
        footer={<Button onClick={() => setFilterOpen(false)}>Terapkan</Button>}
      >
        {filters}
      </Sheet>
      {scope === "global" && (
        <Banner tone="info">Semua akses data pelanggan oleh Super Admin tercatat di sini.</Banner>
      )}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Semua</TabsTrigger>
          {scope === "shop" && (
            <TabsTrigger value="admin">Perubahan oleh Admin & Kasir</TabsTrigger>
          )}
          {scope === "global" && (
            <TabsTrigger value="access">Akses data pelanggan oleh Super Admin</TabsTrigger>
          )}
          {scope === "global" && <TabsTrigger value="moderation">Keputusan moderasi</TabsTrigger>}
        </TabsList>
        <TabsContent value="all">
          <DataTable
            columns={columns}
            query={mk(base)}
            rowKey={(a) => a.id}
            searchText={(a) => `${a.actorName} ${a.action} ${a.object}`}
            searchPlaceholder="Cari aksi atau objek"
            emptyTitle="Belum ada entri audit."
          />
        </TabsContent>
        {scope === "shop" && (
          <TabsContent value="admin">
            <div className="flex flex-col gap-4">
              {byActor.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                  {byActor.map(([name, rows]) => (
                    <Card key={name}>
                      <CardHeader>
                        <CardTitle>{name}</CardTitle>
                        <span className="text-sm text-slate-600">{rows.length} perubahan</span>
                      </CardHeader>
                      <CardContent className="flex flex-wrap gap-2">
                        {ADMIN_CATEGORIES.map((c) => (
                          <Badge
                            key={c}
                            tone={rows.some((r) => r.category === c) ? "primary" : "slate"}
                          >
                            {AUDIT_CATEGORY_LABEL[c]}: {rows.filter((r) => r.category === c).length}
                          </Badge>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              <DataTable
                columns={columns}
                query={mk(adminRows)}
                rowKey={(a) => a.id}
                emptyTitle="Belum ada perubahan oleh Admin & Kasir."
              />
            </div>
          </TabsContent>
        )}
        {scope === "global" && (
          <TabsContent value="access">
            <DataTable
              columns={columns}
              query={mk(base.filter((a) => a.category === "customer_access"))}
              rowKey={(a) => a.id}
              emptyTitle="Belum ada akses data pelanggan."
            />
          </TabsContent>
        )}
        {scope === "global" && (
          <TabsContent value="moderation">
            <DataTable
              columns={columns}
              query={mk(base.filter((a) => a.category === "moderation"))}
              rowKey={(a) => a.id}
              emptyTitle="Belum ada keputusan moderasi."
            />
          </TabsContent>
        )}
      </Tabs>
      <Dialog
        open={detail !== null}
        onOpenChange={(o) => !o && setDetail(null)}
        title="Perubahan"
        description={detail?.action}
      >
        {detail && (
          <dl className="flex flex-col gap-3 text-sm">
            <div>
              <dt className="text-xs text-slate-600">Objek</dt>
              <dd className="font-medium">{detail.object}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-600">Sebelum</dt>
              <dd className="font-medium">{detail.before ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-600">Sesudah</dt>
              <dd className="font-medium">{detail.after ?? "-"}</dd>
            </div>
          </dl>
        )}
      </Dialog>
    </div>
  )
}
