import { WifiOff } from "lucide-react"
import { useOnlineStatus } from "@/shared/hooks"

export function OfflineBanner() {
  const online = useOnlineStatus()
  if (online) return null
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 bg-slate-900 px-4 py-2 text-sm text-white"
    >
      <WifiOff className="size-4" aria-hidden />
      Tidak terhubung. Perubahan data dinonaktifkan.
    </div>
  )
}
