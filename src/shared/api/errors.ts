export type ApiErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION"
  | "SLOT_TAKEN"
  | "HOLD_EXISTS"
  | "HOLD_EXPIRED"
  | "FEE_CHANGED"
  | "PHONE_IN_USE"
  | "HAS_UPCOMING_BOOKINGS"
  | "BLOCK_CONFLICT"
  | "RATE_LIMITED"
  | "CAPTCHA_REQUIRED"
  | "NETWORK"
  | "UNKNOWN"

export const ERROR_MESSAGE: Record<ApiErrorCode, string> = {
  UNAUTHENTICATED: "Sesi Anda berakhir. Silakan masuk lagi.",
  FORBIDDEN: "Anda tidak memiliki akses ke halaman itu.",
  NOT_FOUND: "Data tidak ditemukan.",
  CONFLICT: "Data berubah. Muat ulang lalu coba lagi.",
  VALIDATION: "Data belum valid. Periksa isian Anda.",
  SLOT_TAKEN: "Jam ini baru saja diambil. Pilih jam lain.",
  HOLD_EXISTS: "Anda masih punya booking yang menunggu pembayaran.",
  HOLD_EXPIRED: "Waktu pembayaran habis.",
  FEE_CHANGED: "Booking fee berubah. Periksa ringkasan terbaru.",
  PHONE_IN_USE: "Nomor ini sudah terdaftar di akun lain. Hubungi toko atau Loque.",
  HAS_UPCOMING_BOOKINGS: "Batalkan booking mendatang dulu.",
  BLOCK_CONFLICT: "Ada booking pada waktu ini.",
  RATE_LIMITED: "Terlalu banyak percobaan. Coba lagi nanti.",
  CAPTCHA_REQUIRED: "Selesaikan verifikasi terlebih dulu.",
  NETWORK: "Tidak dapat terhubung. Coba lagi.",
  UNKNOWN: "Tidak dapat menyimpan. Coba lagi.",
}

export interface ApiErrorExtra {
  fields?: Record<string, string>
  details?: unknown
  retryable?: boolean
}

export class ApiError extends Error {
  readonly code: ApiErrorCode
  readonly fields?: Record<string, string>
  readonly details?: unknown
  /** Galat sementara; aman diulang untuk permintaan baca. */
  readonly retryable: boolean

  constructor(code: ApiErrorCode, message?: string, extra?: ApiErrorExtra) {
    super(message ?? ERROR_MESSAGE[code])
    this.name = "ApiError"
    this.code = code
    this.fields = extra?.fields
    this.details = extra?.details
    this.retryable = extra?.retryable ?? code === "NETWORK"
  }

  static is(e: unknown): e is ApiError {
    return e instanceof ApiError
  }

  static from(e: unknown): ApiError {
    if (e instanceof ApiError) return e
    return new ApiError("UNKNOWN")
  }
}
