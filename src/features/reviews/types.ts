import type { Id, IsoDateTime } from "@/shared/types"

export interface PublicReview {
  id: Id
  /** Sudah dalam bentuk "Nama depan + inisial". */
  authorName: string
  stars: number
  comment: string
  createdAt: IsoDateTime
  edited: boolean
}

export interface MyReview {
  id: Id
  bookingId: Id
  barberId: Id
  barberName: string
  stars: number
  comment: string
  createdAt: IsoDateTime
  edited: boolean
  visitAt: IsoDateTime
}

export interface ReviewTarget {
  bookingId: Id
  barberName: string
  visitAt: IsoDateTime
  servicesSummary: string
  existing: MyReview | null
}

export interface ReviewDraft {
  bookingId: Id
  stars: number
  comment: string
}

export type ReviewReportReason =
  "not_real_visit" | "abusive" | "personal_data" | "other_shop" | "other"
/** Dilaporkan (menunggu), Ditinjau, Dihapus, Dipertahankan. */
export type ReviewReportStatus = "reported" | "reviewing" | "deleted" | "kept"

export interface ReviewReportState {
  status: ReviewReportStatus
  reason: ReviewReportReason
  reportedAt: IsoDateTime
  /** Alasan keputusan Super Admin; ada setelah Dihapus atau Dipertahankan. */
  decisionReason?: string
}

export interface BarberReviewItem {
  id: Id
  /** Sudah dalam bentuk "Nama depan + inisial". */
  authorName: string
  stars: number
  comment: string
  createdAt: IsoDateTime
  edited: boolean
  report: ReviewReportState | null
}

export interface BarberReviewsData {
  average: number
  count: number
  /** Jumlah ulasan untuk 1 sampai 5 bintang, berurutan dari 1. */
  distribution: [number, number, number, number, number]
  reviews: BarberReviewItem[]
}

export interface ReportReviewInput {
  reviewId: Id
  reason: ReviewReportReason
  note: string
}
