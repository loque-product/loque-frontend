import { Copy, ExternalLink } from "lucide-react"
import { useState } from "react"
import { Link, useLocation, useSearchParams } from "react-router"
import { toast } from "sonner"
import { ApiError } from "@/shared/api"
import { Banner, Button, Card, CardContent } from "@/shared/components"
import { goExternal } from "@/shared/lib/external-navigation"
import { usePageMeta } from "@/shared/hooks"
import { isShareChannel } from "@/shared/domain/links"
import { getRef, setRef, track } from "@/features/analytics"
import { isInAppBrowser } from "../domain/inApp"
import { safeNext, saveLoginContext } from "../domain/loginContext"
import { authService } from "../services"

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h5.9a5.04 5.04 0 0 1-2.19 3.31v2.75h3.54c2.07-1.91 3.25-4.72 3.25-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.54-2.75c-.98.66-2.24 1.05-3.74 1.05-2.87 0-5.3-1.94-6.17-4.55H2.17v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.83 13.99a6.6 6.6 0 0 1 0-4.22V6.93H2.17a11 11 0 0 0 0 10.06l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.46c1.62 0 3.07.56 4.21 1.65l3.15-3.15C17.46 2.19 14.97 1 12 1A11 11 0 0 0 2.17 6.93l3.66 2.84C6.7 7.4 9.13 5.46 12 5.46Z"
      />
    </svg>
  )
}

/** Layar "Buka di browser" untuk browser dalam aplikasi Instagram atau TikTok. */
function InAppGate() {
  const url = window.location.href.replace(/([?&])inapp=1&?/, "$1")
  return (
    <Card className="w-full max-w-xl">
      <CardContent className="flex flex-col gap-4 p-6">
        <h1 className="text-title font-semibold text-slate-900">Buka di browser</h1>
        <p className="text-sm text-slate-700">
          Login Google tidak bisa dipakai di browser dalam aplikasi ini. Buka halaman ini di Chrome
          atau Safari untuk masuk.
        </p>
        <Button
          onClick={() => {
            void navigator.clipboard
              ?.writeText(url)
              .then(() => toast.success("Tautan disalin. Tempel di browser Anda."))
            window.open(url, "_blank", "noopener")
          }}
        >
          <ExternalLink className="size-4" aria-hidden />
          Buka di browser
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            void navigator.clipboard?.writeText(url).then(() => toast.success("Tautan disalin."))
          }
        >
          <Copy className="size-4" aria-hidden />
          Salin tautan
        </Button>
      </CardContent>
    </Card>
  )
}

export function CustomerLogin() {
  usePageMeta("Masuk", "Masuk dengan Google untuk membuat booking.")
  const [params] = useSearchParams()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inApp = isInAppBrowser(navigator.userAgent) || params.get("inapp") === "1"
  if (inApp) return <InAppGate />

  const barber = params.get("barber") ?? undefined
  const refParam = params.get("ref")
  if (isShareChannel(refParam)) setRef(refParam)
  const from = (location.state as { from?: string } | null)?.from
  const next = safeNext(params.get("next")) ?? safeNext(from)

  const start = async () => {
    setError(null)
    setLoading(true)
    track("login_started")
    const ctx = { barber, ref: getRef(), next }
    saveLoginContext(ctx)
    try {
      const { redirectUrl } = await authService.startGoogleLogin(ctx)
      goExternal(redirectUrl)
    } catch (e) {
      setLoading(false)
      setError(ApiError.from(e).message)
    }
  }

  return (
    <Card className="w-full max-w-xl">
      <CardContent className="flex flex-col gap-5 p-6 md:p-8">
        <div>
          <h1 className="text-title font-semibold text-slate-900">Masuk ke Loque</h1>
          <p className="mt-1 text-sm text-slate-600">
            Masuk untuk membuat booking dan melihat riwayat Anda.
          </p>
        </div>
        {error && <Banner tone="danger">{error}</Banner>}
        <Button
          variant="secondary"
          size="default"
          loading={loading}
          onClick={() => void start()}
          className="gap-3"
        >
          <GoogleMark />
          Masuk dengan Google
        </Button>
        <p className="text-sm text-slate-600">
          Anda barber atau staf toko?{" "}
          <Link to="/staf/masuk" className="font-medium text-primary-800 underline">
            Masuk di sini
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
