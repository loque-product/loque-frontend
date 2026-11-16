import { MapPin, MessageCircle } from "lucide-react"
import {
  Async,
  Card,
  CardContent,
  ImageWithFallback,
  PageSkeleton,
  PhotoGrid,
} from "@/shared/components"
import { buttonVariants } from "@/shared/components/ui/button"
import { usePageMeta, useNow } from "@/shared/hooks"
import { DAY_LABEL } from "@/shared/constants"
import { waLink } from "@/shared/lib/wa-link"
import { ReportPhotoButton } from "@/features/portfolio"
import { openStatus, useShopInfo } from "@/features/shop-info"

export default function ShopInfoRoute() {
  usePageMeta("Info toko", "Alamat, jam buka, dan galeri toko.")
  const q = useShopInfo()
  const now = useNow(60_000)
  return (
    <Async query={q} skeleton={<PageSkeleton />}>
      {(s) => {
        const st = openStatus(s.hours, now)
        return (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-4">
              <h1 className="font-serif text-hero font-medium text-slate-900">{s.name}</h1>
              <ImageWithFallback
                src={s.heroPhotoUrl}
                alt={`Foto ${s.name}`}
                ratio={4 / 3}
                className="w-full rounded-xl"
                eager
              />
              <p className="flex items-start gap-2 text-sm text-slate-800">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                {s.address}
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={s.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonVariants({ variant: "secondary" })}
                >
                  Buka Maps
                </a>
                <a
                  href={waLink(s.whatsapp, "Halo, saya ingin bertanya.")}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonVariants({ variant: "secondary" })}
                >
                  <MessageCircle className="size-4" aria-hidden />
                  WhatsApp
                </a>
                {s.instagram && (
                  <a
                    href={s.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className={buttonVariants({ variant: "secondary" })}
                  >
                    Instagram
                  </a>
                )}
                {s.tiktok && (
                  <a
                    href={s.tiktok}
                    target="_blank"
                    rel="noreferrer"
                    className={buttonVariants({ variant: "secondary" })}
                  >
                    TikTok
                  </a>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <Card>
                <CardContent className="flex flex-col gap-3 p-4">
                  <h2 className="text-section font-semibold text-slate-900">Jam buka</h2>
                  <p className="text-sm text-slate-700">{st.label}</p>
                  <dl className="divide-y text-sm">
                    {s.hours.days.map((d, i) => (
                      <div key={i} className="flex justify-between py-2">
                        <dt className="text-slate-700">{DAY_LABEL[i]}</dt>
                        <dd className="tabular-nums text-slate-900">
                          {d.open
                            ? `${d.from.replace(":", ".")} sampai ${d.to.replace(":", ".")}`
                            : "Tutup"}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
            </div>
            {s.gallery.length > 0 && (
              <section aria-labelledby="shop-gallery" className="flex flex-col gap-3 md:col-span-2">
                <h2 id="shop-gallery" className="text-section font-semibold text-slate-900">
                  Galeri
                </h2>
                <PhotoGrid
                  photos={s.gallery}
                  renderAction={(ph) => <ReportPhotoButton photoId={ph.id} />}
                />
              </section>
            )}
          </div>
        )
      }}
    </Async>
  )
}
