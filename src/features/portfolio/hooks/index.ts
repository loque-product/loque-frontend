import { useQuery } from "@tanstack/react-query"
import { useMutate } from "@/shared/hooks"
import { portfolioService } from "../services"
import type { AddPhotoInput, PhotoReportInput } from "../types"

export const useReportPhoto = () =>
  useMutate((i: PhotoReportInput) => portfolioService.reportPhoto(i), {
    invalidate: ["shop-info", "barbers"],
    toastError: false,
  })

const MINE = ["portfolio", "mine"] as const
const INVALIDATE = ["portfolio", "barbers", "shop-info"]

export const useMyPortfolio = () =>
  useQuery({ queryKey: MINE, queryFn: () => portfolioService.listMine() })
export const useAddPhoto = () =>
  useMutate((i: AddPhotoInput) => portfolioService.addPhoto(i), {
    invalidate: INVALIDATE,
    success: "Foto diunggah.",
    toastError: false,
  })
export const useUpdateCaption = () =>
  useMutate(
    (i: { id: string; caption: string }) => portfolioService.updateCaption(i.id, i.caption),
    {
      invalidate: INVALIDATE,
      success: "Keterangan disimpan.",
    },
  )
export const useReorderPhotos = () =>
  useMutate((ids: string[]) => portfolioService.reorder(ids), { invalidate: INVALIDATE })
export const useRemovePhoto = () =>
  useMutate((id: string) => portfolioService.removePhoto(id), {
    invalidate: INVALIDATE,
    success: "Foto dihapus.",
  })
