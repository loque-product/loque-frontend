import { Ban, UserPlus } from "lucide-react"
import { Popover } from "radix-ui"
import { type ReactNode } from "react"
import { Button, Sheet } from "@/shared/components"
import { formatDayShort, formatTime } from "@/shared/utils/format"
import { toIso } from "@/shared/domain/time"
import type { BookingPrefill } from "./BookingSheet"

interface ChoiceProps {
  barberName: string
  slot: BookingPrefill
  onWalkIn: () => void
  onTimeblock: () => void
}

/** Isi popup slot kosong: info slot dan dua pilihan besar. */
export function SlotChoiceContent({ barberName, slot, onWalkIn, onTimeblock }: ChoiceProps) {
  return (
    <div className="flex flex-col gap-3">
      <dl className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <dt className="text-xs text-slate-600">Barber</dt>
          <dd className="font-semibold text-slate-900">{barberName}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-600">Tanggal</dt>
          <dd className="font-semibold text-slate-900">{formatDayShort(slot.date)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-600">Jam</dt>
          <dd className="font-semibold text-slate-900">
            {formatTime(toIso(slot.date, slot.time))}
          </dd>
        </div>
      </dl>
      <Button className="h-14 justify-start text-base" onClick={onWalkIn}>
        <UserPlus className="size-4" aria-hidden />
        Tambah booking walk-in
      </Button>
      <Button className="h-14 justify-start text-base" variant="secondary" onClick={onTimeblock}>
        <Ban className="size-4" aria-hidden />
        Tambah timeblock
      </Button>
    </div>
  )
}

/** Popover di desktop yang menempel pada tombol slot. */
export function SlotPopover({
  open,
  onOpenChange,
  trigger,
  ...props
}: ChoiceProps & { open: boolean; onOpenChange: (o: boolean) => void; trigger: ReactNode }) {
  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="right"
          align="start"
          sideOffset={8}
          collisionPadding={16}
          className="z-70 w-80 rounded-xl bg-white p-4 shadow-pop"
        >
          <SlotChoiceContent {...props} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

/** Sheet bawah di mobile. */
export function SlotChoiceSheet({
  open,
  onOpenChange,
  ...props
}: ChoiceProps & { open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Slot kosong"
      description="Pilih tindakan untuk slot ini."
    >
      <SlotChoiceContent {...props} />
    </Sheet>
  )
}
