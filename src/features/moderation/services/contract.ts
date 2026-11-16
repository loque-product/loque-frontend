import type { Barber, PhoneDispute, PhotoReport, ReviewReport } from "@/shared/types"
import type { DisputeDecision, PhotoDecision, ReviewDecision } from "../types"

export interface ModerationService {
  listPhotoReports(): Promise<PhotoReport[]>
  decidePhoto(id: string, decision: PhotoDecision, reason: string): Promise<PhotoReport>
  listReviewReports(): Promise<ReviewReport[]>
  decideReview(id: string, decision: ReviewDecision, reason: string): Promise<ReviewReport>
  listBarbersByShop(): Promise<
    {
      shopId: string
      shopName: string
      barbers: Barber[]
    }[]
  >
  hideBadge(barberId: string, reason: string): Promise<void>
  listDisputes(): Promise<PhoneDispute[]>
  /** Membuka detail sengketa mencatat audit "Super Admin membuka data pelanggan". */
  openDispute(id: string): Promise<PhoneDispute>
  decideDispute(id: string, decision: DisputeDecision, reason: string): Promise<PhoneDispute>
}
