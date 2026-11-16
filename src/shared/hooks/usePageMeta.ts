import { useEffect } from "react"

/** Judul dan deskripsi halaman per rute. */
export function usePageMeta(title: string, description?: string): void {
  useEffect(() => {
    document.title = title === "Loque" ? title : `${title} | Loque`
    if (description) {
      let m = document.querySelector<HTMLMetaElement>('meta[name="description"]')
      if (!m) {
        m = document.createElement("meta")
        m.name = "description"
        document.head.appendChild(m)
      }
      m.content = description
    }
  }, [title, description])
}
