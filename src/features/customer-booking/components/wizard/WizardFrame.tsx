import { ArrowLeft } from "lucide-react"
import { useEffect, type ReactNode } from "react"
import { Navigate, useNavigate } from "react-router"
import { Banner, Button, Card, CardContent, MoneyText } from "@/shared/components"
import { useOnlineStatus } from "@/shared/hooks"
import { GENDER_LABEL } from "@/shared/constants"
import { formatDayLong, formatRupiah } from "@/shared/utils/format"
import { WIZARD_STEPS } from "../../store/wizard"
import { useCart } from "./useCart"

/** Langkah paling awal yang prasyaratnya belum terpenuhi (null = langkah ini boleh dibuka). */
export function useStepGuard(step: number): string | null {
  const { w } = useCart()
  if (step >= 2 && !w.gender) return WIZARD_STEPS[0].path
  if (step >= 3 && w.serviceIds.length === 0) return WIZARD_STEPS[1].path
  if (step >= 4 && !w.barberId) return WIZARD_STEPS[2].path
  if (step >= 5 && (!w.date || !w.time)) return WIZARD_STEPS[3].path
  return null
}

function SummaryBody() {
  const { w, barber, quote, range, c } = useCart()
  const lines =
    quote?.items ??
    c?.services
      .filter((s) => w.serviceIds.includes(s.id))
      .map((s) => ({ serviceId: s.id, name: s.name, price: null as number | null })) ??
    []
  return (
    <dl className="flex flex-col gap-2 text-sm">
      {w.gender && (
        <div className="flex justify-between gap-3">
          <dt className="text-slate-600">Tamu</dt>
          <dd className="text-right text-slate-900">
            {w.forSelf ? "Diri sendiri" : w.guestName || "Orang lain"}, {GENDER_LABEL[w.gender]}
          </dd>
        </div>
      )}
      {lines.length > 0 && (
        <div>
          <dt className="text-slate-600">Layanan</dt>
          <dd>
            <ul className="mt-1 flex flex-col gap-1">
              {lines.map((l) => (
                <li key={l.serviceId} className="flex justify-between gap-3 text-slate-900">
                  <span>{l.name}</span>
                  {l.price !== null && <MoneyText value={l.price} className="tabular-nums" />}
                </li>
              ))}
            </ul>
          </dd>
        </div>
      )}
      {barber && (
        <div className="flex justify-between gap-3">
          <dt className="text-slate-600">Barber</dt>
          <dd className="text-slate-900">{barber.name}</dd>
        </div>
      )}
      {w.date && w.time && (
        <div className="flex justify-between gap-3">
          <dt className="text-slate-600">Jadwal</dt>
          <dd className="text-right text-slate-900">
            {formatDayLong(w.date)}, {w.time.replace(":", ".")} WIB
          </dd>
        </div>
      )}
      {(quote || range) && (
        <div className="flex justify-between gap-3 border-t pt-2 font-semibold text-slate-900">
          <dt>{quote?.estimate ? "Estimasi total" : "Total"}</dt>
          <dd className="tabular-nums">
            {quote
              ? formatRupiah(quote.total)
              : range && range.min !== range.max
                ? `${formatRupiah(range.min)} - ${formatRupiah(range.max)}`
                : range
                  ? formatRupiah(range.min)
                  : ""}
          </dd>
        </div>
      )}
    </dl>
  )
}

/** Kerangka tiap langkah: penanda langkah, Kembali, ringkasan keranjang (bar bawah di mobile, panel samping di layar lebar). */
export function WizardFrame({
  step,
  title,
  canNext,
  onNext,
  nextLabel = "Lanjut",
  nextLoading,
  notice,
  children,
}: {
  step: number
  title: string
  canNext: boolean
  onNext: () => void
  nextLabel?: string
  nextLoading?: boolean
  notice?: string | null
  children: ReactNode
}) {
  const navigate = useNavigate()
  const online = useOnlineStatus()
  const redirect = useStepGuard(step)
  const { ready } = useCart()
  useEffect(() => window.scrollTo({ top: 0 }), [step])
  if (ready && redirect) return <Navigate to={redirect} replace />
  const prev = step > 1 ? WIZARD_STEPS[step - 2].path : "/"
  const nextButton = (
    <Button
      className="w-full lg:w-auto"
      disabled={!canNext || !online}
      loading={nextLoading}
      onClick={onNext}
    >
      {nextLabel}
    </Button>
  )
  return (
    <div className="flex flex-col gap-4 pb-28 lg:pb-0">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(prev)} aria-label="Kembali">
          <ArrowLeft className="size-4" aria-hidden />
          Kembali
        </Button>
        <p className="text-sm text-slate-600" aria-live="polite">
          Langkah {step} dari 5
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-4">
          <h1 className="text-title font-semibold text-slate-900">{title}</h1>
          {notice && <Banner tone="warning">{notice}</Banner>}
          {children}
          <div className="hidden lg:block">{nextButton}</div>
        </div>
        <aside className="hidden lg:block" aria-label="Ringkasan booking">
          <Card className="sticky top-20">
            <CardContent className="p-4">
              <h2 className="mb-3 text-base font-semibold text-slate-900">Ringkasan</h2>
              <SummaryBody />
            </CardContent>
          </Card>
        </aside>
      </div>
      <div className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t bg-white px-4 py-3 lg:hidden">
        <div className="mx-auto flex max-w-160 flex-col gap-2">
          <MobileTotal />
          {nextButton}
        </div>
      </div>
    </div>
  )
}

function MobileTotal() {
  const { quote, range } = useCart()
  if (!quote && !range) return null
  const text = quote
    ? formatRupiah(quote.total)
    : range && range.min !== range.max
      ? `${formatRupiah(range.min)} - ${formatRupiah(range.max)}`
      : range
        ? formatRupiah(range.min)
        : ""
  return (
    <p className="flex justify-between text-sm text-slate-700">
      <span>{quote?.estimate ? "Estimasi total" : "Total"}</span>
      <span className="font-semibold tabular-nums text-slate-900">{text}</span>
    </p>
  )
}
