import { useQuery } from "@tanstack/react-query"
import { useLiveQuery } from "@/shared/hooks"
import { reportService } from "../services"
import type { Range } from "../types"

export const useTodaySummary = () =>
  useLiveQuery(["reports", "today"], () => reportService.todaySummary())
export const useDashboard = () =>
  useLiveQuery(["reports", "dashboard"], () => reportService.dashboard())
export const useReport = (range: Range) =>
  useQuery({
    queryKey: ["reports", "report", range],
    queryFn: () => reportService.report(range),
  })
