import { useQuery } from "@tanstack/react-query"
import { useMutate } from "@/shared/hooks"
import { scheduleService } from "../services"
import type { ScheduleData, TimeblockInput } from "../types"

export const useSchedule = () =>
  useQuery({
    queryKey: ["schedule", "data"],
    queryFn: () => scheduleService.getSchedule(),
  })

export const useSaveSchedule = () =>
  useMutate(
    (i: { next: ScheduleData; summary: string }) => scheduleService.saveSchedule(i.next, i.summary),
    {
      invalidate: ["schedule", "booking", "audit"],
      success: "Jadwal disimpan.",
      toastError: false,
    },
  )

const TB_KEYS = ["schedule", "booking", "audit"]
export const useSaveTimeblock = () =>
  useMutate((i: TimeblockInput) => scheduleService.saveTimeblock(i), {
    invalidate: TB_KEYS,
    success: (_r, a) => (a.id ? "Timeblock diperbarui." : "Timeblock ditambahkan."),
    toastError: false,
  })
export const useDeleteTimeblock = () =>
  useMutate((id: string) => scheduleService.deleteTimeblock(id), {
    invalidate: TB_KEYS,
    success: "Timeblock dihapus.",
  })
