import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type { PaperWidth } from "../types"

/** Pilihan lebar kertas diingat di peramban. */
export const usePaperWidth = create<{ width: PaperWidth; setWidth: (w: PaperWidth) => void }>()(
  persist((set) => ({ width: 58, setWidth: (width) => set({ width }) }), {
    name: "loque-receipt-width",
    storage: createJSONStorage(() => localStorage),
  }),
)
