import { Link } from "react-router"
import { EmptyState } from "@/shared/components"
import { buttonVariants } from "@/shared/components/ui/button"

/** Barber tanpa keanggotaan aktif: layar toko (Hari ini, Jadwal) tidak tersedia. */
export function NoMembership({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-title font-semibold text-slate-900">{title}</h1>
      <EmptyState
        title="Anda belum terhubung ke toko."
        description="Anda masih bisa mengelola profil, portofolio, tautan, dan ulasan."
        action={
          <Link to="/barber/profil" className={buttonVariants({ variant: "secondary" })}>
            Buka Profil
          </Link>
        }
      />
    </div>
  )
}
