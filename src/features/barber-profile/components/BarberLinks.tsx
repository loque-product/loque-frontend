import { Copy, Eye, CalendarCheck, QrCode } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Async, Button, Card, CardContent, Dialog, EmptyState } from "@/shared/components"
import { env } from "@/shared/lib/env"
import type { Barber } from "@/shared/types"
import { useBarbers } from "../hooks"

const link = (b: Barber) => `${env.publicBaseUrl}/b/${b.slug}`

function Qr({ text }: { text: string }) {
  const [src, setSrc] = useState("")
  useEffect(() => {
    // qrcode dimuat dinamis supaya tidak ikut muat awal.
    void import("qrcode").then(({ default: QRCode }) =>
      QRCode.toDataURL(text, {
        width: 256,
        margin: 1,
        color: { dark: "#064e3b", light: "#ffffff" },
      }).then(setSrc),
    )
  }, [text])
  return src ? <img src={src} alt={`Kode QR untuk ${text}`} className="size-64" /> : null
}

/** Tautan barber, QR, dan statistik bulan ini (hanya baca). */
export function BarberLinks() {
  const q = useBarbers()
  const [qr, setQr] = useState<Barber | null>(null)
  const copy = async (b: Barber) => {
    await navigator.clipboard?.writeText(link(b)).catch(() => undefined)
    toast.success("Tautan disalin.")
  }
  return (
    <Async
      query={q}
      isEmpty={(d) => d.length === 0}
      empty={<EmptyState title="Belum ada barber." />}
    >
      {(barbers) => (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {barbers.map((b) => (
            <Card key={b.id}>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{b.name}</p>
                    <p className="break-all text-xs text-slate-600">{link(b)}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="secondary"
                      size="icon"
                      aria-label={`Salin tautan ${b.name}`}
                      onClick={() => void copy(b)}
                    >
                      <Copy className="size-4" aria-hidden />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      aria-label={`Tampilkan QR ${b.name}`}
                      onClick={() => setQr(b)}
                    >
                      <QrCode className="size-4" aria-hidden />
                    </Button>
                  </div>
                </div>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg bg-slate-50 p-2">
                    <dt className="flex items-center gap-1 text-xs text-slate-600">
                      <Eye className="size-3.5" aria-hidden />
                      Profil dilihat
                    </dt>
                    <dd className="font-semibold">{b.linkStats.views}</dd>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2">
                    <dt className="flex items-center gap-1 text-xs text-slate-600">
                      <CalendarCheck className="size-3.5" aria-hidden />
                      Booking dari tautan
                    </dt>
                    <dd className="font-semibold">{b.linkStats.bookings}</dd>
                  </div>
                </dl>
                <div className="flex flex-wrap gap-2 text-xs text-slate-700">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5">
                    Instagram {b.linkStats.instagram}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5">
                    TikTok {b.linkStats.tiktok}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5">
                    WhatsApp {b.linkStats.whatsapp}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
          <Dialog
            open={qr !== null}
            onOpenChange={(o) => !o && setQr(null)}
            title={`QR ${qr?.name ?? ""}`}
            description="Pindai untuk membuka profil barber."
          >
            <div className="flex justify-center">{qr && <Qr text={link(qr)} />}</div>
          </Dialog>
        </div>
      )}
    </Async>
  )
}
