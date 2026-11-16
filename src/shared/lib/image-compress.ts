/** Kompresi foto di browser: sisi terpanjang maks. 1.600 piksel, WebP atau JPEG, maks. 1,5 MB, tanpa metadata. */
export const MAX_SIDE = 1600
export const MAX_BYTES = 1.5 * 1024 * 1024
const START_QUALITY = 0.85
const MIN_QUALITY = 0.45

export class ImageError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ImageError"
  }
}

/** Ukuran baru dengan sisi terpanjang tidak melebihi `max`; tidak pernah memperbesar. */
export function fitWithin(
  width: number,
  height: number,
  max = MAX_SIDE,
): { width: number; height: number } {
  const longest = Math.max(width, height)
  if (longest <= max) return { width, height }
  const scale = max / longest
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

const ascii = (bytes: Uint8Array, at: number, text: string) =>
  text.split("").every((c, i) => bytes[at + i] === c.charCodeAt(0))

/** Mendeteksi blok metadata EXIF pada JPEG (APP1), WebP (chunk EXIF), dan PNG (chunk eXIf). */
export function hasExif(bytes: Uint8Array): boolean {
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    let i = 2
    while (i + 4 < bytes.length && bytes[i] === 0xff) {
      const marker = bytes[i + 1]
      if (marker === 0xda || marker === 0xd9) break
      const length = (bytes[i + 2] << 8) | bytes[i + 3]
      if (marker === 0xe1 && ascii(bytes, i + 4, "Exif")) return true
      i += 2 + length
    }
    return false
  }
  if (ascii(bytes, 0, "RIFF") && ascii(bytes, 8, "WEBP")) {
    let i = 12
    while (i + 8 <= bytes.length) {
      if (ascii(bytes, i, "EXIF")) return true
      const size = bytes[i + 4] | (bytes[i + 5] << 8) | (bytes[i + 6] << 16) | (bytes[i + 7] << 24)
      i += 8 + size + (size % 2)
    }
    return false
  }
  if (ascii(bytes, 1, "PNG")) {
    let i = 8
    while (i + 8 <= bytes.length) {
      if (ascii(bytes, i + 4, "eXIf")) return true
      const size = (bytes[i] << 24) | (bytes[i + 1] << 16) | (bytes[i + 2] << 8) | bytes[i + 3]
      i += 12 + size
    }
  }
  return false
}

export interface DrawingSurface {
  drawImage(source: unknown, x: number, y: number, width: number, height: number): void
}
export interface CanvasLike {
  getContext(id: "2d"): DrawingSurface | null
  toBlob(callback: (blob: Blob | null) => void, type?: string, quality?: number): void
}
export interface CompressDeps {
  /** Membaca foto dengan orientasi sudah diterapkan, supaya gambar tidak berputar setelah EXIF hilang. */
  decode(
    blob: Blob,
  ): Promise<{ width: number; height: number; source: unknown; close?: () => void }>
  canvas(width: number, height: number): CanvasLike
}

export const browserDeps: CompressDeps = {
  async decode(blob) {
    const bitmap = await createImageBitmap(blob, { imageOrientation: "from-image" })
    return {
      width: bitmap.width,
      height: bitmap.height,
      source: bitmap,
      close: () => bitmap.close(),
    }
  },
  canvas(width, height) {
    const el = document.createElement("canvas")
    el.width = width
    el.height = height
    return el
  },
}

export interface CompressedImage {
  blob: Blob
  width: number
  height: number
  contentType: "image/jpeg" | "image/webp"
}

const encode = (canvas: CanvasLike, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality))

/**
 * Menggambar ulang foto ke kanvas (menghapus EXIF), mengecilkan, lalu menurunkan kualitas
 * sampai tidak lebih dari 1,5 MB. Melempar `ImageError` bila bukan foto atau tetap terlalu besar.
 */
export async function compressImage(
  file: Blob,
  deps: CompressDeps = browserDeps,
): Promise<CompressedImage> {
  if (!file.type.startsWith("image/")) throw new ImageError("File harus berupa foto.")
  let decoded: Awaited<ReturnType<CompressDeps["decode"]>>
  try {
    decoded = await deps.decode(file)
  } catch {
    throw new ImageError("Foto tidak bisa dibaca. Coba foto lain.")
  }
  try {
    let { width, height } = fitWithin(decoded.width, decoded.height)
    for (let shrink = 0; shrink < 4; shrink++) {
      const canvas = deps.canvas(width, height)
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new ImageError("Foto tidak bisa diproses di peramban ini.")
      ctx.drawImage(decoded.source, 0, 0, width, height)
      for (let quality = START_QUALITY; quality >= MIN_QUALITY - 0.001; quality -= 0.1) {
        const blob = await encode(canvas, "image/webp", quality)
        if (!blob) throw new ImageError("Foto tidak bisa diproses di peramban ini.")
        // Peramban tanpa encoder WebP mengembalikan PNG; ulangi sebagai JPEG.
        const out = blob.type === "image/webp" ? blob : await encode(canvas, "image/jpeg", quality)
        if (!out) throw new ImageError("Foto tidak bisa diproses di peramban ini.")
        if (out.size <= MAX_BYTES) {
          if (hasExif(new Uint8Array(await out.arrayBuffer())))
            throw new ImageError("File mengandung metadata. Coba foto lain.")
          return {
            blob: out,
            width,
            height,
            contentType: out.type === "image/webp" ? "image/webp" : "image/jpeg",
          }
        }
      }
      width = Math.max(1, Math.round(width * 0.8))
      height = Math.max(1, Math.round(height * 0.8))
    }
    throw new ImageError("Foto terlalu besar. Coba foto lain.")
  } finally {
    decoded.close?.()
  }
}
