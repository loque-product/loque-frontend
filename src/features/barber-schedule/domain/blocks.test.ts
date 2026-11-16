import { describe, expect, it } from "vitest"
import type { DayHours, ShopHours } from "@/shared/types"
import type { BlockForm } from "../types"
import {
  blockHitsDate,
  coveredByShopClosure,
  datesCovered,
  toSaveInput,
  validateBlockForm,
  validateWorkingHours,
} from "./blocks"

const open = (from = "09:00", to = "20:00"): DayHours => ({ open: true, from, to })
const closed: DayHours = { open: false, from: "09:00", to: "20:00" }
// Indeks 0 = Minggu. Toko tutup hari Minggu.
const shop: ShopHours = {
  shopId: "s1",
  days: [closed, open(), open(), open(), open(), open(), open("09:00", "18:00")],
  holidays: [],
}

const form = (patch: Partial<BlockForm> = {}): BlockForm => ({
  kind: "fullDay",
  date: "2026-11-16",
  endDate: "2026-11-16",
  startTime: "12:00",
  endTime: "13:00",
  weekly: false,
  repeatUntil: "2026-12-07",
  reason: "",
  ...patch,
})

describe("validateWorkingHours", () => {
  const week = (patch: Record<number, DayHours>): DayHours[] =>
    shop.days.map((d, i) => patch[i] ?? d)
  it("jam yang berada di dalam jam buka toko valid", () => {
    expect(validateWorkingHours(week({ 1: open("10:00", "19:00") }), shop)).toEqual({})
  })
  it("jam selesai harus setelah jam mulai", () => {
    expect(validateWorkingHours(week({ 1: open("15:00", "14:00") }), shop)[1]).toBe(
      "Jam selesai harus setelah jam mulai.",
    )
  })
  it("jam harus berkelipatan 30 menit", () => {
    expect(validateWorkingHours(week({ 2: open("09:15", "17:00") }), shop)[2]).toBe(
      "Jam berkelipatan 30 menit.",
    )
  })
  it("tidak bisa bekerja di hari toko tutup", () => {
    expect(validateWorkingHours(week({ 0: open() }), shop)[0]).toBe("Toko tutup pada hari ini.")
  })
  it("tidak boleh melewati jam buka toko", () => {
    expect(validateWorkingHours(week({ 6: open("09:00", "19:00") }), shop)[6]).toBeTruthy()
  })
  it("hari libur barber tidak diperiksa", () => {
    expect(validateWorkingHours(week({ 1: { ...closed } }), shop)).toEqual({})
  })
})

describe("blok waktu", () => {
  it("blok sebagian jam wajib berkelipatan 30 menit dan urut", () => {
    expect(
      validateBlockForm(form({ kind: "partial", startTime: "12:10", endTime: "13:00" })).endTime,
    ).toBe("Jam berkelipatan 30 menit.")
    expect(
      validateBlockForm(form({ kind: "partial", startTime: "13:00", endTime: "12:00" })).endTime,
    ).toBe("Jam selesai harus setelah jam mulai.")
    expect(validateBlockForm(form({ kind: "partial" }))).toEqual({})
  })
  it("rentang tanggal tidak boleh berakhir sebelum mulai", () => {
    expect(validateBlockForm(form({ kind: "range", endDate: "2026-11-10" })).endDate).toBeTruthy()
  })
  it("pengulangan mingguan hanya pada hari yang sama dengan tanggal mulai", () => {
    const input = toSaveInput(form({ weekly: true }))
    expect(input).toMatchObject({
      from: "2026-11-16",
      to: "2026-12-07",
      weekly: true,
      startTime: null,
    })
    expect(datesCovered(input)).toEqual(["2026-11-16", "2026-11-23", "2026-11-30", "2026-12-07"])
    expect(blockHitsDate(input, "2026-11-23")).toBe(true)
    expect(blockHitsDate(input, "2026-11-24")).toBe(false)
  })
  it("pengulangan mingguan diabaikan untuk rentang tanggal", () => {
    const input = toSaveInput(form({ kind: "range", endDate: "2026-11-18", weekly: true }))
    expect(input.weekly).toBe(false)
    expect(input.to).toBe("2026-11-18")
  })
  it("blok pada hari toko tutup tidak diperlukan", () => {
    // 2026-11-15 adalah hari Minggu.
    expect(
      coveredByShopClosure(toSaveInput(form({ date: "2026-11-15", endDate: "2026-11-15" })), shop),
    ).toBe(true)
    expect(coveredByShopClosure(toSaveInput(form()), shop)).toBe(false)
  })
})
