import { Link } from "react-router"
import { ArrowLeft } from "lucide-react"
import { Async, Banner, PageSkeleton } from "@/shared/components"
import { buttonVariants } from "@/shared/components/ui/button"
import { usePageMeta } from "@/shared/hooks"
import { useBarberMe } from "@/features/barber-account"
import { useBarberList, useBarberProfile } from "@/features/barbers"
import { bestRatedId } from "@/features/reviews"
import { BarberProfileBody } from "../public/BarberProfileBody"

function Preview({ slug }: { slug: string }) {
  const profile = useBarberProfile(slug)
  const list = useBarberList()
  const best = list.data
    ? bestRatedId(
        list.data.map((x) => ({
          id: x.id,
          rating: x.rating,
          reviewCount: x.reviewCount,
          lastReviewAt: x.lastReviewAt ?? "",
          badgeHidden: x.badgeHidden,
        })),
      )
    : null
  return (
    <Async query={profile} skeleton={<PageSkeleton />}>
      {(p) => <BarberProfileBody profile={p} best={best} preview />}
    </Async>
  )
}

/** Pratinjau profil seperti yang dilihat customer: tanpa pelacakan, tanpa tombol booking. */
export default function PreviewRoute() {
  usePageMeta("Pratinjau profil")
  const me = useBarberMe()
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link to="/barber/profil" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          <ArrowLeft className="size-4" aria-hidden /> Kembali ke profil
        </Link>
      </div>
      <Banner tone="info" title="Pratinjau">
        Begini profil Anda terlihat oleh customer. Foto yang disembunyikan tidak tampil.
      </Banner>
      <Async query={me} skeleton={<PageSkeleton />}>
        {(m) => <Preview slug={m.slug} />}
      </Async>
    </div>
  )
}
