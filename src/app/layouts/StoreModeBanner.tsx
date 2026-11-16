import { Store } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import { Button, Select } from "@/shared/components"
import { useActiveShop, useSession } from "@/features/auth"
import { useShopList } from "@/features/shops"

/** Banner tetap di atas selama Super Admin berada dalam mode toko. */
export function StoreModeBanner() {
  const role = useSession((s) => s.session?.role)
  const { shopId, setShop } = useActiveShop()
  const list = useShopList()
  const qc = useQueryClient()
  const navigate = useNavigate()
  if (role !== "super_admin" || !shopId) return null
  const current = list.data?.find((r) => r.shop.id === shopId)?.shop
  const frozen = current?.status === "frozen"
  return (
    <div className="shrink-0">
      <div
        role="status"
        className="flex flex-wrap items-center gap-x-4 gap-y-2 bg-warning-100 px-3 py-2 text-sm text-warning-800 md:px-6"
      >
        <span className="flex min-w-0 items-center gap-2 font-medium">
          <Store className="size-4 shrink-0" aria-hidden />
          Anda sedang mengelola {current?.name ?? "toko terpilih"} sebagai Super Admin
        </span>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-56">
            <Select
              aria-label="Pilih toko"
              value={shopId}
              onValueChange={(id) => {
                setShop(id)
                void qc.invalidateQueries()
              }}
              options={(list.data ?? []).map((r) => ({ value: r.shop.id, label: r.shop.name }))}
            />
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setShop(null)
              void qc.invalidateQueries()
              navigate("/sa/toko")
            }}
          >
            Keluar dari mode toko
          </Button>
        </div>
      </div>
      {frozen && (
        <div
          role="status"
          className="bg-info-100 px-3 py-2 text-sm font-medium text-info-700 md:px-6"
        >
          Toko sedang dibekukan. Toko tidak tampil ke publik dan tidak menerima booking baru.
        </div>
      )}
    </div>
  )
}
