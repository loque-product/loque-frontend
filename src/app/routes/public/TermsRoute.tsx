import { LegalPage } from "./LegalPage"

export default function TermsRoute() {
  return (
    <LegalPage
      title="Syarat penggunaan"
      intro="Berlaku untuk customer yang memakai Loque untuk booking di toko ini."
      sections={[
        {
          id: "layanan",
          title: "Layanan",
          body: (
            <p>
              Loque membantu Anda memilih barber, layanan, dan jam, lalu memesan jam tersebut.
              Layanan potong rambut dilakukan di toko, bukan lewat aplikasi.
            </p>
          ),
        },
        {
          id: "akun",
          title: "Akun",
          body: (
            <p>
              Anda masuk dengan akun Google dan melengkapi nama serta nomor WhatsApp. Satu nomor
              hanya boleh dipakai satu akun. Data harus benar agar toko dapat menghubungi Anda.
            </p>
          ),
        },
        {
          id: "booking",
          title: "Booking dan pembayaran",
          body: (
            <>
              <p>
                Jam ditahan selama 15 menit sejak booking dibuat. Jika pembayaran booking fee tidak
                selesai dalam waktu itu, jam dilepas dan booking kedaluwarsa.
              </p>
              <p>
                Sisa tagihan layanan dibayar di toko sesuai skema yang tertera di ringkasan booking.
              </p>
            </>
          ),
        },
        {
          id: "pembatalan",
          title: "Pembatalan dan tidak hadir",
          body: (
            <>
              <p>
                Anda dapat membatalkan sampai jam mulai lewat halaman Booking saya. Booking fee
                tidak dikembalikan pada pembatalan oleh customer.
              </p>
              <p>
                Bila Anda tidak hadir setelah masa tunggu 15 menit, booking ditandai tidak hadir dan
                booking fee hangus. Untuk mengganti jadwal, hubungi toko lewat WhatsApp.
              </p>
            </>
          ),
        },
        {
          id: "pengembalian",
          title: "Pengembalian dana",
          body: (
            <p>
              Bila toko yang membatalkan booking, booking fee dikembalikan. Statusnya tampil sebagai
              Refund diproses lalu Refund selesai.
            </p>
          ),
        },
        {
          id: "ulasan",
          title: "Ulasan",
          body: (
            <p>
              Anda hanya dapat mengulas booking yang selesai, satu ulasan per booking. Ulasan harus
              jujur, tanpa kata kasar atau data pribadi orang lain. Ulasan yang melanggar dapat
              ditinjau dan dihapus.
            </p>
          ),
        },
        {
          id: "foto",
          title: "Foto di galeri",
          body: (
            <p>
              Bila Anda atau anak Anda terlihat di foto galeri dan tidak ingin foto itu tampil,
              laporkan lewat tombol Laporkan foto. Foto disembunyikan sampai diperiksa.
            </p>
          ),
        },
      ]}
    />
  )
}
