import { AlertTriangle, CheckCircle2, Info, OctagonAlert } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/shared/utils/cn"
import { Button } from "./ui/button"
import { Skeleton } from "./ui/skeleton"

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col items-start gap-3 px-4 py-10", className)}>
      <div>
        <p className="text-base font-semibold text-slate-900">{title}</p>
        {description && <p className="mt-1 max-w-md text-sm text-slate-600">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function ErrorState({
  title = "Tidak dapat memuat data.",
  description = "Periksa koneksi Anda lalu coba lagi.",
  onRetry,
  className,
}: {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <div role="alert" className={cn("flex flex-col items-start gap-3 px-4 py-10", className)}>
      <div>
        <p className="text-base font-semibold text-slate-900">{title}</p>
        <p className="mt-1 max-w-md text-sm text-slate-600">{description}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Coba lagi
        </Button>
      )}
    </div>
  )
}

const bannerTone = {
  info: { box: "bg-info-50 text-info-700", Icon: Info },
  warning: {
    box: "bg-warning-50 text-warning-800",
    Icon: AlertTriangle,
  },
  danger: {
    box: "bg-danger-50 text-danger-800",
    Icon: OctagonAlert,
  },
  success: {
    box: "bg-primary-50 text-primary-800",
    Icon: CheckCircle2,
  },
} as const

export function Banner({
  tone = "info",
  title,
  children,
  action,
  className,
}: {
  tone?: keyof typeof bannerTone
  title?: string
  children?: ReactNode
  action?: ReactNode
  className?: string
}) {
  const { box, Icon } = bannerTone[tone]
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn("flex items-start gap-3 rounded-lg p-3 text-sm", box, className)}
    >
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? "mt-0.5" : undefined}>{children}</div>}
      </div>
      {action}
    </div>
  )
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-title font-semibold text-slate-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function PageSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Memuat">
      <Skeleton className="h-10 w-1/3" />
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  )
}

interface AsyncProps<T> {
  query: {
    data: T | undefined
    isLoading: boolean
    isError: boolean
    refetch: () => unknown
  }
  skeleton?: ReactNode
  isEmpty?: (data: T) => boolean
  empty?: ReactNode
  children: (data: T) => ReactNode
}

/** Tiga keadaan data: memuat, kosong, galat. */
export function Async<T>({ query, skeleton, isEmpty, empty, children }: AsyncProps<T>) {
  if (query.isLoading) return <>{skeleton ?? <PageSkeleton />}</>
  if (query.data === undefined) return <ErrorState onRetry={() => void query.refetch()} />
  if (isEmpty?.(query.data)) return <>{empty ?? <EmptyState title="Belum ada data." />}</>
  // Pembaruan gagal tetapi data terakhir ada: tetap tampilkan data dengan pemberitahuan.
  return (
    <>
      {query.isError && (
        <Banner
          tone="danger"
          className="mb-3"
          action={
            <Button variant="ghost" size="sm" onClick={() => void query.refetch()}>
              Coba lagi
            </Button>
          }
        >
          Tidak dapat memperbarui. Menampilkan data terakhir.
        </Banner>
      )}
      {children(query.data)}
    </>
  )
}
