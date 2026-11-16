import { describe, expect, it } from "vitest"
import { isInAppBrowser } from "./inApp"

describe("isInAppBrowser", () => {
  it("mengenali Instagram dan TikTok", () => {
    expect(isInAppBrowser("Mozilla/5.0 (iPhone) AppleWebKit Mobile Instagram 300.0")).toBe(true)
    expect(
      isInAppBrowser("Mozilla/5.0 (Linux; Android 13) musical_ly_29.0 BytedanceWebview/d8a21c6"),
    ).toBe(true)
  })
  it("browser biasa lolos", () => {
    expect(isInAppBrowser("Mozilla/5.0 (Linux; Android 13) Chrome/120 Mobile Safari/537.36")).toBe(
      false,
    )
  })
})
