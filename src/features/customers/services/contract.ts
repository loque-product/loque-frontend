import type { Booking, Customer } from "@/shared/types"

export interface CustomerService {
  search(query: string): Promise<Customer[]>
  history(customerId: string): Promise<Booking[]>
  findByPhone(phone: string): Promise<Customer | null>
}
