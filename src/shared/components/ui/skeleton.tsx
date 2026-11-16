import type { HTMLAttributes } from "react"
import { cn } from "@/shared/utils/cn"

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-lg bg-slate-200", className)}
      {...props}
    />
  )
}
