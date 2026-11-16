import { Tooltip as RTooltip } from "radix-ui"
import type { ReactNode } from "react"

export function Tip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <RTooltip.Provider delayDuration={200}>
      <RTooltip.Root>
        <RTooltip.Trigger asChild>{children}</RTooltip.Trigger>
        <RTooltip.Portal>
          <RTooltip.Content
            sideOffset={6}
            className="z-80 rounded-md bg-slate-900 px-2 py-1 text-xs text-white"
          >
            {label}
          </RTooltip.Content>
        </RTooltip.Portal>
      </RTooltip.Root>
    </RTooltip.Provider>
  )
}
