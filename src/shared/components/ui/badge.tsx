import { cva, type VariantProps } from "class-variance-authority"
import type { HTMLAttributes } from "react"
import { cn } from "@/shared/utils/cn"

export const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      tone: {
        slate: "bg-slate-100 text-slate-700",
        primary: "bg-primary-100 text-primary-800",
        warning: "bg-warning-100 text-warning-800",
        danger: "bg-danger-100 text-danger-800",
        info: "bg-info-100 text-info-700",
      },
    },
    defaultVariants: { tone: "slate" },
  },
)

export type Tone = NonNullable<VariantProps<typeof badgeVariants>["tone"]>

export function Badge({
  className,
  tone,
  ...props
}: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />
}
