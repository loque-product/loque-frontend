// Penyimpanan peramban tiruan untuk uji di Node (jsdom sudah menyediakannya sendiri).
if (typeof globalThis.localStorage === "undefined") {
  const store = new Map<string, string>()
  Object.defineProperty(globalThis, "localStorage", {
    value: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
      clear: () => store.clear(),
    },
    configurable: true,
  })
}
