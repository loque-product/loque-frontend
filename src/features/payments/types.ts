import type { FeeMode, Money } from "@/shared/types"

export interface FeeConfig {
  amount: Money
  mode: FeeMode
}
