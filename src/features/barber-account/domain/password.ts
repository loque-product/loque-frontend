export const MIN_PASSWORD = 8

export interface Strength {
  /** 0 = belum memenuhi syarat minimal. */
  level: 0 | 1 | 2 | 3
  label: string
}

/** Penunjuk kekuatan berupa teks, bukan hanya warna. Aturan minimal: 8 karakter. */
export function passwordStrength(password: string): Strength {
  if (password.length === 0) return { level: 0, label: "" }
  if (password.length < MIN_PASSWORD) return { level: 0, label: "Terlalu pendek" }
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(password)).length
  const score = classes + (password.length >= 12 ? 1 : 0)
  if (score >= 4) return { level: 3, label: "Kuat" }
  if (score >= 3) return { level: 2, label: "Baik" }
  return { level: 1, label: "Cukup" }
}
