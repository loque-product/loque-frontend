import { useQuery } from "@tanstack/react-query"
import { useMutate } from "@/shared/hooks"
import { shopService } from "../services"
import type {
  BasicsInput,
  CatalogDraftRow,
  DokuInput,
  HoursInput,
  OwnerInput,
  ShopProfileInput,
} from "../types"

export const useShopProfile = () =>
  useQuery({ queryKey: ["shops", "profile"], queryFn: () => shopService.getProfile() })
export const useDokuStatus = () =>
  useQuery({ queryKey: ["shops", "doku"], queryFn: () => shopService.getPaymentStatus() })
export const useShopList = () =>
  useQuery({ queryKey: ["shops", "list"], queryFn: () => shopService.listShops() })
export const useShopDetail = (id: string) =>
  useQuery({ queryKey: ["shops", "detail", id], queryFn: () => shopService.getShopDetail(id) })
export const useSetupData = (id: string) =>
  useQuery({ queryKey: ["shops", "setup", id], queryFn: () => shopService.getSetupData(id) })

const KEYS = ["shops", "audit", "accounts", "catalog", "schedule", "barbers", "notifications"]
export const useUpdateProfile = () =>
  useMutate((i: ShopProfileInput) => shopService.updateProfile(i), {
    invalidate: KEYS,
    success: "Profil toko disimpan.",
  })
export const useAddGalleryPhoto = () =>
  useMutate((label: string) => shopService.addGalleryPhoto(label), {
    invalidate: KEYS,
    success: "Foto ditambahkan.",
  })
export const useCreateShop = () =>
  useMutate((i: BasicsInput) => shopService.createShop(i), {
    invalidate: KEYS,
    success: "Toko dibuat dengan status Draf.",
    toastError: false,
  })
export const useSaveBasics = (id: string) =>
  useMutate((i: BasicsInput) => shopService.saveBasics(id, i), {
    invalidate: KEYS,
    success: "Data toko disimpan.",
    toastError: false,
  })
export const useSaveOwner = (id: string) =>
  useMutate((i: OwnerInput) => shopService.saveOwner(id, i), {
    invalidate: KEYS,
    success: "Akun Owner disimpan.",
    toastError: false,
  })
export const useSaveDoku = (id: string) =>
  useMutate((i: DokuInput) => shopService.saveDokuCredentials(id, i), {
    invalidate: KEYS,
    success: "Kredensial tersimpan.",
    toastError: false,
  })
export const useTestDoku = (id: string) =>
  useMutate(() => shopService.testDoku(id), { invalidate: KEYS, success: "Koneksi DOKU berhasil." })
export const useSaveCatalog = (id: string) =>
  useMutate((rows: CatalogDraftRow[]) => shopService.saveCatalog(id, rows), {
    invalidate: KEYS,
    success: "Katalog awal disimpan.",
    toastError: false,
  })
export const useSaveHours = (id: string) =>
  useMutate((i: HoursInput) => shopService.saveHours(id, i), {
    invalidate: KEYS,
    success: "Jam buka dan barber disimpan.",
    toastError: false,
  })
export const usePaymentTestStep = (id: string) =>
  useMutate(
    (i: { step: "create" | "refund"; amount: number }) =>
      shopService.runPaymentTestStep(id, i.step, i.amount),
    {
      invalidate: KEYS,
      success: (_r, a) =>
        a.step === "create"
          ? "Booking fee uji dibuat (simulasi)."
          : "Refund uji selesai (simulasi).",
      toastError: false,
    },
  )
export const useCompletePaymentTest = (id: string) =>
  useMutate(() => shopService.completePaymentTest(id), {
    invalidate: KEYS,
    success: "Tes pembayaran dinyatakan lulus.",
  })
export const useOpenShop = (id: string) =>
  useMutate(() => shopService.openShop(id), { invalidate: KEYS, success: "Toko dibuka ke publik." })
export const useFreezeShop = () =>
  useMutate((i: { id: string; reason: string }) => shopService.freezeShop(i.id, i.reason), {
    invalidate: KEYS,
    success: "Toko dibekukan.",
    toastError: false,
  })
export const useUnfreezeShop = () =>
  useMutate((id: string) => shopService.unfreezeShop(id), {
    invalidate: KEYS,
    success: "Toko diaktifkan kembali.",
  })
export const useDeleteShop = () =>
  useMutate(
    (i: { id: string; reason: string; confirmName: string }) =>
      shopService.deleteShop(i.id, i.reason, i.confirmName),
    {
      invalidate: [...KEYS, "invoicing", "booking"],
      success: "Toko dihapus permanen.",
      toastError: false,
    },
  )
