import { describe, expect, it } from "vitest"
import { resolveBasename } from "./basename"

describe("resolveBasename", () => {
  it("root tidak memakai basename", () => {
    expect(resolveBasename("/")).toBeUndefined()
  })
  it("subpath dipakai tanpa garis miring di akhir", () => {
    expect(resolveBasename("/app/")).toBe("/app")
    expect(resolveBasename("/app")).toBe("/app")
  })
})
