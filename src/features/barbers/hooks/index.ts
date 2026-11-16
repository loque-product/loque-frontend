import { useQuery } from "@tanstack/react-query"
import { barberDirectoryService } from "../services"

export const barbersKey = ["barbers"] as const
export const useBarberList = () =>
  useQuery({
    queryKey: [...barbersKey, "list"],
    queryFn: () => barberDirectoryService.list(),
    staleTime: 60_000,
  })
export const useBarberProfile = (slug: string) =>
  useQuery({
    queryKey: [...barbersKey, "profile", slug],
    queryFn: () => barberDirectoryService.getBySlug(slug),
    enabled: slug !== "",
    retry: false,
  })
