import { useQuery } from "@tanstack/react-query"
import { useMutate } from "@/shared/hooks"
import { accountService } from "../services"
import type { CreateAccountInput } from "../types"

export const useAccounts = () =>
  useQuery({
    queryKey: ["accounts", "list"],
    queryFn: () => accountService.list(),
  })

const KEYS = ["accounts", "barbers", "audit"]
export const useCreateAccount = () =>
  useMutate((i: CreateAccountInput) => accountService.create(i), {
    invalidate: KEYS,
    success: "Akun dibuat.",
  })
export const useResetPassword = () =>
  useMutate((id: string) => accountService.resetPassword(id), {
    invalidate: ["audit"],
  })
export const useSetAccountActive = () =>
  useMutate((i: { id: string; active: boolean }) => accountService.setActive(i.id, i.active), {
    invalidate: KEYS,
    success: (_r, a) => (a.active ? "Keanggotaan diaktifkan." : "Keanggotaan dinonaktifkan."),
  })
