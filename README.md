# Loque

Frontend Loque: aplikasi web (React, TypeScript, Vite, Tailwind v4) untuk toko barbershop, customer, dan barber. Repositori ini tidak berisi backend maupun data tiruan.

```
pnpm install
cp .env.example .env
pnpm dev
```

Skrip: `typecheck`, `test`, `build`, `verify:prod`, `gen:services`, `format`. Panduan sambung backend dan daftar periksa produksi: `docs/handoff.md`. Kontrak API: `docs/api-contract.md`.

Struktur: `src/features/<fitur>/{components,hooks,services,domain,store}`, `src/shared`, `src/app` (rute, layout, guard). Impor antar fitur hanya lewat `index.ts`; `domain/` murni tanpa React.
