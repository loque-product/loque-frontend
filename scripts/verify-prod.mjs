// Memuat hasil build produksi di Chromium sungguhan pada beberapa base path dan gagal bila ada
// galat konsol. Tanpa backend, rute yang dilindungi mengarah ke /masuk; itu sudah cukup untuk
// menangkap masalah urutan modul dan jalur aset yang tidak terlihat di uji unit.
// Pakai: pnpm verify:prod   (butuh Chromium; atur CHROMIUM_PATH bila bukan /usr/bin/chromium)
import { execFileSync } from "node:child_process"
import fs from "node:fs"
import http from "node:http"
import os from "node:os"
import path from "node:path"
import puppeteer from "puppeteer-core"

const chromium = process.env.CHROMIUM_PATH || "/usr/bin/chromium"
const types = { ".js": "text/javascript", ".css": "text/css", ".html": "text/html", ".svg": "image/svg+xml" }
const CASES = [
  { label: "root", base: "/" },
  { label: "subpath", base: "/app/" },
]
const ROUTES = ["/", "/masuk"]

function serve(dir, prefix) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const p = decodeURIComponent(req.url.split("?")[0])
      if (prefix !== "/" && !p.startsWith(prefix)) return void res.writeHead(404).end("nf")
      const rel = p.slice(prefix === "/" ? 1 : prefix.length).replace(/^\//, "")
      let f = path.join(dir, rel)
      // Fallback SPA: jalur tanpa berkas dikembalikan sebagai index.html.
      if (!rel || !fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(dir, "index.html")
      res.writeHead(200, { "content-type": types[path.extname(f)] || "application/octet-stream" })
      fs.createReadStream(f).pipe(res)
    })
    server.listen(0, () => resolve(server))
  })
}

let failed = false
const browser = await puppeteer.launch({ executablePath: chromium, headless: true, args: ["--no-sandbox", "--disable-gpu"] })
for (const c of CASES) {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), "loque-prod-"))
  const server = await serve(out, c.base)
  execFileSync("pnpm", ["exec", "vite", "build", "--outDir", out, "--emptyOutDir"], {
    env: { ...process.env, VITE_BASE_PATH: c.base, VITE_APP_ENV: "production" },
    stdio: "pipe",
  })
  const origin = `http://localhost:${server.address().port}${c.base === "/" ? "" : c.base.replace(/\/$/, "")}`
  for (const route of ROUTES) {
    const page = await browser.newPage()
    const errors = []
    page.on("pageerror", (e) => errors.push(String(e.message)))
    // Galat jaringan ke API (tidak ada backend) bukan kegagalan build.
    page.on("console", (m) => {
      if (m.type() === "error" && !/Failed to load resource|ERR_CONNECTION/.test(m.text())) errors.push(m.text())
    })
    await page.goto(`${origin}${route}`, { waitUntil: "networkidle0" })
    const rendered = await page.evaluate(() => (document.getElementById("root")?.innerHTML.length ?? 0) > 0)
    const ok = rendered && errors.length === 0
    if (!ok) failed = true
    console.log(`${ok ? "OK  " : "GAGAL"} ${c.label} ${route}${errors.length ? "\n  " + errors.join("\n  ") : ""}`)
    await page.close()
  }
  server.close()
  fs.rmSync(out, { recursive: true, force: true })
}
await browser.close()
process.exit(failed ? 1 : 0)
