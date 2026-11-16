import { describe, expect, it } from "vitest"
import { can } from "./permissions"

describe("can", () => {
  it("Admin & Kasir tidak bisa menyetujui void atau masuk area owner", () => {
    expect(can("admin_kasir", "void.decide")).toBe(false)
    expect(can("admin_kasir", "owner.dashboard")).toBe(false)
    expect(can("admin_kasir", "void.request")).toBe(true)
    expect(can("admin_kasir", "staff.create.barber")).toBe(true)
    expect(can("admin_kasir", "staff.create.admin")).toBe(false)
  })
  it("Owner punya semua kemampuan Admin ditambah area owner", () => {
    expect(can("owner", "void.decide")).toBe(true)
    expect(can("owner", "staff.create.admin")).toBe(true)
    expect(can("owner", "booking.manage")).toBe(true)
    expect(can("owner", "owner.export")).toBe(true)
  })
  it("Super Admin punya semua kemampuan Owner (mode toko) ditambah area Loque", () => {
    expect(can("super_admin", "booking.manage")).toBe(true)
    expect(can("super_admin", "void.decide")).toBe(true)
    expect(can("super_admin", "owner.export")).toBe(true)
    expect(can("super_admin", "sa.shops")).toBe(true)
    expect(can("super_admin", "staff.create.owner")).toBe(true)
  })
  it("Admin & Kasir dan Owner tidak punya izin area Loque", () => {
    for (const role of ["admin_kasir", "owner"] as const) {
      expect(can(role, "sa.shops")).toBe(false)
      expect(can(role, "sa.moderation")).toBe(false)
      expect(can(role, "sa.billing")).toBe(false)
      expect(can(role, "staff.create.owner")).toBe(false)
    }
  })
})
