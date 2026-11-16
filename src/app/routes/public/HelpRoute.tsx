import { ChevronDown } from "lucide-react"
import { Accordion } from "radix-ui"
import { usePageMeta } from "@/shared/hooks"
import { formatRupiah } from "@/shared/utils/format"
import { useShopInfo } from "@/features/shop-info"

export default function HelpRoute() {
  usePageMeta("Bantuan", "Pertanyaan umum tentang booking, fee, pembatalan, dan ulasan.")
  const fee = useShopInfo().data?.feeAmount ?? 10000
  const price = 55000
  const items = [
    {
      id: "fee",
      q: "Bagaimana booking fee bekerja?",
      a: (
        <>
          <p>
            Toko memilih salah satu dari tiga skema. Skema yang berlaku untuk booking Anda selalu
            tampil di ringkasan sebelum Anda membayar.
          </p>
          <p>
            <strong>Potong tagihan.</strong> Contoh: layanan {formatRupiah(price)}, booking fee{" "}
            {formatRupiah(fee)}. Anda bayar {formatRupiah(fee)} sekarang dan{" "}
            {formatRupiah(price - fee)} di toko.
          </p>
          <p>
            <strong>Terpisah.</strong> Fee di luar tagihan. Contoh: layanan {formatRupiah(price)},
            booking fee {formatRupiah(fee)}. Anda bayar {formatRupiah(fee)} sekarang dan{" "}
            {formatRupiah(price)} di toko.
          </p>
          <p>
            <strong>Tanpa fee.</strong> Booking langsung terkonfirmasi dan Anda membayar seluruh
            tagihan di toko.
          </p>
        </>
      ),
    },
    {
      id: "hold",
      q: "Berapa lama jam saya ditahan?",
      a: (
        <p>
          Selama 15 menit sejak booking dibuat. Selesaikan pembayaran dalam waktu itu, atau jam
          dilepas.
        </p>
      ),
    },
    {
      id: "batal",
      q: "Bagaimana membatalkan atau mengganti jadwal?",
      a: (
        <p>
          Batalkan lewat Booking saya sampai jam mulai. Booking fee tidak dikembalikan. Untuk
          mengganti jadwal, hubungi toko lewat tombol WhatsApp di detail booking.
        </p>
      ),
    },
    {
      id: "noshow",
      q: "Bagaimana bila saya terlambat atau tidak hadir?",
      a: (
        <p>
          Toko menunggu 15 menit. Setelah itu booking ditandai tidak hadir dan booking fee hangus.
        </p>
      ),
    },
    {
      id: "refund",
      q: "Kapan booking fee dikembalikan?",
      a: (
        <p>
          Bila toko yang membatalkan booking. Statusnya Refund diproses, lalu Refund selesai setelah
          toko mengembalikan dana.
        </p>
      ),
    },
    {
      id: "ulasan",
      q: "Bagaimana cara memberi ulasan?",
      a: (
        <p>
          Setelah booking selesai, buka notifikasi atau detail booking lalu beri 1 sampai 5 bintang
          dan komentar. Satu ulasan per booking; Anda bisa mengubah atau menghapusnya kapan saja.
        </p>
      ),
    },
    {
      id: "data",
      q: "Bagaimana data pribadi saya diperlakukan?",
      a: (
        <p>
          Baca Kebijakan privasi. Anda dapat menghapus akun dan data dari halaman Akun bila tidak
          ada booking mendatang.
        </p>
      ),
    },
  ]
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <h1 className="text-title font-semibold text-slate-900">Bantuan</h1>
      <Accordion.Root type="multiple" className="divide-y rounded-xl bg-white px-4 shadow-card">
        {items.map((it) => (
          <Accordion.Item key={it.id} value={it.id}>
            <Accordion.Header>
              <Accordion.Trigger className="group flex min-h-11 w-full items-center justify-between gap-3 py-3 text-left text-sm font-medium text-slate-900">
                {it.q}
                <ChevronDown
                  className="size-4 shrink-0 transition-transform group-data-[state=open]:rotate-180"
                  aria-hidden
                />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="flex flex-col gap-2 pb-4 text-sm leading-6 text-slate-800">
              {it.a}
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </div>
  )
}
