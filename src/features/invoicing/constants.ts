import type { InvoiceIssuer } from "@/shared/lib/export"

/** Identitas penerbit invoice (nilai sementara; ganti dengan identitas Loque sebenarnya sebelum produksi). NIK atau NPWP tidak dicantumkan di V1. */
export const LOQUE_ISSUER: InvoiceIssuer = {
  name: "Loque (perorangan)",
  address: "Jl. Contoh No 1, Kota Bandung, Jawa Barat",
  email: "tagihan@loque.id",
  contact: "0812-0000-0000",
  bankAccount: "Bank Contoh 000-000-0000 a.n. Loque",
}
