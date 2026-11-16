import type { Id, IsoDateTime, ModerationReason } from "@/shared/types"

export interface PhotoReportInput {
  photoId: Id
  reason: ModerationReason
  note: string
  contact?: string
  /** Token Turnstile; wajib mulai laporan ketiga. */
  captchaToken?: string
}

export interface PhotoReportResult {
  /** Foto langsung disembunyikan (alasan 1 dan 2). */
  hidden: boolean
}

export type UploadPurpose = "portfolio" | "avatar" | "cover"

export interface UploadUrlInput {
  purpose: UploadPurpose
  contentType: "image/jpeg" | "image/webp"
  bytes: number
}

export interface UploadTarget {
  /** URL penyimpanan bertanda tangan; berkas dikirim dengan PUT. */
  uploadUrl: string
  /** Kunci objek yang dikirim kembali saat menyimpan foto atau profil. */
  objectKey: string
}

export interface AddPhotoInput {
  objectKey: string
  caption: string
  width: number
  height: number
  /** Persetujuan pelanggan (atau orang tua/wali) wajib; server mencatat siapa dan kapan. */
  consent: true
}

export interface PortfolioPhoto {
  id: Id
  url: string
  caption: string
  width: number
  height: number
  /** Urutan tampil, mulai dari 1. */
  position: number
  /** Disembunyikan sampai laporan diperiksa. */
  hidden: boolean
  hiddenReason?: string
  /** Batas pemeriksaan laporan. */
  hiddenUntil?: IsoDateTime
  consentAt: IsoDateTime
}
