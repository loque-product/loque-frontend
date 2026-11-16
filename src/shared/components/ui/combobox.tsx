import { Check, ChevronDown, Search } from "lucide-react"
import { Popover } from "radix-ui"
import { useEffect, useId, useMemo, useRef, useState } from "react"
import { useIsDesktop } from "@/shared/hooks"
import { cn } from "@/shared/utils/cn"
import { Sheet } from "./dialog"

export interface ComboboxOption {
  value: string
  label: string
  /** Judul kelompok. Opsi dengan kelompok sama ditampilkan berdampingan di bawah satu judul. */
  group?: string
  /** Keterangan kecil di kanan, mis. harga. */
  hint?: string
}

interface Props {
  options: ComboboxOption[]
  value: string
  onValueChange: (v: string) => void
  placeholder?: string
  searchPlaceholder?: string
  /** Judul sheet di mobile. */
  title?: string
  id?: string
  disabled?: boolean
  className?: string
  "aria-invalid"?: boolean
  "aria-describedby"?: string
  "aria-label"?: string
}

/**
 * Dropdown yang bisa dicari. Desktop: popover. Mobile: sheet dari bawah.
 * Mendukung keyboard (panah, Enter, Escape) dan pembaca layar (role combobox dan listbox).
 */
export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Pilih",
  searchPlaceholder = "Cari",
  title = "Pilih",
  id,
  disabled,
  className,
  ...aria
}: Props) {
  const desktop = useIsDesktop()
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => o.value === value)
  const pick = (v: string) => {
    onValueChange(v)
    setOpen(false)
  }
  const trigger = (
    <button
      type="button"
      id={id}
      role="combobox"
      aria-expanded={open}
      aria-haspopup="listbox"
      disabled={disabled}
      onClick={desktop ? undefined : () => setOpen(true)}
      className={cn(
        "flex h-11 w-full items-center justify-between gap-2 rounded-lg border bg-white px-3 text-left text-sm text-slate-900 disabled:bg-slate-100 disabled:text-slate-500 aria-[invalid=true]:border-danger-600",
        className,
      )}
      {...aria}
    >
      <span className={cn("truncate", !selected && "text-slate-500")}>
        {selected?.label ?? placeholder}
      </span>
      <ChevronDown className="size-4 shrink-0 text-slate-500" aria-hidden />
    </button>
  )
  if (!desktop) {
    return (
      <>
        {trigger}
        <Sheet open={open} onOpenChange={setOpen} title={title}>
          <List options={options} value={value} onPick={pick} placeholder={searchPlaceholder} />
        </Sheet>
      </>
    )
  }
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          className="z-70 w-80 rounded-xl bg-white p-2 shadow-pop"
        >
          <List options={options} value={value} onPick={pick} placeholder={searchPlaceholder} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

function List({
  options,
  value,
  onPick,
  placeholder,
}: {
  options: ComboboxOption[]
  value: string
  onPick: (v: string) => void
  placeholder: string
}) {
  const listId = useId()
  const [query, setQuery] = useState("")
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return options.filter(
      (o) => !q || o.label.toLowerCase().includes(q) || (o.group ?? "").toLowerCase().includes(q),
    )
  }, [options, query])
  useEffect(() => setActive(0), [query])
  useEffect(() => {
    inputRef.current?.focus()
  }, [])
  const groups = useMemo(() => {
    const map = new Map<string, ComboboxOption[]>()
    for (const o of filtered) map.set(o.group ?? "", [...(map.get(o.group ?? "") ?? []), o])
    return [...map]
  }, [filtered])
  const flat = groups.flatMap(([, g]) => g)

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, flat.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (flat[active]) onPick(flat[active].value)
    }
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500"
          aria-hidden
        />
        <input
          ref={inputRef}
          role="combobox"
          aria-expanded
          aria-controls={listId}
          aria-activedescendant={flat[active] ? `${listId}-${flat[active].value}` : undefined}
          aria-label={placeholder}
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKey}
          className="h-11 w-full rounded-lg border bg-white pl-9 pr-3 text-sm"
        />
      </div>
      <div id={listId} role="listbox" aria-label="Pilihan" className="max-h-72 overflow-y-auto">
        {flat.length === 0 && (
          <p className="px-3 py-6 text-center text-sm text-slate-600">Tidak ada hasil.</p>
        )}
        {groups.map(([group, opts]) => (
          <div key={group} role="group" aria-label={group || undefined}>
            {group && (
              <p className="px-3 pb-1 pt-2 text-xs font-semibold text-slate-600">{group}</p>
            )}
            {opts.map((o) => {
              const idx = flat.indexOf(o)
              return (
                <div
                  key={o.value}
                  id={`${listId}-${o.value}`}
                  role="option"
                  aria-selected={o.value === value}
                  onClick={() => onPick(o.value)}
                  onMouseEnter={() => setActive(idx)}
                  className={cn(
                    "flex min-h-11 cursor-pointer items-center justify-between gap-2 rounded-md px-3 text-sm",
                    idx === active && "bg-primary-50",
                  )}
                >
                  <span className="flex items-center gap-2">
                    {o.value === value ? (
                      <Check className="size-4 text-primary-700" aria-hidden />
                    ) : (
                      <span className="size-4" aria-hidden />
                    )}
                    {o.label}
                  </span>
                  {o.hint && <span className="text-xs text-slate-600">{o.hint}</span>}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
