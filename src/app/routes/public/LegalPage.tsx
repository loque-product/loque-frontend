import type { ReactNode } from "react"
import { usePageMeta } from "@/shared/hooks"

export interface LegalSection {
  id: string
  title: string
  body: ReactNode
}

/** Halaman teks terstruktur dengan daftar isi. */
export function LegalPage({
  title,
  intro,
  sections,
}: {
  title: string
  intro: string
  sections: LegalSection[]
}) {
  usePageMeta(title)
  return (
    <article className="mx-auto flex max-w-2xl flex-col gap-6">
      <header>
        <h1 className="text-title font-semibold text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-600">{intro}</p>
      </header>
      <nav aria-label="Daftar isi" className="rounded-xl bg-white p-4 shadow-card">
        <p className="mb-2 text-sm font-semibold text-slate-900">Daftar isi</p>
        <ol className="flex list-decimal flex-col pl-5 text-sm">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="flex min-h-11 items-center text-primary-800 underline"
              >
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      {sections.map((s) => (
        <section
          key={s.id}
          id={s.id}
          aria-labelledby={`${s.id}-h`}
          className="flex scroll-mt-20 flex-col gap-2"
        >
          <h2 id={`${s.id}-h`} className="text-section font-semibold text-slate-900">
            {s.title}
          </h2>
          <div className="flex flex-col gap-2 text-sm leading-6 text-slate-800">{s.body}</div>
        </section>
      ))}
    </article>
  )
}
