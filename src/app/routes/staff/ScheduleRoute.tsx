import { PageHeader } from "@/shared/components"
import { ScheduleEditor } from "@/features/schedule"

export default function ScheduleRoute() {
  return (
    <>
      <PageHeader
        title="Jadwal"
        description="Atur jam buka toko, libur, jam kerja barber, dan blok waktu."
      />
      <ScheduleEditor />
    </>
  )
}
