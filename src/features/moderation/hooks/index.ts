import { useQuery } from "@tanstack/react-query"
import { useMutate } from "@/shared/hooks"
import { moderationService } from "../services"
import type { DisputeDecision, PhotoDecision, ReviewDecision } from "../types"

export const usePhotoReports = () =>
  useQuery({
    queryKey: ["moderation", "photos"],
    queryFn: () => moderationService.listPhotoReports(),
  })
export const useReviewReports = () =>
  useQuery({
    queryKey: ["moderation", "reviews"],
    queryFn: () => moderationService.listReviewReports(),
  })
export const useBarbersByShop = () =>
  useQuery({
    queryKey: ["moderation", "barbers"],
    queryFn: () => moderationService.listBarbersByShop(),
  })
export const useDisputes = () =>
  useQuery({
    queryKey: ["moderation", "disputes"],
    queryFn: () => moderationService.listDisputes(),
  })

const KEYS = ["moderation", "audit", "notifications", "barbers"]
export const useDecidePhoto = () =>
  useMutate(
    (i: { id: string; decision: PhotoDecision; reason: string }) =>
      moderationService.decidePhoto(i.id, i.decision, i.reason),
    {
      invalidate: KEYS,
      success: "Keputusan disimpan. Barber diberi tahu.",
      toastError: false,
    },
  )
export const useDecideReview = () =>
  useMutate(
    (i: { id: string; decision: ReviewDecision; reason: string }) =>
      moderationService.decideReview(i.id, i.decision, i.reason),
    {
      invalidate: KEYS,
      success: "Keputusan disimpan. Barber diberi tahu.",
      toastError: false,
    },
  )
export const useHideBadge = () =>
  useMutate(
    (i: { barberId: string; reason: string }) => moderationService.hideBadge(i.barberId, i.reason),
    { invalidate: KEYS, success: "Lencana disembunyikan.", toastError: false },
  )
export const useOpenDispute = () =>
  useMutate((id: string) => moderationService.openDispute(id), {
    invalidate: ["moderation", "audit"],
    toastError: false,
  })
export const useDecideDispute = () =>
  useMutate(
    (i: { id: string; decision: DisputeDecision; reason: string }) =>
      moderationService.decideDispute(i.id, i.decision, i.reason),
    { invalidate: KEYS, success: "Keputusan disimpan.", toastError: false },
  )
