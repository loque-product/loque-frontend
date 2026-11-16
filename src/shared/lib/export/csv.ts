export interface CsvColumn<T> {
  header: string
  value: (row: T) => string | number | null | undefined
}

/** Mencegah injeksi rumus di Excel dan Sheets: nilai berawalan = + - @ diberi tanda kutip tunggal. */
function sanitize(v: string): string {
  return /^[=+\-@\t\r]/.test(v) ? `'${v}` : v
}

function cell(raw: string | number | null | undefined): string {
  if (raw === null || raw === undefined) return ""
  const text = typeof raw === "number" ? String(raw) : sanitize(raw)
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/** Membuat teks CSV: pemisah baris CRLF dan BOM UTF-8 agar Excel membaca karakter dengan benar. */
export function buildCsv<T>(columns: CsvColumn<T>[], rows: T[]): string {
  const lines = [
    columns.map((c) => cell(c.header)).join(","),
    ...rows.map((r) => columns.map((c) => cell(c.value(r))).join(",")),
  ]
  return `\uFEFF${lines.join("\r\n")}\r\n`
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function downloadCsv(filename: string, csv: string): void {
  downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), filename)
}
