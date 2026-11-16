import { useQuery } from "@tanstack/react-query"
import { auditService } from "../services"

export const useShopAudit = (enabled = true) =>
  useQuery({ queryKey: ["audit", "shop"], queryFn: () => auditService.listShop(), enabled })
export const useGlobalAudit = (enabled = true) =>
  useQuery({ queryKey: ["audit", "global"], queryFn: () => auditService.listGlobal(), enabled })
