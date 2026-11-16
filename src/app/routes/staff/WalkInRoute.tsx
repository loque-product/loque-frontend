import { useState } from "react"
import { useNavigate } from "react-router"
import { Button, EmptyState, PageHeader } from "@/shared/components"
import { BookingSheet } from "@/features/booking"

export default function WalkInRoute() {
  const [open, setOpen] = useState(true)
  const navigate = useNavigate()
  return (
    <>
      <PageHeader
        title="Walk-in"
        description="Catat pelanggan yang datang langsung. Slot langsung terkunci tanpa booking fee."
      />
      <EmptyState
        title="Catat walk-in baru."
        description="Pilih barber, jam, dan layanan lewat formulir."
        action={<Button onClick={() => setOpen(true)}>Buka formulir walk-in</Button>}
      />
      <BookingSheet
        open={open}
        onOpenChange={setOpen}
        mode="walkin"
        onSaved={(id) => navigate(`/staf/booking/${id}`)}
      />
    </>
  )
}
