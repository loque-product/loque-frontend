import { PageHeader } from "@/shared/components"
import { StaffManager } from "@/features/accounts"

export default function StaffRoute() {
  return (
    <>
      <PageHeader title="Staf" description="Buat akun, reset kata sandi, dan kelola keanggotaan." />
      <StaffManager />
    </>
  )
}
