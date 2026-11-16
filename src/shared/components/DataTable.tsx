import { Search } from "lucide-react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { useState, type ReactNode } from "react"
import { useIsDesktop } from "@/shared/hooks"
import { cn } from "@/shared/utils/cn"
import { Async, EmptyState } from "./feedback"
import { Pagination } from "./Pagination"
import { Input } from "./ui/form"
import { Skeleton } from "./ui/skeleton"

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    /** Sembunyikan kolom di tampilan kartu mobile. */
    hideOnCard?: boolean
    className?: string
  }
}

interface Props<T> {
  columns: ColumnDef<T, unknown>[]
  query: {
    data: T[] | undefined
    isLoading: boolean
    isError: boolean
    refetch: () => unknown
  }
  searchPlaceholder?: string
  /** Fungsi pencarian bebas; tanpa ini kotak pencarian tidak tampil. */
  searchText?: (row: T) => string
  filters?: ReactNode
  toolbar?: ReactNode
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: ReactNode
  onRowClick?: (row: T) => void
  pageSize?: number
  rowKey: (row: T) => string
  rowClassName?: (row: T) => string | undefined
  /** Hitungan hasil pada keterangan. */
  caption?: string
}

export function DataTable<T>({
  columns,
  query,
  searchPlaceholder = "Cari",
  searchText,
  filters,
  toolbar,
  emptyTitle = "Belum ada data.",
  emptyDescription,
  emptyAction,
  onRowClick,
  pageSize = 10,
  rowKey,
  rowClassName,
  caption,
}: Props<T>) {
  const [search, setSearch] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const desktop = useIsDesktop()
  const data = query.data
  const filtered =
    data && searchText && search.trim()
      ? data.filter((r) => searchText(r).toLowerCase().includes(search.trim().toLowerCase()))
      : data

  return (
    <div className="flex flex-col gap-3">
      {(searchText || filters || toolbar) && (
        <div className="flex flex-wrap items-center gap-2">
          {searchText && (
            <div className="relative min-w-48 flex-1 md:max-w-sm">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500"
                aria-hidden
              />
              <Input
                aria-label={searchPlaceholder}
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          )}
          {filters}
          {toolbar}
        </div>
      )}
      <Async
        query={{ ...query, data: filtered }}
        skeleton={
          <div className="flex flex-col gap-2" aria-busy="true" aria-label="Memuat">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        }
        isEmpty={(d) => d.length === 0}
        empty={
          <div className="rounded-xl bg-white">
            <EmptyState
              title={search ? "Tidak ada hasil." : emptyTitle}
              description={search ? "Ubah kata kunci pencarian Anda." : emptyDescription}
              action={search ? undefined : emptyAction}
            />
          </div>
        }
      >
        {(rows) => (
          <Grid
            rows={rows}
            columns={columns}
            desktop={desktop}
            sorting={sorting}
            setSorting={setSorting}
            pageSize={pageSize}
            onRowClick={onRowClick}
            rowKey={rowKey}
            rowClassName={rowClassName}
            caption={caption}
          />
        )}
      </Async>
    </div>
  )
}

interface GridProps<T> {
  rows: T[]
  columns: ColumnDef<T, unknown>[]
  desktop: boolean
  sorting: SortingState
  setSorting: (s: SortingState) => void
  pageSize: number
  onRowClick?: (row: T) => void
  rowKey: (row: T) => string
  rowClassName?: (row: T) => string | undefined
  caption?: string
}

function Grid<T>({
  rows,
  columns,
  desktop,
  sorting,
  setSorting,
  pageSize,
  onRowClick,
  rowKey,
  rowClassName,
  caption,
}: GridProps<T>) {
  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: (u) => setSorting(typeof u === "function" ? u(sorting) : u),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
    getRowId: (r) => rowKey(r),
  })
  const pageRows = table.getRowModel().rows
  const activate = (r: T) => onRowClick?.(r)

  return (
    <div>
      {caption && <p className="mb-2 text-xs text-slate-600">{caption}</p>}
      {desktop ? (
        <div className="overflow-x-auto rounded-xl bg-white shadow-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-600">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th
                      key={h.id}
                      scope="col"
                      className={cn("px-4 py-3", h.column.columnDef.meta?.className)}
                      aria-sort={
                        h.column.getIsSorted() === "asc"
                          ? "ascending"
                          : h.column.getIsSorted() === "desc"
                            ? "descending"
                            : undefined
                      }
                    >
                      {h.column.getCanSort() ? (
                        <button
                          type="button"
                          className="inline-flex min-h-8 items-center gap-1"
                          onClick={h.column.getToggleSortingHandler()}
                        >
                          {flexRender(h.column.columnDef.header, h.getContext())}
                          <span aria-hidden>
                            {h.column.getIsSorted() === "asc"
                              ? "↑"
                              : h.column.getIsSorted() === "desc"
                                ? "↓"
                                : ""}
                          </span>
                        </button>
                      ) : (
                        flexRender(h.column.columnDef.header, h.getContext())
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y">
              {pageRows.map((r) => (
                <tr
                  key={r.id}
                  tabIndex={onRowClick ? 0 : undefined}
                  onClick={onRowClick ? () => activate(r.original) : undefined}
                  onKeyDown={
                    onRowClick
                      ? (e) => {
                          if (e.key === "Enter") activate(r.original)
                        }
                      : undefined
                  }
                  className={cn(
                    "min-h-11",
                    onRowClick && "cursor-pointer hover:bg-slate-50",
                    rowClassName?.(r.original),
                  )}
                >
                  {r.getVisibleCells().map((c) => (
                    <td
                      key={c.id}
                      className={cn("px-4 py-3 align-middle", c.column.columnDef.meta?.className)}
                    >
                      {flexRender(c.column.columnDef.cell, c.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {pageRows.map((r) => (
            <li key={r.id}>
              <div
                role={onRowClick ? "button" : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={onRowClick ? () => activate(r.original) : undefined}
                onKeyDown={
                  onRowClick
                    ? (e) => {
                        if (e.key === "Enter") activate(r.original)
                      }
                    : undefined
                }
                className={cn("rounded-xl bg-white p-4 shadow-card", rowClassName?.(r.original))}
              >
                <dl className="flex flex-col gap-2">
                  {r
                    .getVisibleCells()
                    .filter((c) => !c.column.columnDef.meta?.hideOnCard)
                    .map((c) => (
                      <div key={c.id} className="flex items-start justify-between gap-3">
                        <dt className="shrink-0 text-xs font-medium text-slate-600">
                          {typeof c.column.columnDef.header === "string"
                            ? c.column.columnDef.header
                            : ""}
                        </dt>
                        <dd className="min-w-0 text-right text-sm text-slate-900">
                          {flexRender(c.column.columnDef.cell, c.getContext())}
                        </dd>
                      </div>
                    ))}
                </dl>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Pagination
        page={table.getState().pagination.pageIndex}
        pageCount={table.getPageCount()}
        onPageChange={(p) => table.setPageIndex(p)}
      />
    </div>
  )
}
