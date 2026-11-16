import type { ReportService } from "./contract"
import { httpReportService } from "./http"

export type { ReportService } from "./contract"
export const reportService: ReportService = httpReportService
