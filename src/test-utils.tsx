import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render } from "@testing-library/react"
import type { ReactElement } from "react"
import { MemoryRouter, Route, Routes, useLocation } from "react-router"

/** Menampilkan jalur dan state navigasi saat ini, untuk menguji pengalihan. */
export function LocationProbe() {
  const l = useLocation()
  const notice = (l.state as { notice?: string } | null)?.notice
  return (
    <div>
      <p data-testid="path">{l.pathname}</p>
      {notice && <p>{notice}</p>}
    </div>
  )
}

export function renderRoute(ui: ReactElement, opts: { path: string; at: string }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[opts.at]}>
        <Routes>
          <Route path={opts.path} element={ui} />
          <Route path="*" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}
