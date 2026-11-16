import type {
  BookingStatus,
  FeeMode,
  PayMethod,
  Role,
  ServiceCategory,
  VoidStatus,
} from "@/shared/types"

export const ROLE_LABEL: Record<Role, string> = {
  admin_kasir: "Admin & Kasir",
  owner: "Owner & Manajer",
  super_admin: "Super Admin",
  customer: "Customer",
  barber: "Barber",
}

export const ROLE_HOME: Record<Role, string> = {
  admin_kasir: "/staf/timeline",
  owner: "/owner",
  super_admin: "/sa/toko",
  customer: "/",
  barber: "/barber/hari-ini",
}

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  unpaid: "Menunggu pembayaran",
  expired: "Kedaluwarsa",
  confirmed: "Terkonfirmasi",
  completed: "Selesai",
  cancelled_customer: "Dibatalkan pelanggan",
  cancelled_shop: "Dibatalkan toko",
  no_show: "Tidak hadir",
}

export const VOID_STATUS_LABEL: Record<VoidStatus, string> = {
  pending: "Menunggu",
  approved: "Disetujui",
  rejected: "Ditolak",
  expired: "Kedaluwarsa",
  locked: "Terkunci",
}

export const FEE_MODE_LABEL: Record<FeeMode, string> = {
  deduct: "Potong tagihan",
  separate: "Terpisah",
  none: "Tidak ada",
}

export const PAY_METHOD_LABEL: Record<PayMethod, string> = {
  cash: "Tunai",
  qris: "QRIS toko",
  transfer: "Transfer bank",
  other: "Lainnya",
}

export const CATEGORY_LABEL: Record<ServiceCategory, string> = {
  haircut: "Haircut",
  longtrim: "Long Trim",
  addon: "Add-on",
  treatment: "Hair Treatment",
  coloring: "Hair Coloring",
}

export const SOURCE_LABEL = {
  online: "Online",
  walkin: "Walk-in",
  link: "Tautan",
  staff: "Dibuat staf",
} as const
export const CHANNEL_LABEL = {
  instagram: "Instagram",
  tiktok: "TikTok",
  whatsapp: "WhatsApp",
} as const

export const SLOT_MINUTES = 30
export const MIN_LEAD_MINUTES = 60
export const NO_SHOW_WAIT_MINUTES = 15
export const NO_SHOW_CONTACT_MINUTES = 10
export const VOID_TTL_HOURS = 24
export const VOID_MAX_ATTEMPTS = 5
export const PHOTO_HIDDEN_SLA_HOURS = 48
export const PHOTO_SLA_DAYS = 7
export const REVIEW_SLA_DAYS = 7
export const BEST_RATED_MIN_REVIEWS = 5
export const POLL_INTERVAL_MS = 30000
/** Hari ini barber diperbarui tiap 60 detik. */
export const BARBER_POLL_MS = 60000
/** Batas foto portofolio per barber. */
export const PORTFOLIO_MAX_PHOTOS = 9
export const HOLD_MINUTES = 15
export const HOLD_POLL_MS = 3000
export const BOOKING_WINDOW_DAYS = 45
export const REVIEW_MAX_LENGTH = 300

export const GENDER_LABEL = { male: "Pria", female: "Wanita" } as const

/** Indeks mengikuti hari dalam minggu (Minggu = 0), sama dengan `dowOfYmd`. */
export const DAY_LABEL = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"] as const
