import { X } from "lucide-react"
import { Dialog as RDialog } from "radix-ui"
import type { ReactNode } from "react"
import { cn } from "@/shared/utils/cn"

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

/** Dialog di desktop; menjadi sheet dari bawah di bawah 48rem. */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: DialogProps) {
  return (
    <RDialog.Root open={open} onOpenChange={onOpenChange}>
      <RDialog.Portal>
        <RDialog.Overlay className="fixed inset-0 z-50 bg-slate-900/50" />
        <RDialog.Content
          aria-describedby={description ? undefined : undefined}
          className={cn(
            "fixed z-50 flex max-h-11/12 w-full flex-col bg-white shadow-pop",
            "inset-x-0 bottom-0 rounded-t-xl md:inset-auto md:left-1/2 md:top-1/2 md:max-w-lg md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-xl",
            className,
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
            <div>
              <RDialog.Title className="text-section font-semibold text-slate-900">
                {title}
              </RDialog.Title>
              {description ? (
                <RDialog.Description className="mt-1 text-sm text-slate-600">
                  {description}
                </RDialog.Description>
              ) : null}
            </div>
            <RDialog.Close
              className="-mr-2 flex size-11 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Tutup"
            >
              <X className="size-5" aria-hidden />
            </RDialog.Close>
          </div>
          <div className="overflow-y-auto px-5 py-4">{children}</div>
          {footer && (
            <div className="flex flex-col-reverse gap-2 border-t px-5 py-4 sm:flex-row sm:justify-end">
              {footer}
            </div>
          )}
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  )
}

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  side?: "right" | "left"
  className?: string
}

/** Laci samping; menjadi sheet dari bawah di bawah 48rem. */
export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  side = "right",
  className,
}: SheetProps) {
  return (
    <RDialog.Root open={open} onOpenChange={onOpenChange}>
      <RDialog.Portal>
        <RDialog.Overlay className="fixed inset-0 z-50 bg-slate-900/50" />
        <RDialog.Content
          className={cn(
            "fixed z-50 flex flex-col bg-white shadow-pop",
            "inset-x-0 bottom-0 max-h-11/12 rounded-t-xl",
            side === "right"
              ? "md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-full md:max-w-xl md:rounded-none"
              : "md:inset-y-0 md:left-0 md:right-auto md:max-h-none md:w-80 md:rounded-none",
            className,
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
            <div>
              <RDialog.Title className="text-section font-semibold text-slate-900">
                {title}
              </RDialog.Title>
              {description ? (
                <RDialog.Description className="mt-1 text-sm text-slate-600">
                  {description}
                </RDialog.Description>
              ) : null}
            </div>
            <RDialog.Close
              className="-mr-2 flex size-11 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Tutup"
            >
              <X className="size-5" aria-hidden />
            </RDialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
          {footer && (
            <div className="flex flex-col-reverse gap-2 border-t px-5 py-4 sm:flex-row sm:justify-end">
              {footer}
            </div>
          )}
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  )
}
