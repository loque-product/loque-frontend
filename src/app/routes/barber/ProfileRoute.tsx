import { usePageMeta } from "@/shared/hooks"
import { BarberProfileView } from "@/features/barber-account"

export default function ProfileRoute() {
  usePageMeta("Profil")
  return <BarberProfileView />
}
