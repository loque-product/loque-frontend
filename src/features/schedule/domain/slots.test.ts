import { describe, expect, it } from "vitest"
import { fromWib, toIso } from "@/shared/domain/time"
import type { Booking, ShopHours, WorkingHours } from "@/shared/types"
import { computeSlots, findAffectedBookings, nearestAvailable, type ScheduleContext } from "./slots"

const day = { open: true, from: "09:00", to: "21:00" }
const days = Array.from({ length: 7 }, () => ({ ...day }))
const shopHours: ShopHours = { shopId: "s", days, holidays: [] }
const workingHours: WorkingHours[] = [{ barberId: "b1", days: days.map((d) => ({ ...d })) }]
const ctx: ScheduleContext = { shopHours, workingHours, blocks: [] }
const date = "2030-01-09"
const now = fromWib("2030-01-09", "08:30").getTime()

const booking = (start: string, end: string, status: Booking["status"] = "confirmed"): Booking =>
  ({
    id: "x",
    barberId: "b1",
    start: toIso(date, start),
    end: toIso(date, end),
    status,
  }) as Booking

describe("computeSlots", () => {
  it("menghasilkan slot 30 menit yang muat dengan durasi", () => {
    const slots = computeSlots(ctx, {
      date,
      barberId: "b1",
      duration: 60,
      bookings: [],
      now,
      isWalkIn: false,
    })
    expect(slots[0].time).toBe("09:00")
    expect(slots.find((s) => s.time === "20:30")?.available).toBe(false)
    expect(slots.find((s) => s.time === "20:00")?.available).toBe(true)
  })
  it("membuang slot yang mulai kurang dari 60 menit dari sekarang kecuali walk-in", () => {
    const online = computeSlots(ctx, {
      date,
      barberId: "b1",
      duration: 30,
      bookings: [],
      now,
      isWalkIn: false,
    })
    expect(online.find((s) => s.time === "09:00")?.available).toBe(false)
    expect(online.find((s) => s.time === "09:30")?.available).toBe(true)
    const walkin = computeSlots(ctx, {
      date,
      barberId: "b1",
      duration: 30,
      bookings: [],
      now,
      isWalkIn: true,
    })
    expect(walkin.find((s) => s.time === "09:00")?.available).toBe(true)
  })
  it("mengurangi booking aktif tetapi tidak booking batal", () => {
    const bookings = [booking("10:00", "11:00"), booking("12:00", "13:00", "cancelled_shop")]
    const slots = computeSlots(ctx, {
      date,
      barberId: "b1",
      duration: 60,
      bookings,
      now,
      isWalkIn: true,
    })
    expect(slots.find((s) => s.time === "10:00")?.available).toBe(false)
    expect(slots.find((s) => s.time === "09:30")?.available).toBe(false)
    expect(slots.find((s) => s.time === "12:00")?.available).toBe(true)
  })
  it("jadwal toko mengalahkan jam kerja barber", () => {
    const narrow: ScheduleContext = {
      ...ctx,
      workingHours: [
        {
          barberId: "b1",
          days: days.map(() => ({ open: true, from: "08:00", to: "22:00" })),
        },
      ],
    }
    const slots = computeSlots(narrow, {
      date,
      barberId: "b1",
      duration: 30,
      bookings: [],
      now,
      isWalkIn: true,
    })
    expect(slots[0].time).toBe("09:00")
    expect(slots[slots.length - 1].time).toBe("20:30")
  })
  it("blok waktu menutup slot dan libur menutup hari", () => {
    const blocked: ScheduleContext = {
      ...ctx,
      blocks: [
        {
          id: "k",
          barberId: "b1",
          from: date,
          to: date,
          startTime: "13:00",
          endTime: "14:00",
          weekly: false,
          label: "Istirahat",
        },
      ],
    }
    const slots = computeSlots(blocked, {
      date,
      barberId: "b1",
      duration: 30,
      bookings: [],
      now,
      isWalkIn: true,
    })
    expect(slots.find((s) => s.time === "13:00")?.reason).toBe("block")
    const holiday: ScheduleContext = {
      ...ctx,
      shopHours: {
        ...shopHours,
        holidays: [{ id: "h", from: date, to: date, label: "Libur" }],
      },
    }
    expect(
      computeSlots(holiday, {
        date,
        barberId: "b1",
        duration: 30,
        bookings: [],
        now,
        isWalkIn: true,
      }),
    ).toEqual([])
  })
  it("mencari jam terdekat dan booking terdampak", () => {
    const bookings = [booking("10:00", "11:00")]
    const slots = computeSlots(ctx, {
      date,
      barberId: "b1",
      duration: 60,
      bookings,
      now,
      isWalkIn: true,
    })
    expect(nearestAvailable(slots, "10:00", 2)).toEqual(["09:00", "11:00"])
    const closed: ScheduleContext = {
      ...ctx,
      shopHours: {
        ...shopHours,
        holidays: [{ id: "h", from: date, to: date, label: "Libur" }],
      },
    }
    expect(findAffectedBookings(closed, bookings, now)).toHaveLength(1)
    expect(findAffectedBookings(ctx, bookings, now)).toHaveLength(0)
  })

  it("timeblock menutup slot barber pada rentangnya saja", () => {
    const withBlock: ScheduleContext = {
      ...ctx,
      timeblocks: [
        {
          id: "t1",
          shopId: "s",
          barberId: "b1",
          startAt: toIso(date, "15:00"),
          endAt: toIso(date, "16:30"),
          allDay: false,
          reason: "Istirahat",
          createdBy: "x",
        },
      ],
    }
    const slots = computeSlots(withBlock, {
      date,
      barberId: "b1",
      duration: 30,
      bookings: [],
      now,
      isWalkIn: true,
    })
    expect(slots.find((s) => s.time === "14:30")?.available).toBe(true)
    expect(slots.find((s) => s.time === "15:00")?.reason).toBe("block")
    expect(slots.find((s) => s.time === "16:00")?.reason).toBe("block")
    expect(slots.find((s) => s.time === "16:30")?.available).toBe(true)
    // durasi 60 menit yang menabrak awal timeblock juga ditolak
    const long = computeSlots(withBlock, {
      date,
      barberId: "b1",
      duration: 60,
      bookings: [],
      now,
      isWalkIn: true,
    })
    expect(long.find((s) => s.time === "14:30")?.reason).toBe("block")
    // barber lain tidak terpengaruh
    expect(
      computeSlots(withBlock, {
        date,
        barberId: "b2",
        duration: 30,
        bookings: [],
        now,
        isWalkIn: true,
      }),
    ).toEqual([])
  })
  it("timeblock sehari penuh dan lintas hari menutup semua slot pada hari-hari itu", () => {
    const next = "2030-01-10"
    const multi: ScheduleContext = {
      ...ctx,
      timeblocks: [
        {
          id: "t2",
          shopId: "s",
          barberId: "b1",
          startAt: toIso(date, "00:00"),
          endAt: toIso(next, "00:00"),
          allDay: true,
          reason: "Cuti",
          createdBy: "x",
        },
      ],
    }
    const all = computeSlots(multi, {
      date,
      barberId: "b1",
      duration: 30,
      bookings: [],
      now,
      isWalkIn: true,
    })
    expect(all.every((s) => s.reason === "block")).toBe(true)
    const nextDay = computeSlots(multi, {
      date: next,
      barberId: "b1",
      duration: 30,
      bookings: [],
      now,
      isWalkIn: true,
    })
    expect(nextDay.some((s) => s.available)).toBe(true)
    // rentang beberapa hari
    const range: ScheduleContext = {
      ...ctx,
      timeblocks: [
        {
          id: "t3",
          shopId: "s",
          barberId: "b1",
          startAt: toIso(date, "00:00"),
          endAt: toIso("2030-01-12", "00:00"),
          allDay: true,
          reason: "Cuti",
          createdBy: "x",
        },
      ],
    }
    expect(
      computeSlots(range, {
        date: next,
        barberId: "b1",
        duration: 30,
        bookings: [],
        now,
        isWalkIn: true,
      }).every((s) => !s.available),
    ).toBe(true)
  })
  it("booking aktif di dalam timeblock dianggap terdampak", () => {
    const withBlock: ScheduleContext = {
      ...ctx,
      timeblocks: [
        {
          id: "t1",
          shopId: "s",
          barberId: "b1",
          startAt: toIso(date, "10:30"),
          endAt: toIso(date, "11:30"),
          allDay: false,
          reason: "x",
          createdBy: "x",
        },
      ],
    }
    expect(findAffectedBookings(withBlock, [booking("10:00", "11:00")], now)).toHaveLength(1)
    expect(findAffectedBookings(withBlock, [booking("12:00", "13:00")], now)).toHaveLength(0)
  })
})
