import { useQuery } from "@tanstack/react-query"
import { useMutate } from "@/shared/hooks"
import { reviewService } from "../services"
import type { ReportReviewInput, ReviewDraft } from "../types"

export const reviewsKey = ["reviews"] as const
const INVALIDATE = ["reviews", "barbers", "customer-booking", "notifications"]

export const useBarberReviews = (slug: string) =>
  useQuery({
    queryKey: [...reviewsKey, "barber", slug],
    queryFn: () => reviewService.listForBarber(slug),
    enabled: slug !== "",
  })
export const useMyReviews = () =>
  useQuery({ queryKey: [...reviewsKey, "mine"], queryFn: () => reviewService.listMine() })
export const useReviewTarget = (bookingId: string) =>
  useQuery({
    queryKey: [...reviewsKey, "target", bookingId],
    queryFn: () => reviewService.getTarget(bookingId),
    enabled: bookingId !== "",
    retry: false,
  })
export const useSaveReview = () =>
  useMutate((d: ReviewDraft) => reviewService.save(d), {
    invalidate: INVALIDATE,
    success: "Ulasan disimpan.",
    toastError: false,
  })
export const useRemoveReview = () =>
  useMutate((id: string) => reviewService.remove(id), {
    invalidate: INVALIDATE,
    success: "Ulasan dihapus.",
  })

export const useReviewsAboutMe = () =>
  useQuery({ queryKey: [...reviewsKey, "about-me"], queryFn: () => reviewService.listAboutMe() })
export const useReportReview = () =>
  useMutate((i: ReportReviewInput) => reviewService.reportReview(i), {
    invalidate: ["reviews"],
    success: "Laporan terkirim.",
    toastError: false,
  })
