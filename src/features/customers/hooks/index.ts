import { useQuery } from "@tanstack/react-query"
import { customerService } from "../services"

export const useCustomerSearch = (q: string) =>
  useQuery({
    queryKey: ["customers", "search", q],
    queryFn: () => customerService.search(q),
  })
export const useCustomerHistory = (id: string | null) =>
  useQuery({
    queryKey: ["customers", "history", id],
    queryFn: () => customerService.history(id as string),
    enabled: id !== null,
  })
export const usePhoneMatch = (phone: string) =>
  useQuery({
    queryKey: ["customers", "phone", phone],
    queryFn: () => customerService.findByPhone(phone),
    enabled: phone.replace(/\D/g, "").length >= 8,
  })
