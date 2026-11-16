import { useEffect } from "react"
import { Navigate, useNavigate } from "react-router"
import { PageSkeleton } from "@/shared/components"
import { getAnonId, track } from "@/features/analytics"
import { resolveTarget, takeLoginContext } from "../domain/loginContext"
import { useSession } from "../store/session"

/** Tujuan kembali OAuth: memulihkan barber, ref, dan tujuan awal setelah sesi terbaca. */
export function LoginReturn() {
  const session = useSession((s) => s.session)
  const status = useSession((s) => s.status)
  const navigate = useNavigate()
  useEffect(() => {
    if (status !== "ready" || !session) return
    const ctx = takeLoginContext()
    getAnonId()
    track("login_completed")
    const target = resolveTarget(ctx)
    if (session.profileComplete === false)
      navigate("/akun/lengkapi", { replace: true, state: { from: target } })
    else navigate(target, { replace: true })
  }, [status, session, navigate])
  if (status === "ready" && !session) return <Navigate to="/masuk" replace />
  return <PageSkeleton rows={2} />
}
