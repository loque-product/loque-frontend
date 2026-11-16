import { Ban, CheckCircle2, Clock, UserX, UserCheck, Hourglass } from "lucide-react"
import type { ReactNode } from "react"
import { BOOKING_STATUS_LABEL, ROLE_LABEL, VOID_STATUS_LABEL } from "@/shared/constants"
import type { BookingStatus, IsoDateTime, Money, Role, VoidStatus } from "@/shared/types"
import { formatDateTime, formatDate, formatRupiah, formatTimeWib } from "@/shared/utils/format"
import { Badge, type Tone } from "./ui/badge"

const BOOKING_TONE: Record<BookingStatus, Tone> = {
  unpaid: "warning",
  expired: "slate",
  confirmed: "info",
  completed: "primary",
  cancelled_customer: "slate",
  cancelled_shop: "danger",
  no_show: "danger",
}
const BOOKING_ICON: Partial<Record<BookingStatus, ReactNode>> = {
  unpaid: <Hourglass className="size-3" aria-hidden />,
  completed: <CheckCircle2 className="size-3" aria-hidden />,
  no_show: <UserX className="size-3" aria-hidden />,
  cancelled_shop: <Ban className="size-3" aria-hidden />,
  confirmed: <UserCheck className="size-3" aria-hidden />,
}

export function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <Badge tone={BOOKING_TONE[status]}>
      {BOOKING_ICON[status]}
      {BOOKING_STATUS_LABEL[status]}
    </Badge>
  )
}

const VOID_TONE: Record<VoidStatus, Tone> = {
  pending: "warning",
  approved: "primary",
  rejected: "danger",
  expired: "slate",
  locked: "danger",
}
export function VoidStatusBadge({ status }: { status: VoidStatus }) {
  return <Badge tone={VOID_TONE[status]}>{VOID_STATUS_LABEL[status]}</Badge>
}

export function RefundBadge({ status }: { status: "needed" | "done" }) {
  return status === "needed" ? (
    <Badge tone="warning">Perlu di-refund</Badge>
  ) : (
    <Badge tone="primary">
      <CheckCircle2 className="size-3" aria-hidden />
      Refund selesai
    </Badge>
  )
}

export type SlaLevel = "ok" | "near" | "over"
const SLA_LABEL: Record<SlaLevel, string> = {
  ok: "Dalam batas",
  near: "Mendekati batas",
  over: "Melewati batas",
}
export function SlaBadge({ level }: { level: SlaLevel }) {
  const tone: Tone = level === "ok" ? "slate" : level === "near" ? "warning" : "danger"
  return (
    <Badge tone={tone}>
      <Clock className="size-3" aria-hidden />
      {SLA_LABEL[level]}
    </Badge>
  )
}

export function RoleBadge({ role }: { role: Role | "barber" }) {
  if (role === "barber") return <Badge tone="slate">Barber</Badge>
  return (
    <Badge tone={role === "owner" ? "primary" : role === "super_admin" ? "warning" : "info"}>
      {ROLE_LABEL[role]}
    </Badge>
  )
}

export function MoneyText({ value, className }: { value: Money; className?: string }) {
  return <span className={className}>{formatRupiah(value)}</span>
}

export function DateTimeText({
  value,
  mode = "datetime",
  className,
}: {
  value: IsoDateTime | Date | number
  mode?: "datetime" | "date" | "time"
  className?: string
}) {
  const iso = value instanceof Date ? value.toISOString() : new Date(value).toISOString()
  const text =
    mode === "date"
      ? formatDate(value)
      : mode === "time"
        ? formatTimeWib(value)
        : `${formatDateTime(value)} WIB`
  return (
    <time dateTime={iso} className={className}>
      {text}
    </time>
  )
}
