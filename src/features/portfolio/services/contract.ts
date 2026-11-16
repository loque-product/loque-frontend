import type {
  AddPhotoInput,
  PhotoReportInput,
  PhotoReportResult,
  PortfolioPhoto,
  UploadTarget,
  UploadUrlInput,
} from "../types"

export interface PortfolioService {
  /** Tanpa login. Galat: RATE_LIMITED (5 per jam), CAPTCHA_REQUIRED. */
  reportPhoto(input: PhotoReportInput): Promise<PhotoReportResult>
  /** Portofolio milik barber yang masuk, urut tampil, termasuk foto yang disembunyikan. */
  listMine(): Promise<PortfolioPhoto[]>
  /** URL unggah bertanda tangan untuk foto portofolio, foto profil, atau sampul. Klien mengompres dan menghapus EXIF lebih dulu. */
  createUploadUrl(input: UploadUrlInput): Promise<UploadTarget>
  /** Menyimpan foto yang sudah diunggah. VALIDATION bila sudah 9 foto, persetujuan tidak ada, atau berkas masih memuat EXIF ("File mengandung metadata. Coba foto lain."). */
  addPhoto(input: AddPhotoInput): Promise<PortfolioPhoto>
  updateCaption(id: string, caption: string): Promise<PortfolioPhoto>
  /** Urutan baru berupa daftar ID lengkap. */
  reorder(ids: string[]): Promise<PortfolioPhoto[]>
  removePhoto(id: string): Promise<void>
}
