import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type { Id } from "@/shared/types"

/** Toko terpilih untuk Super Admin (mode toko). Peran lain memakai toko akunnya sendiri. */
export const useActiveShop = create<{ shopId: Id | null; setShop: (id: Id | null) => void }>()(
  persist((set) => ({ shopId: null, setShop: (shopId) => set({ shopId }) }), {
    name: "loque-active-shop",
    storage: createJSONStorage(() => localStorage),
  }),
)

export const getActiveShopId = (): Id | null => useActiveShop.getState().shopId
