import { env } from "@/shared/lib/env"
import { ApiError, type ApiErrorCode } from "./errors"

const CODES: ReadonlySet<string> = new Set<ApiErrorCode>([
  "UNAUTHENTICATED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "VALIDATION",
  "SLOT_TAKEN",
  "HOLD_EXISTS",
  "HOLD_EXPIRED",
  "FEE_CHANGED",
  "PHONE_IN_USE",
  "HAS_UPCOMING_BOOKINGS",
  "BLOCK_CONFLICT",
  "RATE_LIMITED",
  "CAPTCHA_REQUIRED",
  "NETWORK",
  "UNKNOWN",
])

interface ErrorBody {
  error?: {
    code?: string
    message?: string
    details?: unknown
    fields?: Record<string, string>
    retryable?: boolean
  }
}

export interface CallOptions {
  /** Permintaan baca: boleh diulang untuk galat `retryable`. */
  read?: boolean
  signal?: AbortSignal
}

const RETRIES = 2

/** Kode HTTP ke kode galat bila badan respons tidak memuatnya. */
function codeFromStatus(status: number): ApiErrorCode {
  if (status === 401) return "UNAUTHENTICATED"
  if (status === 403) return "FORBIDDEN"
  if (status === 404) return "NOT_FOUND"
  if (status === 409) return "CONFLICT"
  if (status === 422) return "VALIDATION"
  if (status === 429) return "RATE_LIMITED"
  return "UNKNOWN"
}

async function toApiError(res: Response): Promise<ApiError> {
  let body: ErrorBody = {}
  try {
    body = (await res.json()) as ErrorBody
  } catch {
    /* badan kosong atau bukan JSON */
  }
  const e = body.error
  const code = e?.code && CODES.has(e.code) ? (e.code as ApiErrorCode) : codeFromStatus(res.status)
  return new ApiError(code, e?.message, {
    details: e?.details,
    fields: e?.fields,
    retryable: e?.retryable ?? res.status >= 500,
  })
}

async function once<T>(
  domain: string,
  action: string,
  payload: unknown,
  opts: CallOptions,
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  // Mutasi membawa kunci idempotensi agar aman diulang oleh klien atau jaringan.
  if (!opts.read) headers["Idempotency-Key"] = crypto.randomUUID()
  let res: Response
  try {
    res = await fetch(`${env.apiBaseUrl}/functions/v1/${domain}`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({ action, payload }),
      signal: opts.signal,
    })
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e
    throw new ApiError("NETWORK")
  }
  if (!res.ok) throw await toApiError(res)
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

/** Satu-satunya pintu jaringan: `POST /functions/v1/<domain>` dengan `{ action, payload }`. */
export async function call<T>(
  domain: string,
  action: string,
  payload: unknown = {},
  opts: CallOptions = {},
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await once<T>(domain, action, payload, opts)
    } catch (e) {
      const retry = opts.read && ApiError.is(e) && e.retryable && attempt < RETRIES
      if (!retry) throw e
      await new Promise((r) => setTimeout(r, 300 * 2 ** attempt))
    }
  }
}
