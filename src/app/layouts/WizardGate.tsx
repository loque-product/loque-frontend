import { useEffect, useState, type ReactNode } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { Button, Dialog } from "@/shared/components"
import { useCancelHold, useHold, useWizard } from "@/features/customer-booking"

/** Sebelum langkah 1: bila ada hold belum dibayar, pilih lanjutkan pembayaran atau mulai baru. */
export function WizardGate({ children }: { children: ReactNode }) {
  const hold = useHold()
  const cancel = useCancelHold()
  const navigate = useNavigate()
  const clear = useWizard((s) => s.clear)
  const [dismissed, setDismissed] = useState(false)
  // Dibuat ulang bila server menolak booking baru dengan HOLD_EXISTS.
  useEffect(() => {
    const reopen = () => setDismissed(false)
    window.addEventListener("loque:hold-exists", reopen)
    return () => window.removeEventListener("loque:hold-exists", reopen)
  }, [])
  const open = Boolean(hold.data) && !dismissed
  return (
    <>
      {children}
      <Dialog
        open={open}
        onOpenChange={() => undefined}
        title="Pembayaran booking menunggu"
        description="Anda masih punya booking yang belum dibayar. Lanjutkan pembayaran atau batalkan lalu buat booking baru. Slot dilepas tanpa fee."
        footer={
          <>
            <Button
              variant="secondary"
              loading={cancel.isPending}
              onClick={() => {
                if (!hold.data) return
                cancel.mutate(hold.data.id, {
                  onSuccess: () => {
                    clear()
                    setDismissed(true)
                    toast.success("Booking sebelumnya dibatalkan.")
                  },
                })
              }}
            >
              Batalkan dan buat baru
            </Button>
            <Button
              onClick={() =>
                hold.data && navigate(`/booking/status/${hold.data.id}`, { replace: true })
              }
            >
              Lanjutkan pembayaran
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-700">
          Satu akun hanya boleh punya satu booking yang menunggu pembayaran.
        </p>
      </Dialog>
    </>
  )
}
