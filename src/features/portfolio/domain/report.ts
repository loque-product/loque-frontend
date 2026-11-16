import type { ModerationReason } from "@/shared/types"

export const REPORT_REASON_LABEL: Record<ModerationReason, string> = {
  me_in_photo: "Saya ada di foto ini",
  my_child: "Anak saya",
  other: "Lainnya",
}

/** Alasan "Saya ada di foto ini" dan "Anak saya" menyembunyikan foto seketika. */
export const hidesImmediately = (reason: ModerationReason): boolean => reason !== "other"

/** Turnstile wajib mulai laporan ketiga. */
export const CAPTCHA_AFTER = 2
export const REPORT_LIMIT_PER_HOUR = 5
export const needsCaptcha = (priorReports: number): boolean => priorReports >= CAPTCHA_AFTER
