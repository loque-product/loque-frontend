import { usePageMeta } from "@/shared/hooks"
import { BarberAccountView } from "@/features/barber-account"

export default function AccountRoute() {
  usePageMeta("Akun")
  return <BarberAccountView />
}
