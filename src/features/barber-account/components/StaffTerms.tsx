import { Sheet } from "@/shared/components"

const SECTIONS: { id: string; title: string; body: string[] }[] = [
  {
    id: "persetujuan-foto",
    title: "Persetujuan foto portofolio",
    body: [
      "Setiap foto yang Anda unggah harus disetujui oleh pelanggan di dalam foto, atau oleh orang tua atau wali bila pelanggan di bawah 18 tahun.",
      "Anda bertanggung jawab atas persetujuan itu. Setiap unggahan mencatat siapa yang mengunggah dan kapan persetujuan diberikan.",
      "Bila pelanggan meminta fotonya dihapus, foto disembunyikan sampai diperiksa dan dapat dihapus permanen.",
    ],
  },
  {
    id: "nomor-customer",
    title: "Nomor telepon customer",
    body: [
      "Nomor telepon customer hanya untuk urusan booking, misalnya mengonfirmasi jadwal atau memberi tahu keterlambatan.",
      "Dilarang memakai nomor untuk promosi, membagikannya kepada pihak lain, atau menyimpannya di luar kebutuhan booking.",
    ],
  },
  {
    id: "data-pribadi",
    title: "Data pribadi dan hak Anda",
    body: [
      "Loque memproses data Anda sesuai Undang-Undang Pelindungan Data Pribadi (UU PDP): nama, email, foto, ulasan, dan catatan aktivitas akun.",
      "Anda berhak melihat, memperbaiki, dan menghapus data Anda. Hapus akun dan data tersedia di halaman Akun; permintaan ditolak bila masih ada booking mendatang.",
      "Akses ke data customer oleh tim Loque dicatat dan dapat diperiksa.",
    ],
  },
  {
    id: "akun",
    title: "Akun dan kata sandi",
    body: [
      "Jaga kerahasiaan kata sandi dan jangan membagikannya. Ganti kata sandi sementara saat pertama masuk, dan ganti kapan saja bila perlu.",
      "Toko dapat menonaktifkan keanggotaan Anda. Profil, portofolio, dan ulasan tetap tersimpan.",
    ],
  },
]

export function StaffTermsContent() {
  return (
    <div className="flex flex-col gap-5 text-sm text-slate-800">
      {SECTIONS.map((s) => (
        <section key={s.id} aria-labelledby={s.id} className="flex flex-col gap-1.5">
          <h3 id={s.id} className="text-base font-semibold text-slate-900">
            {s.title}
          </h3>
          {s.body.map((t) => (
            <p key={t}>{t}</p>
          ))}
        </section>
      ))}
    </div>
  )
}

export function StaffTermsSheet({
  open,
  onOpenChange,
  title = "Syarat staf",
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  title?: string
}) {
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Berlaku untuk barber dan staf toko di Loque."
    >
      <StaffTermsContent />
    </Sheet>
  )
}
