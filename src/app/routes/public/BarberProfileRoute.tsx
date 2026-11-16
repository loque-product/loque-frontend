import { useEffect } from "react"
import { Link, useNavigate, useParams, useSearchParams } from "react-router"
import { Async, EmptyState, PageSkeleton } from "@/shared/components"
import { buttonVariants } from "@/shared/components/ui/button"
import { usePageMeta } from "@/shared/hooks"
import { isShareChannel } from "@/shared/domain/links"
import { ApiError } from "@/shared/api"
import { setRef, track } from "@/features/analytics"
import { useBarberList, useBarberProfile } from "@/features/barbers"
import { bestRatedId } from "@/features/reviews"
import { beginBooking } from "@/features/customer-booking"
import { BarberProfileBody } from "./BarberProfileBody"

export default function BarberProfileRoute() {
  const { slug = "" } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const q = useBarberProfile(slug)
  const list = useBarberList()
  const b = q.data
  usePageMeta(
    b ? b.name : "Profil barber",
    b ? `${b.name}, ${b.specialties.join(", ")}` : undefined,
  )

  const refParam = params.get("ref")
  useEffect(() => {
    if (isShareChannel(refParam)) setRef(refParam)
  }, [refParam])
  useEffect(() => {
    if (b) track("profile_viewed", { barber: b.slug })
  }, [b])

  if (q.isError && ApiError.is(q.error) && q.error.code === "NOT_FOUND")
    return (
      <EmptyState
        title="Profil tidak tersedia"
        description="Barber ini tidak aktif atau tautan tidak dikenal."
        action={
          <Link to="/barber" className={buttonVariants({ variant: "secondary" })}>
            Lihat daftar barber
          </Link>
        }
      />
    )

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

  const book = () => {
    if (!b) return
    beginBooking({ barberId: b.id, fromProfile: true })
    track("book_clicked", { source: "profile", barber: b.slug })
    navigate("/booking/data-tamu")
  }

  return (
    <Async query={q} skeleton={<PageSkeleton />}>
      {(p) => <BarberProfileBody profile={p} best={best} onBook={book} />}
    </Async>
  )
}
