import { useQuery } from "@tanstack/react-query"
import { useMutate } from "@/shared/hooks"
import type { DayHours } from "@/shared/types"
import { barberScheduleService } from "../services"
import type { SaveBlockInput } from "../types"

export const barberScheduleKey = ["barber-schedule"] as const
const INVALIDATE = ["barber-schedule", "barber-booking", "customer-booking"]

export const useBarberSchedule = (enabled = true) =>
  useQuery({
    queryKey: [...barberScheduleKey, "mine"],
    queryFn: () => barberScheduleService.getMine(),
    enabled,
    retry: false,
  })

export const useSaveWorkingHours = () =>
  useMutate((days: DayHours[]) => barberScheduleService.saveWorkingHours(days), {
    invalidate: INVALIDATE,
    success: "Jam kerja disimpan.",
    toastError: false,
  })
export const useSaveBlock = () =>
  useMutate((i: SaveBlockInput) => barberScheduleService.saveBlock(i), {
    invalidate: INVALIDATE,
    success: "Blok waktu disimpan.",
    toastError: false,
  })
export const useDeleteBlock = () =>
  useMutate((id: string) => barberScheduleService.deleteBlock(id), {
    invalidate: INVALIDATE,
    success: "Blok waktu dihapus.",
  })
