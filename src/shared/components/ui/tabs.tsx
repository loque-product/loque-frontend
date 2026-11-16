import { Tabs as RTabs } from "radix-ui"
import type { ComponentProps } from "react"
import { cn } from "@/shared/utils/cn"

export const Tabs = RTabs.Root

export function TabsList({ className, ...props }: ComponentProps<typeof RTabs.List>) {
  return <RTabs.List className={cn("flex gap-1 overflow-x-auto border-b", className)} {...props} />
}
export function TabsTrigger({ className, ...props }: ComponentProps<typeof RTabs.Trigger>) {
  return (
    <RTabs.Trigger
      className={cn(
        "-mb-px flex min-h-11 shrink-0 items-center gap-2 border-b px-4 text-sm font-medium text-slate-600 hover:text-slate-900 data-[state=active]:border-primary-700 data-[state=active]:text-primary-800",
        className,
      )}
      {...props}
    />
  )
}
export function TabsContent({ className, ...props }: ComponentProps<typeof RTabs.Content>) {
  return <RTabs.Content className={cn("pt-4", className)} {...props} />
}
