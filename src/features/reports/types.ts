import type { Booking, PayMethod, VoidRequestPublic, Refund } from "@/shared/types"

export interface RangeStats {
  completed: number
  noShow: number
  cancelled: number
  voids: number
  revenue: number
}
export interface Compared {
  current: RangeStats
  previous: RangeStats
}
export interface RevenuePoint {
  date: string
  total: number
  cash: number
  qris: number
  transfer: number
  other: number
}
export interface DashboardData {
  today: Compared
  month: Compared
  pendingVoids: number
  pendingRefunds: number
  lateHandling: number
  loque: { transactions: number; amount: number }
  series: RevenuePoint[]
  attention: { voids: VoidRequestPublic[]; refunds: Refund[] }
}
export interface TodaySummary {
  completed: number
  noShow: number
  voids: number
  revenue: number
  byMethod: Record<PayMethod, number>
  onlineCredit: number
  recent: Booking[]
}
export interface BarberStat {
  barberId: string
  name: string
  completed: number
  noShow: number
  cancelledCustomer: number
  cancelledShop: number
}
export type CompositionKey = "service" | "addon" | "drink" | "product"
export const COMPOSITION_LABEL: Record<CompositionKey, string> = {
  service: "Layanan",
  addon: "Add-on",
  drink: "Minuman/Makanan",
  product: "Produk",
}
export interface CompositionSegment {
  key: CompositionKey
  label: string
  amount: number
  /** Persen dari total penjualan (0 sampai 100). */
  percent: number
}
export interface ReportData {
  composition: CompositionSegment[]
  series: RevenuePoint[]
  byMethod: Record<PayMethod, number>
  total: number
  perBarber: BarberStat[]
  sources: {
    online: number
    walkin: number
    link: number
    channels: { instagram: number; tiktok: number; whatsapp: number }
  }
}
export type ReportTab = "revenue" | "barber" | "source"
export interface Range {
  from: string
  to: string
}
export interface ExportTable {
  columns: string[]
  rows: (string | number)[][]
  filename: string
}
