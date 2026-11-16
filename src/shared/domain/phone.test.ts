import { describe, expect, it } from "vitest"
import { normalizePhone } from "./phone"

describe("normalizePhone", () => {
  it("menyamakan tiga bentuk penulisan", () => {
    expect(normalizePhone("0812-0000-1001")).toBe("081200001001")
    expect(normalizePhone("+62 812 0000 1001")).toBe("081200001001")
    expect(normalizePhone("6281200001001")).toBe("081200001001")
  })
  it("menolak nomor yang tidak valid", () => {
    expect(normalizePhone("")).toBeNull()
    expect(normalizePhone("0212345678")).toBeNull()
    expect(normalizePhone("0812")).toBeNull()
    expect(normalizePhone("08123456789012345")).toBeNull()
    expect(normalizePhone("08x2000010010")).toBeNull()
  })
})
