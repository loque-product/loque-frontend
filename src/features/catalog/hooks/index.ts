import { useQuery } from "@tanstack/react-query"
import { useMutate } from "@/shared/hooks"
import { catalogService } from "../services"
import type { ExtraItemInput, OverrideInput, ServiceInput } from "../types"

export const useServices = () =>
  useQuery({
    queryKey: ["catalog", "services"],
    queryFn: () => catalogService.listServices(),
  })
export const useOverrides = () =>
  useQuery({
    queryKey: ["catalog", "overrides"],
    queryFn: () => catalogService.listOverrides(),
  })

const KEYS = ["catalog", "audit"]
export const useSaveService = () =>
  useMutate((i: ServiceInput) => catalogService.saveService(i), {
    invalidate: KEYS,
    success: "Layanan disimpan. Berlaku untuk booking baru.",
  })
export const useSetServiceActive = () =>
  useMutate(
    (i: { id: string; active: boolean }) => catalogService.setServiceActive(i.id, i.active),
    {
      invalidate: KEYS,
      success: (_r, a) => (a.active ? "Layanan diaktifkan." : "Layanan dinonaktifkan."),
    },
  )
export const useSetOverride = () =>
  useMutate((i: OverrideInput) => catalogService.setOverride(i), {
    invalidate: KEYS,
    success: "Harga barber disimpan. Berlaku untuk booking baru.",
  })

export const useExtraItems = () =>
  useQuery({ queryKey: ["catalog", "extras"], queryFn: () => catalogService.listExtraItems() })
export const useSaveExtraItem = () =>
  useMutate((i: ExtraItemInput) => catalogService.saveExtraItem(i), {
    invalidate: KEYS,
    success: (_r, a) => (a.id ? "Item disimpan." : "Item ditambahkan."),
    toastError: false,
  })
export const useDeleteExtraItem = () =>
  useMutate((id: string) => catalogService.deleteExtraItem(id), {
    invalidate: KEYS,
    success: "Item dihapus.",
  })
