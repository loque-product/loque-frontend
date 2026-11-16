/**
 * Prefix rute dari `base` Vite (`VITE_BASE_PATH`), mis. "/" atau "/app/".
 * Root tidak memakai basename; subpath dipakai tanpa garis miring di akhir.
 */
export function resolveBasename(base: string): string | undefined {
  const path = base.replace(/\/+$/, "")
  return path === "" ? undefined : path
}
