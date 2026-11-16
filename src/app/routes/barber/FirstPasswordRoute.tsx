import { Navigate } from "react-router"
import { usePageMeta } from "@/shared/hooks"
import { ROLE_HOME } from "@/shared/constants"
import { useSession } from "@/features/auth"
import { FirstPasswordView } from "@/features/barber-account"

/** Hanya untuk akun yang wajib mengganti kata sandi; selainnya kembali ke beranda perannya. */
export default function FirstPasswordRoute() {
  usePageMeta("Ganti kata sandi")
  const session = useSession((s) => s.session)
  if (session && !session.mustChangePassword)
    return <Navigate to={ROLE_HOME[session.role]} replace />
  return <FirstPasswordView />
}
