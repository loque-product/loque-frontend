import { describe, expect, it } from "vitest"
import { buildCsv } from "./csv"

describe("buildCsv", () => {
  const cols = [
    { header: "Nama", value: (r: { n: string; v: number }) => r.n },
    { header: "Nilai", value: (r: { n: string; v: number }) => r.v },
  ]
  it("menulis BOM, header, dan baris CRLF", () => {
    const csv = buildCsv(cols, [{ n: "Budi", v: 100 }])
    expect(csv.startsWith("\uFEFF")).toBe(true)
    expect(csv).toBe("\uFEFFNama,Nilai\r\nBudi,100\r\n")
  })
  it("mengutip koma, kutip ganda, dan baris baru", () => {
    const csv = buildCsv(cols, [{ n: 'A, "B"\nC', v: 1 }])
    expect(csv).toContain('"A, ""B""\nC",1')
  })
  it("menangkal injeksi rumus", () => {
    const csv = buildCsv(cols, [
      { n: '=HYPERLINK("x")', v: 1 },
      { n: "+1", v: 2 },
      { n: "@cmd", v: 3 },
    ])
    expect(csv).toContain(`"'=HYPERLINK(""x"")",1`)
    expect(csv).toContain("'+1,2")
    expect(csv).toContain("'@cmd,3")
  })
  it("angka negatif tetap angka", () => {
    expect(buildCsv(cols, [{ n: "x", v: -5 }])).toContain("x,-5")
  })
})
