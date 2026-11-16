import { create } from "zustand"
import type { Session } from "../types"

interface SessionStore {
  session: Session | null
  /** `loading` sampai `auth.me` selesai pada pemuatan awal. */
  status: "loading" | "ready"
  setSession: (s: Session | null) => void
}

/**
 * Cermin sesi di memori. Sumber kebenaran adalah cookie httpOnly dari server, jadi sesi
 * tidak disimpan di localStorage; setiap pemuatan halaman memulihkannya lewat `auth.me`.
 */
export const useSession = create<SessionStore>()((set) => ({
  session: null,
  status: "loading",
  setSession: (session) => set({ session, status: "ready" }),
}))

export const getSession = (): Session | null => useSession.getState().session
