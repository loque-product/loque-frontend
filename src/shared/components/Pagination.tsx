import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./ui/button"

export function Pagination({
  page,
  pageCount,
  onPageChange,
}: {
  page: number
  pageCount: number
  onPageChange: (p: number) => void
}) {
  if (pageCount <= 1) return null
  return (
    <nav aria-label="Halaman" className="flex items-center justify-between gap-2 pt-3">
      <p className="text-sm text-slate-600">
        Halaman {page + 1} dari {pageCount}
      </p>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" aria-hidden />
          Sebelumnya
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= pageCount - 1}
          onClick={() => onPageChange(page + 1)}
        >
          Berikutnya
          <ChevronRight className="size-4" aria-hidden />
        </Button>
      </div>
    </nav>
  )
}
