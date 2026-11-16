import { LegalPage } from "./LegalPage"

export default function PrivacyRoute() {
  return (
    <LegalPage
      title="Kebijakan privasi"
      intro="Cara Loque mengumpulkan, memakai, dan melindungi data pribadi Anda."
      sections={[
        {
          id: "data",
          title: "Data yang dikumpulkan",
          body: (
            <p>
              Nama dan email dari akun Google, nomor WhatsApp yang Anda isi, riwayat booking,
              transaksi booking fee, ulasan, serta nama tamu bila Anda memesan untuk orang lain.
              Telepon tamu tidak diminta.
            </p>
          ),
        },
        {
          id: "penerima",
          title: "Penerima data",
          body: (
            <>
              <p>
                Toko menerima nama, nomor WhatsApp, dan detail booking Anda untuk melayani Anda.
                Penyedia pembayaran (DOKU) memproses pembayaran booking fee. Loque tidak menjual
                data Anda.
              </p>
              <p>Ulasan tampil di profil barber dengan nama depan dan inisial nama belakang.</p>
            </>
          ),
        },
        {
          id: "simpan",
          title: "Lama penyimpanan",
          body: (
            <p>
              Data disimpan selama akun aktif dan selama diperlukan untuk catatan transaksi dan
              kewajiban hukum. Setelah akun dihapus, data pribadi dihapus atau dianonimkan.
            </p>
          ),
        },
        {
          id: "hak",
          title: "Hak Anda",
          body: (
            <p>
              Anda dapat melihat dan mengubah nama serta nomor di halaman Akun, dan menghapus akun
              beserta data. Penghapusan ditolak selama masih ada booking mendatang; batalkan booking
              itu lebih dulu.
            </p>
          ),
        },
        {
          id: "analitik",
          title: "Peristiwa analitik",
          body: (
            <p>
              Loque mencatat peristiwa penggunaan, seperti melihat profil barber, memilih layanan,
              dan membuka pembayaran, untuk memahami alur booking. Peristiwa memakai ID pseudonim
              acak di peramban Anda dan kanal tautan (Instagram, TikTok, atau WhatsApp), bukan nama
              atau nomor telepon.
            </p>
          ),
        },
        {
          id: "akses",
          title: "Akses oleh Super Admin",
          body: (
            <p>
              Super Admin Loque dapat mengakses data untuk dukungan, penanganan sengketa, dan
              moderasi. Seluruh akses tercatat dalam log audit.
            </p>
          ),
        },
      ]}
    />
  )
}
