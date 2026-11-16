import { ApiError } from "./errors"

/** Mengirim berkas ke URL unggah bertanda tangan (PUT). Tanpa cookie; URL sudah memuat izinnya. */
export async function uploadBlob(url: string, blob: Blob, signal?: AbortSignal): Promise<void> {
  let res: Response
  try {
    res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": blob.type },
      body: blob,
      signal,
    })
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e
    throw new ApiError("NETWORK")
  }
  if (!res.ok)
    throw new ApiError("UNKNOWN", "Foto tidak terunggah. Coba lagi.", {
      retryable: res.status >= 500,
    })
}
