import { describe, expect, it } from "vitest"
import {
  compressImage,
  fitWithin,
  hasExif,
  ImageError,
  MAX_BYTES,
  MAX_SIDE,
  type CompressDeps,
} from "./image-compress"

/** JPEG minimal dengan blok APP1 "Exif" (mis. memuat lokasi GPS). */
const jpegWithExif = new Uint8Array([
  0xff, 0xd8, 0xff, 0xe1, 0x00, 0x08, 0x45, 0x78, 0x69, 0x66, 0x00, 0x00, 0xff, 0xd9,
])
const jpegClean = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0x00, 0x00, 0xff, 0xd9])

function deps(opts: {
  width: number
  height: number
  output?: (w: number, h: number, q: number) => Blob
}) {
  const drawn: { w: number; h: number }[] = []
  const d: CompressDeps = {
    decode: async () => ({ width: opts.width, height: opts.height, source: {} }),
    canvas: (w, h) => ({
      getContext: () => ({ drawImage: () => void drawn.push({ w, h }) }),
      toBlob: (cb, type, q) =>
        cb(
          opts.output
            ? opts.output(w, h, q ?? 1)
            : new Blob([jpegClean], { type: type ?? "image/webp" }),
        ),
    }),
  }
  return { d, drawn }
}
const photo = new Blob(["x"], { type: "image/jpeg" })

describe("fitWithin", () => {
  it("sisi terpanjang tidak melebihi 1.600 piksel dan rasio terjaga", () => {
    expect(fitWithin(4000, 3000)).toEqual({ width: MAX_SIDE, height: 1200 })
    expect(fitWithin(3000, 4000)).toEqual({ width: 1200, height: MAX_SIDE })
  })
  it("tidak memperbesar foto kecil", () => {
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 })
  })
})

describe("hasExif", () => {
  it("mendeteksi APP1 Exif pada JPEG", () => {
    expect(hasExif(jpegWithExif)).toBe(true)
    expect(hasExif(jpegClean)).toBe(false)
  })
})

describe("compressImage", () => {
  it("mengecilkan ke 1.600 piksel dan menghasilkan foto tanpa EXIF", async () => {
    const { d, drawn } = deps({ width: 4000, height: 3000 })
    const out = await compressImage(photo, d)
    expect(drawn[0]).toEqual({ w: 1600, h: 1200 })
    expect(out.width).toBe(1600)
    expect(out.blob.size).toBeLessThanOrEqual(MAX_BYTES)
    expect(hasExif(new Uint8Array(await out.blob.arrayBuffer()))).toBe(false)
  })
  it("menurunkan kualitas sampai ukuran di bawah 1,5 MB", async () => {
    const qualities: number[] = []
    const { d } = deps({
      width: 2000,
      height: 1000,
      output: (_w, _h, q) => {
        qualities.push(q)
        return new Blob([new Uint8Array(q > 0.6 ? MAX_BYTES + 10 : 1000)], { type: "image/webp" })
      },
    })
    const out = await compressImage(photo, d)
    expect(out.blob.size).toBeLessThanOrEqual(MAX_BYTES)
    expect(qualities.length).toBeGreaterThan(1)
  })
  it("menolak hasil yang masih memuat EXIF", async () => {
    const { d } = deps({
      width: 800,
      height: 600,
      output: () => new Blob([jpegWithExif], { type: "image/webp" }),
    })
    await expect(compressImage(photo, d)).rejects.toBeInstanceOf(ImageError)
  })
  it("menolak file yang bukan foto", async () => {
    const { d } = deps({ width: 10, height: 10 })
    await expect(compressImage(new Blob(["x"], { type: "text/plain" }), d)).rejects.toThrow(
      "File harus berupa foto.",
    )
  })
})
