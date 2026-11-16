// Dibuat oleh scripts/gen-services.mjs dari contract.ts. Jangan diubah tangan.
import { call } from "@/shared/api"
import type { ReportService } from "./contract"

export const httpReportService: ReportService = {
  todaySummary: () => call("reports", "reports.todaySummary", {}, { read: true }),
  dashboard: () => call("reports", "reports.dashboard", {}, { read: true }),
  report: (range) => call("reports", "reports.report", { range }, { read: true }),
  exportRows: (tab, range, includePhone) => call("reports", "reports.exportRows", { tab, range, includePhone }, { read: true }),
  recordExport: (description, includePhone) => call("reports", "reports.recordExport", { description, includePhone }),
}
