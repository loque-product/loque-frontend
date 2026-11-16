import { create } from "zustand"
import { getRef } from "@/features/analytics"
import { createJSONStorage, persist } from "zustand/middleware"
import type { ShareChannel } from "@/shared/domain/links"
import type { Gender, HhmmString, Id, YmdString } from "@/shared/types"

export interface WizardState {
  forSelf: boolean
  guestName: string
  gender: Gender | null
  serviceIds: Id[]
  barberId: Id | null
  date: YmdString | null
  time: HhmmString | null
  ref: ShareChannel | null
  /** Barber datang dari profil barber (boleh diganti di langkah 3). */
  fromProfile: boolean
}

interface WizardStore extends WizardState {
  patch: (p: Partial<WizardState>) => void
  /** Memulai booking baru; menimpa semua isian. */
  start: (p?: Partial<WizardState>) => void
  clear: () => void
}

const initial: WizardState = {
  forSelf: true,
  guestName: "",
  gender: null,
  serviceIds: [],
  barberId: null,
  date: null,
  time: null,
  ref: null,
  fromProfile: false,
}

/** Disimpan selama sesi peramban dan dibersihkan setelah booking dibuat atau dibatalkan. */
export const useWizard = create<WizardStore>()(
  persist(
    (set) => ({
      ...initial,
      patch: (p) => set(p),
      start: (p) => set({ ...initial, ...p }),
      clear: () => set({ ...initial }),
    }),
    {
      name: "loque-booking-wizard",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({
        forSelf: s.forSelf,
        guestName: s.guestName,
        gender: s.gender,
        serviceIds: s.serviceIds,
        barberId: s.barberId,
        date: s.date,
        time: s.time,
        ref: s.ref,
        fromProfile: s.fromProfile,
      }),
    },
  ),
)

export const WIZARD_STEPS = [
  { path: "/booking/data-tamu", label: "Data tamu" },
  { path: "/booking/layanan", label: "Layanan" },
  { path: "/booking/barber", label: "Barber" },
  { path: "/booking/jadwal", label: "Jadwal" },
  { path: "/booking/ringkasan", label: "Ringkasan" },
] as const

/** Memulai booking baru dengan `ref` sesi; dipakai tombol "Booking Baru", "Booking dengan", dan "Pesan lagi". */
export function beginBooking(prefill: Partial<WizardState> = {}): void {
  useWizard.getState().start({ ref: getRef() ?? null, ...prefill })
}
