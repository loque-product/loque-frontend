import { CATEGORY_LABEL } from "@/shared/constants"
import { Checkbox } from "@/shared/components"
import type { Id, Service, ServiceCategory, ServiceOverride } from "@/shared/types"
import { formatDuration, formatRupiah } from "@/shared/utils/format"
import { resolveService } from "@/features/catalog"

interface Props {
  services: Service[]
  overrides: ServiceOverride[]
  barberId: Id
  value: Id[]
  onChange: (ids: Id[]) => void
  /** Harga tersimpan untuk layanan yang sudah ada di booking. */
  snapshot?: { serviceId: Id; price: number }[]
}

const ORDER: ServiceCategory[] = ["haircut", "longtrim", "addon", "treatment", "coloring"]

/** Pilihan layanan; Haircut dan Long Trim saling eksklusif, yang lain boleh banyak. */
export function ServicePicker({ services, overrides, barberId, value, onChange, snapshot }: Props) {
  const active = services.filter((s) => s.active || value.includes(s.id))
  const toggle = (s: Service, checked: boolean) => {
    let next = checked ? [...value, s.id] : value.filter((v) => v !== s.id)
    if (checked && (s.category === "haircut" || s.category === "longtrim")) {
      const other = services
        .filter((x) => (x.category === "haircut" || x.category === "longtrim") && x.id !== s.id)
        .map((x) => x.id)
      next = next.filter((v) => !other.includes(v))
    }
    onChange(next)
  }
  return (
    <div className="flex flex-col gap-3">
      {ORDER.map((cat) => {
        const list = active.filter((s) => s.category === cat)
        if (list.length === 0) return null
        return (
          <fieldset key={cat}>
            <legend className="mb-1 text-xs font-semibold text-slate-600">
              {CATEGORY_LABEL[cat]}
            </legend>
            <div className="grid gap-x-4 sm:grid-cols-2">
              {list.map((s) => {
                const r = resolveService(s, overrides, barberId)
                const price = snapshot?.find((x) => x.serviceId === s.id)?.price ?? r.price
                return (
                  <Checkbox
                    key={s.id}
                    checked={value.includes(s.id)}
                    onCheckedChange={(c) => toggle(s, c === true)}
                    label={
                      <span className="flex flex-col">
                        <span>{s.name}</span>
                        <span className="text-xs text-slate-600">
                          {s.startingFrom ? "Mulai dari " : ""}
                          {formatRupiah(price)}
                          {r.duration > 0 ? ` - ${formatDuration(r.duration)}` : ""}
                        </span>
                      </span>
                    }
                  />
                )
              })}
            </div>
          </fieldset>
        )
      })}
    </div>
  )
}
