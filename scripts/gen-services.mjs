// Membuat services/http.ts dan docs/api-contract.md dari services/contract.ts tiap fitur.
// Pakai: pnpm gen:services   (jalankan ulang setiap kali contract.ts berubah)
import fs from "node:fs"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
const featuresDir = path.join(root, "src/features")
const READ = /^(list|get|find|search|history|me|todaySummary|dashboard|report(?![A-Za-z])|exportRows)/

/** Memecah daftar parameter pada koma tingkat atas (abaikan koma di dalam <>, {}, [], ()). */
function splitTop(s) {
  const out = []
  let depth = 0, cur = ""
  for (const ch of s) {
    if ("<{[(".includes(ch)) depth++
    if (">}])".includes(ch)) depth--
    if (ch === "," && depth === 0) { out.push(cur); cur = "" } else cur += ch
  }
  if (cur.trim()) out.push(cur)
  return out.map((x) => x.trim()).filter(Boolean)
}

function parseContract(src) {
  const m = src.match(/export interface (\w+) \{([\s\S]*)\n\}/)
  if (!m) return null
  const [, iface, body] = m
  const methods = []
  const re = /((?:\s*\/\*\*[\s\S]*?\*\/)?)\s*(\w+)\(([\s\S]*?)\):\s*Promise<([\s\S]*?)>\s*(?=\n\s*(?:\/\*\*|\/\/|\w+\(|\n|$)|\s*$)/g
  let x
  while ((x = re.exec(body))) {
    const doc = x[1].replace(/\/\*\*|\*\//g, "").replace(/^\s*\*\s?/gm, "").trim().replace(/\s+/g, " ")
    const params = splitTop(x[3]).map((p) => {
      const [name, ...type] = p.split(":")
      return { name: name.replace("?", "").trim(), optional: name.includes("?"), type: type.join(":").trim() }
    })
    methods.push({ name: x[2], doc, params, returns: x[4].trim().replace(/\s+/g, " ") })
  }
  return { iface, imports: src.match(/^import[\s\S]*?from .*$/gm) ?? [], methods }
}

const docs = []
for (const feature of fs.readdirSync(featuresDir).sort()) {
  const file = path.join(featuresDir, feature, "services/contract.ts")
  if (!fs.existsSync(file)) continue
  const parsed = parseContract(fs.readFileSync(file, "utf8"))
  if (!parsed || parsed.methods.length === 0) continue
  const { iface, methods } = parsed
  const domain = feature
  const lines = methods.map((m) => {
    const args = m.params.map((p) => p.name).join(", ")
    const payload = m.params.length ? `{ ${args} }` : "{}"
    const opt = READ.test(m.name) ? ", { read: true }" : ""
    return `  ${m.name}: (${args}) => call("${domain}", "${domain}.${m.name}", ${payload}${opt}),`
  })
  const content = `// Dibuat oleh scripts/gen-services.mjs dari contract.ts. Jangan diubah tangan.
import { call } from "@/shared/api"
import type { ${iface} } from "./contract"

export const http${iface}: ${iface} = {
${lines.join("\n")}
}
`
  fs.writeFileSync(path.join(featuresDir, feature, "services/http.ts"), content)
  docs.push({ feature, iface, methods })
}

const table = docs
  .map(({ feature, iface, methods }) => {
    const rows = methods
      .map((m) => {
        const input = m.params.map((p) => `\`${p.name}${p.optional ? "?" : ""}: ${p.type}\``).join(", ") || "-"
        return `| \`${feature}.${m.name}\` | ${input} | \`${m.returns}\` | ${READ.test(m.name) ? "baca" : "ubah"} | ${m.doc || "-"} |`
      })
      .join("\n")
    return `## ${feature}\n\nAntarmuka: \`${iface}\`\n\n| Aksi | Input | Output | Jenis | Catatan |\n|---|---|---|---|---|\n${rows}`
  })
  .join("\n\n")

const header = fs.readFileSync(path.join(root, "docs/api-contract.header.md"), "utf8")
fs.writeFileSync(path.join(root, "docs/api-contract.md"), `${header}\n\n${table}\n`)
console.log(`Dibuat: ${docs.length} adapter http dan docs/api-contract.md`)
