import type { Money } from "@/shared/types"

export const LOQUE_FEE_PER_TRANSACTION: Money = 2000

export function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0)
}

export function clampMin(value: number, min = 0): number {
  return value < min ? min : value
}
