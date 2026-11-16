import { useQuery } from "@tanstack/react-query"
import { shopInfoService } from "../services"

export const shopInfoKey = ["shop-info"] as const
export const useShopInfo = () =>
  useQuery({ queryKey: shopInfoKey, queryFn: () => shopInfoService.getInfo(), staleTime: 60_000 })
