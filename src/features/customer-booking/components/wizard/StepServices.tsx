import { Checkbox, PageSkeleton, RadioGroup, RadioRow } from "@/shared/components"
import { CATEGORY_LABEL } from "@/shared/constants"
import { usePageMeta } from "@/shared/hooks"
import { formatDuration, formatRupiah } from "@/shared/utils/format"
import type { ServiceCategory } from "@/shared/types"
import { useNavigate } from "react-router"
import { track } from "@/features/analytics"
import {
  EXCLUSIVE_CATEGORIES,
  serviceRange,
  toggleService,
  type CatalogService,
} from "../../domain/cart"
import { WizardFrame } from "./WizardFrame"
import { useCart } from "./useCart"

const ORDER: ServiceCategory[] = ["haircut", "longtrim", "addon", "treatment", "coloring"]

function PriceLabel({ s }: { s: CatalogService }) {
  const { c, eligible, barber } = useCart()
  if (!c) return null
  const r = serviceRange(s, c.overrides, barber ? [barber.id] : eligible.map((b) => b.id))
  const price =
    r.min === r.max ? formatRupiah(r.min) : `${formatRupiah(r.min)} - ${formatRupiah(r.max)}`
  return (
    <span className="shrink-0 text-right text-sm font-semibold tabular-nums text-slate-900">
      {s.startingFrom && (
        <span className="mr-1 text-xs font-normal text-slate-600">mulai dari</span>
      )}
      {price}
    </span>
  )
}

const meta = (s: CatalogService) =>
  s.duration > 0 ? formatDuration(s.duration) : "Tanpa tambahan waktu"

export default function StepServices() {
  usePageMeta("Pilih layanan")
  const { w, c, services, quote, ready } = useCart()
  const navigate = useNavigate()
  if (!ready || !c) return <PageSkeleton />
  const exclusive = services.filter((s) =>
    (EXCLUSIVE_CATEGORIES as readonly string[]).includes(s.category),
  )
  const selectedExclusive = exclusive.find((s) => w.serviceIds.includes(s.id))?.id ?? ""
  const set = (ids: string[]) => w.patch({ serviceIds: ids, date: null, time: null })
  const pick = (s: CatalogService) => set(toggleService(w.serviceIds, s, c.services))
  const hasEstimate =
    quote?.estimate ?? services.some((s) => w.serviceIds.includes(s.id) && s.startingFrom)

  return (
    <WizardFrame
      step={2}
      title="Pilih layanan"
      canNext={w.serviceIds.length > 0}
      onNext={() => {
        track("service_selected", { count: w.serviceIds.length })
        navigate("/booking/barber")
      }}
    >
      {exclusive.length > 0 && (
        <section aria-labelledby="g-main" className="flex flex-col gap-1">
          <h2 id="g-main" className="text-sm font-semibold text-slate-900">
            Haircut atau Long Trim{" "}
            <span className="font-normal text-slate-600">(pilih salah satu)</span>
          </h2>
          <RadioGroup
            value={selectedExclusive}
            onValueChange={(id) => pick(exclusive.find((s) => s.id === id)!)}
            aria-labelledby="g-main"
            className="divide-y rounded-xl bg-white px-4 shadow-card"
          >
            {exclusive.map((s) => (
              <RadioRow
                key={s.id}
                value={s.id}
                label={s.name}
                description={`${CATEGORY_LABEL[s.category]} · ${meta(s)}`}
                trailing={<PriceLabel s={s} />}
              />
            ))}
          </RadioGroup>
        </section>
      )}
      {ORDER.filter((cat) => !(EXCLUSIVE_CATEGORIES as readonly string[]).includes(cat)).map(
        (cat) => {
          const rows = services.filter((s) => s.category === cat)
          if (rows.length === 0) return null
          return (
            <section key={cat} aria-labelledby={`g-${cat}`} className="flex flex-col gap-1">
              <h2 id={`g-${cat}`} className="text-sm font-semibold text-slate-900">
                {CATEGORY_LABEL[cat]}
              </h2>
              <ul className="divide-y rounded-xl bg-white px-4 shadow-card">
                {rows.map((s) => (
                  <li key={s.id} className="flex items-center gap-3">
                    <Checkbox
                      className="flex-1"
                      checked={w.serviceIds.includes(s.id)}
                      onCheckedChange={() => pick(s)}
                      label={
                        <span className="block">
                          <span className="block font-medium text-slate-900">{s.name}</span>
                          <span className="block text-xs text-slate-600">{meta(s)}</span>
                        </span>
                      }
                    />
                    <PriceLabel s={s} />
                  </li>
                ))}
              </ul>
            </section>
          )
        },
      )}
      {hasEstimate && (
        <p className="text-xs text-slate-600">
          Layanan "mulai dari" dihitung sebagai estimasi. Harga akhir dikonfirmasi di toko.
        </p>
      )}
      {services.length === 0 && (
        <p className="text-sm text-slate-600">Belum ada layanan untuk pilihan ini.</p>
      )}
    </WizardFrame>
  )
}
