import { usePageMeta } from "@/shared/hooks"
import { BarberLinksView } from "@/features/barber-links"

export default function LinksRoute() {
  usePageMeta("Tautan saya")
  return <BarberLinksView />
}
