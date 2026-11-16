import { uploadBlob } from "@/shared/api"
import type { CompressedImage } from "@/shared/lib/image-compress"
import { portfolioService } from "../services"
import type { UploadPurpose } from "../types"

/** Meminta URL bertanda tangan lalu mengirim foto yang sudah dikompres. Mengembalikan kunci objek. */
export async function uploadCompressed(
  purpose: UploadPurpose,
  image: CompressedImage,
): Promise<string> {
  const target = await portfolioService.createUploadUrl({
    purpose,
    contentType: image.contentType,
    bytes: image.blob.size,
  })
  await uploadBlob(target.uploadUrl, image.blob)
  return target.objectKey
}

/** Mengompres di peramban (dimuat saat dibutuhkan) lalu mengunggah. */
export async function prepareImage(file: File): Promise<CompressedImage> {
  const { compressImage } = await import("@/shared/lib/image-compress")
  return compressImage(file)
}
