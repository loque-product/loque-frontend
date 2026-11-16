import type {
  BarberReviewsData,
  MyReview,
  PublicReview,
  ReportReviewInput,
  ReviewDraft,
  ReviewTarget,
} from "../types"

export interface ReviewService {
  /** Ulasan barber, terbaru lebih dulu. Tanpa login. */
  listForBarber(slug: string): Promise<PublicReview[]>
  listMine(): Promise<MyReview[]>
  /** FORBIDDEN bila booking belum Selesai atau bukan milik customer. */
  getTarget(bookingId: string): Promise<ReviewTarget>
  /** Membuat atau mengubah (menandai "Diedit"). Satu ulasan per booking. */
  save(draft: ReviewDraft): Promise<MyReview>
  /** Rating barber dihitung ulang server. */
  remove(reviewId: string): Promise<void>
  /** Ulasan tentang barber yang masuk, ringkasan, dan status laporan tiap ulasan. Tetap tersedia walau keanggotaan nonaktif. */
  listAboutMe(): Promise<BarberReviewsData>
  /** Barber melaporkan ulasan ke Super Admin. CONFLICT bila ulasan itu sudah dilaporkan. */
  reportReview(input: ReportReviewInput): Promise<void>
}
