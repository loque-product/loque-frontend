import { RadioGroup as RRadioGroup } from "radix-ui"
import type { ReactNode } from "react"
import { useId } from "react"
import { cn } from "@/shared/utils/cn"

export const RadioGroup = RRadioGroup.Root

/** Satu baris pilihan dengan target sentuh penuh. */
export function RadioRow({
  value,
  label,
  description,
  trailing,
  disabled,
}: {
  value: string
  label: ReactNode
  description?: ReactNode
  trailing?: ReactNode
  disabled?: boolean
}) {
  const id = useId()
  return (
    <div className="flex min-h-11 items-center gap-3 py-2">
      <RRadioGroup.Item
        id={id}
        value={value}
        disabled={disabled}
        className="flex size-5 shrink-0 items-center justify-center rounded-full border bg-white data-[state=checked]:border-primary-700"
      >
        <RRadioGroup.Indicator className="size-2.5 rounded-full bg-primary-700" />
      </RRadioGroup.Item>
      <label
        htmlFor={id}
        className={cn("min-w-0 flex-1 cursor-pointer", disabled && "cursor-not-allowed opacity-60")}
      >
        <span className="block text-sm font-medium text-slate-900">{label}</span>
        {description && <span className="block text-xs text-slate-600">{description}</span>}
      </label>
      {trailing}
    </div>
  )
}
