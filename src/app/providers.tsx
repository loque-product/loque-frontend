import { QueryClientProvider } from "@tanstack/react-query"
import { useEffect, useMemo } from "react"
import { RouterProvider } from "react-router"
import { toast } from "sonner"
import { Toaster } from "@/shared/components"
import { ApiError } from "@/shared/api/errors"
import { createQueryClient } from "@/shared/lib/query-client"
import { reportError } from "@/shared/lib/report-error"
import { restoreSession, useSession } from "@/features/auth"
import { loginPathFor } from "./guards"
import { router } from "./router"

export function AppProviders() {
  const client = useMemo(
    () =>
      createQueryClient((e) => {
        reportError(e)
        // 401: sesi dihapus dan pengguna diarahkan ke halaman masuk areanya dengan tujuan awal tersimpan.
        if (e.code === "UNAUTHENTICATED") {
          useSession.getState().setSession(null)
          const { pathname, search } = router.state.location
          void router.navigate(loginPathFor(pathname), {
            state: { from: pathname + search },
            replace: true,
          })
        } else if (e.code === "FORBIDDEN") {
          toast.error(e.message, { id: "forbidden" })
        }
      }),
    [],
  )
  useEffect(() => {
    void restoreSession()
  }, [])
  return (
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  )
}

export { ApiError }
