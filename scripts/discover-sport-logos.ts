/**
 * Fallback discovery: query ESPN scoreboard endpoints to extract logo hrefs
 * for sports whose direct CDN path didn't work.
 */
import { writeFile, mkdir, stat } from 'node:fs/promises'
import { join } from 'node:path'

const TARGETS: Array<{ slug: string; espnPath: string }> = [
  { slug: 'euroliga', espnPath: 'basketball/euroleague' },
  { slug: 'college-football', espnPath: 'football/college-football' },
  { slug: 'atp', espnPath: 'tennis/atp' },
  { slug: 'wta', espnPath: 'tennis/wta' },
  { slug: 'nascar', espnPath: 'racing/nascar-premier' },
  { slug: 'pga', espnPath: 'golf/pga' },
]

const PUBLIC_DIR = join(process.cwd(), 'public', 'sports')

async function ensureDir(p: string) {
  try { await stat(p) } catch { await mkdir(p, { recursive: true }) }
}

async function discover(slug: string, espnPath: string) {
  // Try multiple ESPN endpoints to dig out a logo href
  const endpoints = [
    `https://site.api.espn.com/apis/site/v2/sports/${espnPath}/scoreboard`,
    `https://site.api.espn.com/apis/site/v2/sports/${espnPath}/standings`,
    `https://site.api.espn.com/apis/site/v2/sports/${espnPath}/leaders`,
    `https://site.api.espn.com/apis/site/v2/sports/${espnPath}/news`,
  ]

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep)
      if (!res.ok) continue
      const json: any = await res.json()
      const logos = json.leagues?.[0]?.logos || json.league?.logos || []
      const href = (logos.find((l: any) => (l.rel || []).includes('full')) || logos[0])?.href
      if (href) return { logoUrl: href, foundIn: ep.split('/').slice(-1)[0] }
    } catch {
      continue
    }
  }
  return null
}

async function download(url: string, slug: string): Promise<string | null> {
  try {
    const res = await fetch(url, { redirect: 'follow' })
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.byteLength < 200) return null
    const ext = url.endsWith('.svg') ? 'svg' : 'png'
    const dest = join(PUBLIC_DIR, `${slug}.${ext}`)
    await writeFile(dest, buf)
    return ext
  } catch {
    return null
  }
}

async function main() {
  await ensureDir(PUBLIC_DIR)
  for (const t of TARGETS) {
    const found = await discover(t.slug, t.espnPath)
    if (!found) {
      console.log(`  ✗ ${t.slug.padEnd(20)} (sin logo en API ESPN)`)
      continue
    }
    const ext = await download(found.logoUrl, t.slug)
    if (ext) {
      console.log(`  ✓ ${t.slug.padEnd(20)} ${found.foundIn} → ${found.logoUrl.slice(-50)} (.${ext})`)
    } else {
      console.log(`  ✗ ${t.slug.padEnd(20)} URL hallada pero descarga falló: ${found.logoUrl}`)
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
