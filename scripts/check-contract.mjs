// Gagal bila ada aksi di contract.ts yang tidak punya implementasi http atau tidak ada di docs/api-contract.md.
// Pakai: pnpm check:contract
import fs from "node:fs"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
const featuresDir = path.join(root, "src/features")
const docs = fs.readFileSync(path.join(root, "docs/api-contract.md"), "utf8")
const problems = []
let total = 0

for (const feature of fs.readdirSync(featuresDir).sort()) {
  const contract = path.join(featuresDir, feature, "services/contract.ts")
  if (!fs.existsSync(contract)) continue
  const src = fs.readFileSync(contract, "utf8")
  const body = src.match(/export interface \w+ \{([\s\S]*)\n\}/)?.[1] ?? ""
  // Nama metode: baris berindentasi dua spasi berbentuk `nama(`.
  const names = [...body.matchAll(/^ {2}(\w+)\(/gm)].map((m) => m[1])
  const httpFile = path.join(featuresDir, feature, "services/http.ts")
  const http = fs.existsSync(httpFile) ? fs.readFileSync(httpFile, "utf8") : ""
  const indexFile = path.join(featuresDir, feature, "services/index.ts")
  if (names.length && !fs.existsSync(indexFile)) problems.push(`${feature}: services/index.ts tidak ada`)
  for (const n of names) {
    total++
    const action = `${feature}.${n}`
    if (!http.includes(`"${action}"`)) problems.push(`${action}: tidak ada di services/http.ts (jalankan pnpm gen:services)`)
    if (!docs.includes(`\`${action}\``)) problems.push(`${action}: tidak terdokumentasi di docs/api-contract.md`)
  }
}

if (problems.length) {
  console.error(`Kontrak tidak lengkap (${problems.length}):\n- ${problems.join("\n- ")}`)
  process.exit(1)
}
console.log(`Kontrak lengkap: ${total} aksi punya implementasi http dan dokumentasi.`)
