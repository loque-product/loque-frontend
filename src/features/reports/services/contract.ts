import type {
  DashboardData,
  ExportTable,
  Range,
  ReportData,
  ReportTab,
  TodaySummary,
} from "../types"

export interface ReportService {
  todaySummary(): Promise<TodaySummary>
  dashboard(): Promise<DashboardData>
  report(range: Range): Promise<ReportData>
  /** Data mentah untuk CSV. Hanya Owner. Nomor telepon hanya disertakan bila diminta. */
  exportRows(tab: ReportTab, range: Range, includePhone: boolean): Promise<ExportTable>
  /** Mencatat ekspor ke log audit. */
  recordExport(description: string, includePhone: boolean): Promise<void>
}
