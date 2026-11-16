import { Link } from "react-router"
import { Button, EmptyState } from "@/shared/components"
import { ROLE_HOME } from "@/shared/constants"
import { useSession } from "@/features/auth"

export default function NotFoundRoute() {
  const role = useSession((s) => s.session?.role)
  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-50 p-4">
      <EmptyState
        title="Halaman tidak ditemukan."
        description="Alamat yang Anda buka tidak tersedia."
        action={
          <Button asChild>
            <Link to={role ? ROLE_HOME[role] : "/"}>Kembali ke beranda</Link>
          </Button>
        }
      />
    </div>
  )
}
