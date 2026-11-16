import { useMutate } from "@/shared/hooks"
import { authService } from "../services"
import { readDevSession } from "../domain/devSession"
import { can } from "../domain/permissions"
import { useSession } from "../store/session"
import type { PermissionAction } from "../types"

export function useRole() {
  return useSession((s) => s.session?.role ?? null)
}

export function useCan(action: PermissionAction): boolean {
  return can(useRole(), action)
}

export function useCurrentUser() {
  return useSession((s) => s.session)
}

/** Memulihkan sesi dari server. Dipanggil sekali saat aplikasi dimuat. */
export async function restoreSession(): Promise<void> {
  const dev = readDevSession()
  if (dev !== undefined) {
    useSession.getState().setSession(dev)
    return
  }
  try {
    useSession.getState().setSession(await authService.me())
  } catch {
    useSession.getState().setSession(null)
  }
}

export async function signIn(email: string, password: string): Promise<void> {
  const session = await authService.login(email, password)
  useSession.getState().setSession(session)
}

export async function signOut(): Promise<void> {
  try {
    await authService.logout()
  } finally {
    useSession.getState().setSession(null)
  }
}

/** Login pertama barber: kata sandi baru dan persetujuan Syarat staf. Sesi diperbarui dari respons server. */
export async function finishFirstLogin(
  newPassword: string,
  acceptedStaffTerms: boolean,
): Promise<void> {
  const session = await authService.completeFirstLogin(newPassword, acceptedStaffTerms)
  useSession.getState().setSession(session)
}

export const useChangePassword = () =>
  useMutate(
    (i: { oldPassword: string; newPassword: string }) =>
      authService.changePassword(i.oldPassword, i.newPassword),
    {
      invalidate: [],
      success: "Kata sandi diganti.",
      toastError: false,
    },
  )

export const useRequestPasswordReset = () =>
  useMutate((email: string) => authService.requestPasswordReset(email), {
    invalidate: [],
    toastError: false,
  })
