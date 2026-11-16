import { useQuery } from "@tanstack/react-query"
import { barberLinksService } from "../services"

export const useBarberLinks = () =>
  useQuery({ queryKey: ["barber-links", "mine"], queryFn: () => barberLinksService.getMine() })
