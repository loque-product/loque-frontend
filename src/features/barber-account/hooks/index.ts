import { useQuery } from "@tanstack/react-query"
import { useMutate } from "@/shared/hooks"
import { barberAccountService } from "../services"
import type { UpdateBarberProfileInput } from "../types"

export const barberAccountKey = ["barber-account"] as const
const INVALIDATE = ["barber-account", "barbers"]

export const useBarberMe = () =>
  useQuery({
    queryKey: [...barberAccountKey, "me"],
    queryFn: () => barberAccountService.getMe(),
    staleTime: 30_000,
  })

export const useUpdateBarberProfile = () =>
  useMutate((i: UpdateBarberProfileInput) => barberAccountService.updateProfile(i), {
    invalidate: INVALIDATE,
    success: "Profil disimpan.",
    toastError: false,
  })
export const useUpdateBarberEmail = () =>
  useMutate((email: string) => barberAccountService.updateEmail(email), {
    invalidate: INVALIDATE,
    success: "Email diperbarui.",
    toastError: false,
  })
export const useDeleteBarberAccount = () =>
  useMutate((confirmation: string) => barberAccountService.deleteAccount(confirmation), {
    invalidate: [],
    toastError: false,
  })
