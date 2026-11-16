/** Pindah ke alamat luar aplikasi (DOKU, Google). Dipisah agar mudah dipalsukan dalam uji. */
export function goExternal(url: string): void {
  window.location.assign(url)
}
