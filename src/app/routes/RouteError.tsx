import { useRouteError } from "react-router"
import { ErrorState } from "@/shared/components"
import { reportError } from "@/shared/lib/report-error"
import { useEffect } from "react"

/** Batas galat per rute. */
export function RouteError() {
  const error = useRouteError()
  useEffect(() => reportError(error), [error])
  return (
    <ErrorState
      title="Terjadi kesalahan pada halaman ini."
      description="Muat ulang halaman lalu coba lagi."
      onRetry={() => window.location.reload()}
    />
  )
}
