import type { HhmmString, Id, IsoDateTime, Money, Role, YmdString } from "./index"

export type Gender = "male" | "female"
export type FeeMode = "deduct" | "separate" | "none"
export type ServiceCategory = "haircut" | "longtrim" | "addon" | "treatment" | "coloring"
export type PayMethod = "cash" | "qris" | "transfer" | "other"
export type BookingSource = "online" | "walkin" | "link" | "staff"
export type BookingStatus =
  | "unpaid"
  | "expired"
  | "confirmed"
  | "completed"
  | "cancelled_customer"
  | "cancelled_shop"
  | "no_show"

export interface Shop {
  id: Id
  name: string
  address: string
  status: "draft" | "open" | "frozen"
  /** Kota atau kabupaten. */
  city: string
  timezone: "WIB"
  whatsapp: string
  instagram: string
  tiktok: string
  ownerId: Id | null
  /** Pernah dibuka ke publik. Toko yang pernah dibuka tidak dapat dihapus, hanya dibekukan. */
  everOpened: boolean
  frozenReason?: string
  frozenAt?: IsoDateTime
  dokuMode: "sandbox" | "production"
  paymentTest: { amount: Money; feeCreated: boolean; refunded: boolean }
  doku: {
    status: "not_connected" | "connected" | "problem"
    checkedAt: IsoDateTime | null
    credentialsSaved: boolean
  }
  setup: {
    ownerCreated: boolean
    dokuConnected: boolean
    catalogFilled: boolean
    hoursSet: boolean
    paymentTested: boolean
  }
  feeAmount: Money
  feeMode: FeeMode
  voidThreshold: Money
  gallery: string[]
  createdAt: IsoDateTime
}

export type StaffRole = "admin_kasir" | "owner" | "barber" | "super_admin"
export interface StaffAccount {
  id: Id
  shopId: Id | null
  name: string
  email: string
  role: StaffRole
  active: boolean
  mustChangePassword: boolean
  barberId?: Id
  phone?: string
}

export interface Barber {
  id: Id
  shopId: Id
  name: string
  tier: string
  slug: string
  active: boolean
  rating: number
  reviewCount: number
  lastReviewAt: IsoDateTime
  badgeHidden: boolean
  linkStats: {
    views: number
    bookings: number
    instagram: number
    tiktok: number
    whatsapp: number
  }
}

export interface Customer {
  id: Id
  name: string
  phone: string
}

export interface Service {
  id: Id
  shopId: Id
  name: string
  category: ServiceCategory
  basePrice: Money
  duration: number
  startingFrom: boolean
  active: boolean
}
export interface ServiceOverride {
  serviceId: Id
  barberId: Id
  price?: Money
  duration?: number
}

export interface DayHours {
  open: boolean
  from: HhmmString
  to: HhmmString
}
export interface ShopHoliday {
  id: Id
  from: YmdString
  to: YmdString
  label: string
}
export interface ShopHours {
  shopId: Id
  /** Indeks 0 = Minggu. */
  days: DayHours[]
  holidays: ShopHoliday[]
}
export interface WorkingHours {
  barberId: Id
  days: DayHours[]
}
export interface ScheduleBlock {
  id: Id
  /** Terisi untuk blok seluruh toko (barberId null), agar tidak bocor ke toko lain. */
  shopId?: Id
  /** null = seluruh toko. */
  barberId: Id | null
  from: YmdString
  to: YmdString
  /** Kosong berarti satu hari penuh. */
  startTime: HhmmString | null
  endTime: HhmmString | null
  weekly: boolean
  label: string
}

export interface BookingItem {
  serviceId: Id
  name: string
  price: Money
  duration: number
}
export interface HistoryEntry {
  at: IsoDateTime
  actor: string
  text: string
}
export interface Booking {
  id: Id
  shopId: Id
  customerId: Id | null
  customerName: string
  customerPhone: string | null
  barberId: Id
  items: BookingItem[]
  start: IsoDateTime
  end: IsoDateTime
  status: BookingStatus
  source: BookingSource
  channel?: "instagram" | "tiktok" | "whatsapp"
  feeMode: FeeMode
  feeAmount: Money
  serviceTotal: Money
  createdAt: IsoDateTime
  latePayment: boolean
  cancelReason?: string
  note?: string
  history: HistoryEntry[]
}

export interface BillLine {
  id: Id
  name: string
  qty: number
  price: Money
  kind: "service" | "addon" | "product" | "drink"
  /** Item master (add-on, minuman atau makanan, produk) bila baris berasal dari master. */
  extraItemId?: Id
}
export interface Bill {
  id: Id
  bookingId: Id
  lines: BillLine[]
  status: "open" | "completed" | "voided"
  method?: PayMethod
  paidAmount?: Money
  completedAt?: IsoDateTime
  cashierId?: Id
  cashierName?: string
  total: Money
  creditToBill: Money
  payAtShop: Money
  /** Biaya Loque berlaku untuk tagihan ini. */
  chargeable: boolean
  voidedAt?: IsoDateTime
}

export type VoidStatus = "pending" | "approved" | "rejected" | "expired" | "locked"
export interface VoidRequest {
  id: Id
  billId: Id
  bookingId: Id
  customerName: string
  amount: Money
  requesterId: Id
  requesterName: string
  reason: string
  createdAt: IsoDateTime
  expiresAt: IsoDateTime
  /** Hanya dikirim ke Owner. Tidak ada di VoidRequestPublic. */
  token: string
  attempts: number
  status: VoidStatus
  decidedById?: Id
  decidedAt?: IsoDateTime
  note?: string
}
export type VoidRequestPublic = Omit<VoidRequest, "token">

export interface Refund {
  id: Id
  bookingId: Id
  customerName: string
  customerPhone: string | null
  amount: Money
  status: "needed" | "done"
  createdAt: IsoDateTime
  doneAt?: IsoDateTime
  reference?: string
}

export interface InvoiceLine {
  date: IsoDateTime
  bookingId: Id
  label: string
  amount: Money
  fee: Money
}
export interface Invoice {
  id: Id
  shopId: Id
  number: string
  periodStart: YmdString
  periodEnd: YmdString
  /** open = periode berjalan. */
  status: "open" | "unpaid" | "paid"
  lines: InvoiceLine[]
  credits: { voidId: Id; label: string; amount: Money }[]
  feePerTransaction: Money
  total: Money
  paidAt?: IsoDateTime
  note?: string
  closedAt?: IsoDateTime
}

export type ModerationReason = "me_in_photo" | "my_child" | "other"
export interface PhotoReport {
  id: Id
  shopId: Id
  barberId: Id
  barberName: string
  imageUrl: string
  caption: string
  reason: ModerationReason
  reporterNote: string
  reporterContact?: string
  consent: string
  reportedAt: IsoDateTime
  hidden: boolean
  decision?: "deleted" | "restored" | "kept_hidden"
  decisionReason?: string
  decidedAt?: IsoDateTime
}
export interface ReviewReport {
  id: Id
  shopId: Id
  barberId: Id
  barberName: string
  reviewerName: string
  stars: number
  comment: string
  visitDate: IsoDateTime
  visitServices: string
  visitCompleted: boolean
  reportReason: string
  reportedAt: IsoDateTime
  decision?: "deleted" | "kept"
  decisionReason?: string
  decidedAt?: IsoDateTime
}
export interface PhoneDispute {
  id: Id
  phone: string
  currentOwner: string
  reporter: string
  evidenceType: "booking_code" | "chat_screenshot" | "shop_confirmation"
  evidenceText: string
  evidenceImage?: string
  status: "new" | "reviewing" | "decided"
  createdAt: IsoDateTime
  decision?: "reassigned" | "rejected"
  decisionReason?: string
  history: { at: IsoDateTime; from: string; to: string; by: string }[]
}

export interface AppNotification {
  id: Id
  audience: "staff" | "super_admin" | "customer" | "barber"
  title: string
  body: string
  createdAt: IsoDateTime
  read: boolean
  link: string
}

export type AuditCategory =
  | "price"
  | "schedule"
  | "fee"
  | "void"
  | "no_show"
  | "export"
  | "account"
  | "customer_access"
  | "moderation"
  | "invoice"
  | "shop"
export interface AuditLog {
  id: Id
  shopId: Id | null
  /** Nama toko saat entri dibuat; tetap ada setelah toko dihapus. */
  shopName?: string
  at: IsoDateTime
  actorId: Id
  actorName: string
  actorRole: Role
  category: AuditCategory
  action: string
  object: string
  before?: string
  after?: string
}

/** Penutup slot satu barber pada rentang waktu tertentu. */
export interface Timeblock {
  id: Id
  shopId: Id
  barberId: Id
  startAt: IsoDateTime
  /** Batas akhir eksklusif. */
  endAt: IsoDateTime
  allDay: boolean
  reason: string
  createdBy: string
}

export type ExtraItemType = "addon" | "food_drink" | "product"
export interface ExtraItem {
  id: Id
  shopId: Id
  name: string
  type: ExtraItemType
  price: Money
  active: boolean
}
