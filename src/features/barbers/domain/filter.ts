import type { PublicBarber } from "../types"

export const norm = (s: string) => s.trim().toLowerCase()

/** Pencarian nama dan filter spesialisasi (chip). */
export function filterBarbers(
  barbers: PublicBarber[],
  query: string,
  specialty: string | null,
): PublicBarber[] {
  const q = norm(query)
  return barbers.filter(
    (b) =>
      (q === "" || norm(b.name).includes(q)) &&
      (specialty === null || b.specialties.some((s) => norm(s) === norm(specialty))),
  )
}

export function allSpecialties(barbers: PublicBarber[]): string[] {
  return [...new Set(barbers.flatMap((b) => b.specialties))].sort((a, b) =>
    a.localeCompare(b, "id"),
  )
}
