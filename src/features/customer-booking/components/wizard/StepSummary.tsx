import { useState } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { ApiError } from "@/shared/api"
import { Banner, Card, CardContent, Checkbox, MoneyText, PageSkeleton } from "@/shared/components"
import { goExternal } from "@/shared/lib/external-navigation"
import { usePageMeta } from "@/shared/hooks"
import { formatDayLong, formatDuration, formatRupiah } from "@/shared/utils/format"
import { track } from "@/features/analytics"
import { feeSummary } from "@/features/payments"
import { useQueryClient } from "@tanstack/react-query"
import { cbKey, useCreateCustomerBooking, useStartPayment } from "../../hooks"
import { useWizard } from "../../store/wizard"
import { WizardFrame } from "./WizardFrame"
import { useCart } from "./useCart"

/** Kebijakan tampil sebelum tombol bayar; fee yang hangus disebut dengan nominal sebenarnya. */
export function PolicyText({ fee, none }: { fee: number; none: boolean }) {
  return (
    <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-slate-800">
      <li>
        Batal: bisa sampai jam mulai lewat Booking saya.{" "}
        {none ? "" : `Booking fee ${formatRupiah(fee)} tidak dikembalikan.`}
      </li>
      <li>
        Tidak hadir: toko menunggu 15 menit. Setelah itu booking ditandai tidak hadir
        {none ? "." : ` dan booking fee ${formatRupiah(fee)} hangus.`}
      </li>
      <li>Ganti jadwal: hubungi toko lewat WhatsApp. Tidak ada ganti jadwal mandiri.</li>
    </ul>
  )
}

export default function StepSummary() {
  usePageMeta("Ringkasan booking")
  const { w, c, barber, quote, ready } = useCart()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const create = useCreateCustomerBooking()
  const pay = useStartPayment()
  const [accepted, setAccepted] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const clear = useWizard((s) => s.clear)
  if (!ready || !c || !quote || !barber || !w.gender || !w.date || !w.time) return <PageSkeleton />

  const fee = feeSummary(c.feeMode, c.feeAmount, quote.total)
  const busy = create.isPending || pay.isPending

  const submit = () => {
    setNotice(null)
    create.mutate(
      {
        guest: {
          forSelf: w.forSelf,
          guestName: w.forSelf ? "" : w.guestName.trim(),
          gender: w.gender!,
        },
        barberId: barber.id,
        serviceIds: w.serviceIds,
        date: w.date!,
        time: w.time!,
        expectedFee: { mode: c.feeMode, amount: c.feeAmount },
        policyAccepted: accepted,
        ref: w.ref ?? undefined,
      },
      {
        onSuccess: async (r) => {
          clear()
          if (!r.paymentRequired)
            return navigate(`/booking/status/${r.booking.id}`, { replace: true })
          track("payment_opened")
          try {
            const s = await pay.mutateAsync(r.booking.id)
            goExternal(s.redirectUrl)
          } catch {
            // Hold sudah dibuat; layar status menyediakan "Lanjutkan pembayaran".
            navigate(`/booking/status/${r.booking.id}`, { replace: true })
          }
        },
        onError: (e) => {
          const err = ApiError.from(e)
          if (err.code === "SLOT_TAKEN") {
            w.patch({ time: null })
            navigate("/booking/jadwal", {
              replace: true,
              state: { notice: "Jam ini baru saja diambil. Pilih jam lain." },
            })
          } else if (err.code === "FEE_CHANGED") {
            setAccepted(false)
            setNotice("Booking fee berubah. Periksa ringkasan terbaru lalu konfirmasi lagi.")
            void qc.invalidateQueries({ queryKey: [...cbKey, "catalog"] })
          } else if (err.code === "HOLD_EXISTS") {
            void qc.invalidateQueries({ queryKey: [...cbKey, "hold"] })
            window.dispatchEvent(new Event("loque:hold-exists"))
          } else toast.error(err.message)
        },
      },
    )
  }

  return (
    <WizardFrame
      step={5}
      title="Ringkasan dan bayar"
      canNext={accepted}
      onNext={submit}
      nextLabel={fee.payLabel}
      nextLoading={busy}
      notice={notice}
    >
      <Card>
        <CardContent className="flex flex-col gap-4 p-4">
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-slate-600">Barber</dt>
              <dd className="text-slate-900">{barber.name}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-600">Jadwal</dt>
              <dd className="text-right text-slate-900">
                {formatDayLong(w.date)}, {w.time.replace(":", ".")} WIB
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-600">Durasi</dt>
              <dd className="text-slate-900">{formatDuration(quote.duration)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-600">Tamu</dt>
              <dd className="text-slate-900">{w.forSelf ? "Diri sendiri" : w.guestName}</dd>
            </div>
          </dl>
          <ul className="divide-y text-sm">
            {quote.items.map((i) => (
              <li key={i.serviceId} className="flex justify-between gap-3 py-2">
                <span className="text-slate-800">{i.name}</span>
                <MoneyText value={i.price} className="tabular-nums" />
              </li>
            ))}
          </ul>
          <p className="flex justify-between text-base font-semibold text-slate-900">
            <span>{quote.estimate ? "Estimasi total" : "Total"}</span>
            <MoneyText value={quote.total} className="tabular-nums" />
          </p>
          <Banner tone="info">{fee.text}</Banner>
        </CardContent>
      </Card>
      <section aria-labelledby="policy" className="flex flex-col gap-2">
        <h2 id="policy" className="text-sm font-semibold text-slate-900">
          Kebijakan
        </h2>
        <PolicyText fee={c.feeAmount} none={!fee.hasFee} />
        <Checkbox
          checked={accepted}
          onCheckedChange={(v) => setAccepted(v === true)}
          label="Saya memahami kebijakan ini"
        />
      </section>
      {fee.hasFee && (
        <p className="text-xs text-slate-600">
          Jam ditahan 15 menit untuk pembayaran. Anda diarahkan ke halaman pembayaran DOKU.
        </p>
      )}
    </WizardFrame>
  )
}
