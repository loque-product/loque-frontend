import { useQuery } from "@tanstack/react-query"
import { useMutate } from "@/shared/hooks"
import { customerAccountService } from "../services"
import type { ProfileInput } from "../types"

export const accountKey = ["customer-account"] as const

export const useCustomerProfile = (enabled = true) =>
  useQuery({
    queryKey: [...accountKey, "profile"],
    queryFn: () => customerAccountService.getProfile(),
    enabled,
  })

export const useCompleteProfile = () =>
  useMutate((i: ProfileInput) => customerAccountService.completeProfile(i), {
    invalidate: ["customer-account"],
    toastError: false,
  })
export const useUpdateProfile = () =>
  useMutate((i: ProfileInput) => customerAccountService.updateProfile(i), {
    invalidate: ["customer-account"],
    success: "Profil disimpan.",
    toastError: false,
  })
export const useDeleteAccount = () =>
  useMutate((confirmation: string) => customerAccountService.deleteAccount(confirmation), {
    invalidate: [],
    toastError: false,
  })
