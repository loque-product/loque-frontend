import { Copy, Download, Share2 } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { Async, Button, Card, CardContent, PageSkeleton } from "@/shared/components"
import { usePageMeta } from "@/shared/hooks"
import { env } from "@/shared/lib/env"
import { buildBarberLink, type ShareChannel } from "@/shared/domain/links"
import { useBarberLinks } from "../hooks"
import { barWidth, CHANNEL_NAME, CHANNEL_ORDER, normalizeStats } from "../domain/stats"
import type { BarberLinkInfo } from "../types"

const LABEL: Record<ShareChannel, string> = { ig: "Instagram", tt: "TikTok", wa: "WhatsApp" }

function LinkRow({ url, channel, name }: { url: string; channel: ShareChannel; name: string }) {
  const share = typeof navigator !== "undefined" && typeof navigator.share === "function"
  return (
    <li className="flex flex-col gap-2 py-3">
      <p className="text-sm font-medium text-slate-900">{LABEL[channel]}</p>
      <p className="break-all text-xs text-slate-600">{url}</p>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            void navigator.clipboard?.writeText(url).then(
              () => toast.success(`Tautan ${LABEL[channel]} disalin.`),
              () => toast.error("Tautan belum bisa disalin."),
            )
          }
        >
          <Copy className="size-3.5" aria-hidden />
          Salin
        </Button>
        {share && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void navigator.share({ title: name, url }).catch(() => undefined)}
          >
            <Share2 className="size-3.5" aria-hidden />
            Bagikan
          </Button>
        )}
      </div>
    </li>
  )
}

function QrCard({ info, url }: { info: BarberLinkInfo; url: string }) {
  const poster = useRef<HTMLDivElement>(null)
  const [qr, setQr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    let live = true
    void import("qrcode")
      .then(({ toDataURL }) => toDataURL(url, { margin: 1, width: 512 }))
      .then((d) => live && setQr(d))
    return () => {
      live = false
    }
  }, [url])
  const download = async () => {
    if (!poster.current) return
    setBusy(true)
    try {
      const { toPng } = await import("html-to-image")
      const png = await toPng(poster.current, { pixelRatio: 2, backgroundColor: "#ffffff" })
      const a = document.createElement("a")
      a.href = png
      a.download = `qr-${info.slug}.png`
      a.click()
    } catch {
      toast.error("Kode QR belum bisa diunduh. Coba lagi.")
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="flex flex-col gap-3">
      <div ref={poster} className="flex w-64 flex-col items-center gap-2 bg-white p-4 text-center">
        <p className="text-xl font-semibold text-slate-900">{info.name}</p>
        <p className="text-xs text-slate-600">{info.shopName}</p>
        {qr ? (
          <img
            loading="lazy"
            decoding="async"
            src={qr}
            alt={`Kode QR profil ${info.name}`}
            width={192}
            height={192}
            className="size-48"
          />
        ) : (
          <div className="size-48 bg-slate-100" />
        )}
        <p className="text-xs text-slate-600">Pindai untuk booking</p>
      </div>
      <Button
        variant="secondary"
        className="self-start"
        loading={busy}
        disabled={!qr}
        onClick={() => void download()}
      >
        <Download className="size-4" aria-hidden />
        Unduh QR
      </Button>
    </div>
  )
}

function Stats({ info }: { info: BarberLinkInfo }) {
  const rows = useMemo(() => normalizeStats(info.stats), [info.stats])
  const max = Math.max(0, ...rows.map((r) => Math.max(r.views, r.bookings)))
  return (
    <table className="w-full text-sm">
      <caption className="sr-only">Statistik tautan bulan ini per kanal</caption>
      <thead>
        <tr className="text-left text-xs text-slate-600">
          <th scope="col" className="py-2 font-medium">
            Kanal
          </th>
          <th scope="col" className="py-2 font-medium">
            Profil dilihat
          </th>
          <th scope="col" className="py-2 font-medium">
            Booking
          </th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {rows.map((r) => (
          <tr key={r.ref}>
            <th scope="row" className="py-2 text-left font-medium text-slate-900">
              {CHANNEL_NAME[r.ref]}
            </th>
            <td className="py-2">
              <span className="tabular-nums">{r.views}</span>
              <span className="mt-1 block h-1.5 rounded-full bg-slate-100">
                <span
                  className="block h-full rounded-full bg-primary-700"
                  style={{ width: `${barWidth(r.views, max)}%` }}
                />
              </span>
            </td>
            <td className="py-2">
              <span className="tabular-nums">{r.bookings}</span>
              <span className="mt-1 block h-1.5 rounded-full bg-slate-100">
                <span
                  className="block h-full rounded-full bg-primary-700"
                  style={{ width: `${barWidth(r.bookings, max)}%` }}
                />
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function BarberLinksView() {
  usePageMeta("Tautan")
  const q = useBarberLinks()
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-title font-semibold text-slate-900">Tautan</h1>
      <Async query={q} skeleton={<PageSkeleton rows={5} />}>
        {(info) => (
          <>
            <section aria-labelledby="links-h" className="flex flex-col gap-1">
              <h2 id="links-h" className="text-section font-semibold text-slate-900">
                Tautan pribadi
              </h2>
              <p className="text-xs text-slate-600">Tautan tetap sama walau nama Anda diganti.</p>
              <ul className="divide-y rounded-xl bg-white px-4 shadow-card">
                {CHANNEL_ORDER.map((c) => (
                  <LinkRow
                    key={c}
                    channel={c}
                    name={info.name}
                    url={buildBarberLink(env.publicBaseUrl, info.slug, c)}
                  />
                ))}
              </ul>
            </section>
            <section aria-labelledby="qr-h" className="flex flex-col gap-2">
              <h2 id="qr-h" className="text-section font-semibold text-slate-900">
                Kode QR
              </h2>
              <Card>
                <CardContent>
                  <QrCard info={info} url={buildBarberLink(env.publicBaseUrl, info.slug)} />
                </CardContent>
              </Card>
            </section>
            <section aria-labelledby="stat-h" className="flex flex-col gap-2">
              <h2 id="stat-h" className="text-section font-semibold text-slate-900">
                Statistik bulan ini
              </h2>
              <Card>
                <CardContent>
                  <Stats info={info} />
                </CardContent>
              </Card>
            </section>
          </>
        )}
      </Async>
    </div>
  )
}
