import { useQuery } from "@tanstack/react-query"
import { barberService } from "../services"

export const useBarbers = () =>
  useQuery({
    queryKey: ["barbers", "list"],
    queryFn: () => barberService.list(),
  })
