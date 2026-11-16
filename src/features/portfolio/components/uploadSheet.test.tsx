// @vitest-environment jsdom
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { renderRoute } from "@/test-utils"

const upload = vi.hoisted(() => ({
  prepareImage: vi.fn(),
  uploadCompressed: vi.fn(),
}))
vi.mock("../hooks/upload", () => upload)
vi.mock("../services", () => ({ portfolioService: {} }))

import { UploadPhotoSheet } from "./UploadPhotoSheet"

const renderSheet = (count: number) =>
  renderRoute(<UploadPhotoSheet open onOpenChange={() => undefined} count={count} />, {
    path: "/barber/profil",
    at: "/barber/profil",
  })

async function pickPhoto() {
  const input = (await screen.findByLabelText("Pilih foto", {
    selector: "input",
  })) as HTMLInputElement
  fireEvent.change(input, { target: { files: [new File(["x"], "a.jpg", { type: "image/jpeg" })] } })
  await screen.findByAltText("Pratinjau foto")
}

beforeEach(() => {
  vi.clearAllMocks()
  URL.createObjectURL = vi.fn(() => "blob:preview")
  URL.revokeObjectURL = vi.fn()
  upload.prepareImage.mockResolvedValue({
    blob: new Blob(["y"], { type: "image/webp" }),
    width: 10,
    height: 10,
    contentType: "image/webp",
  })
})
afterEach(cleanup)

describe("unggah foto portofolio", () => {
  it("tombol Unggah mati sampai persetujuan dicentang", async () => {
    renderSheet(2)
    await pickPhoto()
    const button = screen.getByRole("button", { name: "Unggah" }) as HTMLButtonElement
    expect(button.disabled).toBe(true)
    fireEvent.click(screen.getByRole("checkbox"))
    await waitFor(() => expect(button.disabled).toBe(false))
  })

  it("kuota 9 foto penuh menonaktifkan Unggah walau sudah disetujui", async () => {
    renderSheet(9)
    await pickPhoto()
    fireEvent.click(screen.getByRole("checkbox"))
    expect((screen.getByRole("button", { name: "Unggah" }) as HTMLButtonElement).disabled).toBe(
      true,
    )
  })
})
