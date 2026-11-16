import { Check, ChevronDown } from "lucide-react"
import {
  Checkbox as RCheckbox,
  Label as RLabel,
  Select as RSelect,
  Switch as RSwitch,
} from "radix-ui"
import {
  cloneElement,
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react"
import { cn } from "@/shared/utils/cn"

const control =
  "w-full rounded-lg border bg-white px-3 text-sm text-slate-900 placeholder:text-slate-500 disabled:bg-slate-100 disabled:text-slate-500 aria-[invalid=true]:border-danger-600"

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(control, "h-11", className)} {...props} />
  },
)

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn(control, "min-h-24 py-2", className)} {...props} />
})

interface FieldProps {
  label: string
  hint?: ReactNode
  error?: string
  required?: boolean
  children: ReactElement<{
    id?: string
    "aria-invalid"?: boolean
    "aria-describedby"?: string
  }>
  className?: string
}

/** Label, petunjuk, dan galat yang terhubung ke kontrol. */
export function Field({ label, hint, error, required, children, className }: FieldProps) {
  const id = useId()
  const descId = `${id}-desc`
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <RLabel.Root htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-danger-700"> *</span>}
      </RLabel.Root>
      {cloneElement(children, {
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": hint || error ? descId : undefined,
      })}
      {(hint || error) && (
        <p id={descId} className={cn("text-xs", error ? "text-danger-700" : "text-slate-600")}>
          {error ?? hint}
        </p>
      )}
    </div>
  )
}

export function Checkbox({
  label,
  className,
  ...props
}: RCheckbox.CheckboxProps & { label?: ReactNode }) {
  const id = useId()
  return (
    <div className={cn("flex min-h-11 items-center gap-3", className)}>
      <RCheckbox.Root
        id={id}
        className="flex size-5 shrink-0 items-center justify-center rounded border bg-white data-[state=checked]:border-primary-700 data-[state=checked]:bg-primary-700"
        {...props}
      >
        <RCheckbox.Indicator>
          <Check className="size-3.5 text-white" aria-hidden />
        </RCheckbox.Indicator>
      </RCheckbox.Root>
      {label && (
        <RLabel.Root htmlFor={id} className="text-sm text-slate-700">
          {label}
        </RLabel.Root>
      )}
    </div>
  )
}

export function Switch({ label, className, ...props }: RSwitch.SwitchProps & { label?: string }) {
  const id = useId()
  return (
    <div className={cn("flex min-h-11 items-center gap-3", className)}>
      <RSwitch.Root
        id={id}
        aria-label={label}
        className="h-6 w-11 shrink-0 rounded-full bg-slate-300 p-0.5 transition-colors data-[state=checked]:bg-primary-700"
        {...props}
      >
        <RSwitch.Thumb className="block size-5 rounded-full bg-white shadow-card transition-transform data-[state=checked]:translate-x-5" />
      </RSwitch.Root>
      {label && (
        <RLabel.Root htmlFor={id} className="text-sm text-slate-700">
          {label}
        </RLabel.Root>
      )}
    </div>
  )
}

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}
interface SelectProps {
  value: string
  onValueChange: (v: string) => void
  options: SelectOption[]
  placeholder?: string
  id?: string
  disabled?: boolean
  className?: string
  "aria-invalid"?: boolean
  "aria-describedby"?: string
  "aria-label"?: string
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder = "Pilih",
  id,
  disabled,
  className,
  ...aria
}: SelectProps) {
  return (
    <RSelect.Root value={value || undefined} onValueChange={onValueChange} disabled={disabled}>
      <RSelect.Trigger
        id={id}
        className={cn(control, "flex h-11 items-center justify-between gap-2 text-left", className)}
        {...aria}
      >
        <RSelect.Value placeholder={<span className="text-slate-500">{placeholder}</span>} />
        <RSelect.Icon>
          <ChevronDown className="size-4 text-slate-500" aria-hidden />
        </RSelect.Icon>
      </RSelect.Trigger>
      <RSelect.Portal>
        <RSelect.Content
          position="popper"
          sideOffset={4}
          className="z-70 max-h-72 min-w-(--radix-select-trigger-width) overflow-hidden rounded-lg bg-white shadow-pop"
        >
          <RSelect.Viewport className="p-1">
            {options.map((o) => (
              <RSelect.Item
                key={o.value}
                value={o.value}
                disabled={o.disabled}
                className="flex min-h-11 cursor-pointer items-center justify-between gap-2 rounded-md px-3 text-sm text-slate-900 outline-none data-[disabled]:opacity-50 data-[highlighted]:bg-primary-50"
              >
                <RSelect.ItemText>{o.label}</RSelect.ItemText>
                <RSelect.ItemIndicator>
                  <Check className="size-4 text-primary-700" aria-hidden />
                </RSelect.ItemIndicator>
              </RSelect.Item>
            ))}
          </RSelect.Viewport>
        </RSelect.Content>
      </RSelect.Portal>
    </RSelect.Root>
  )
}
