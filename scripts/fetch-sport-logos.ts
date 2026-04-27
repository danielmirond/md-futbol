/**
 * Build-time logo fetcher for the multi-sport hub.
 *
 * For each sport in the registry, tries a cascade of candidate URLs and
 * downloads the first one that responds 200 to public/sports/{slug}.png.
 *
 * Run with:  npx tsx scripts/fetch-sport-logos.ts
 *
 * Re-running is safe — existing files are overwritten only if the new
 * download succeeds. Slugs that fail every candidate are left untouched.
 */
import { writeFile, mkdir, stat } from 'node:fs/promises'
import { join } from 'node:path'

interface Candidate {
  url: string
  source: string
}

const ESPN = (slug: string) => `https://a.espncdn.com/i/teamlogos/leagues/500/${slug}.png`
const ESPN_DARK = (slug: string) => `https://a.espncdn.com/i/teamlogos/leagues/500-dark/${slug}.png`
const ESPN_DEFAULT = (slug: string) => `https://a.espncdn.com/i/teamlogos/leagues/500-default/${slug}.png`

// Per-slug candidate URLs. First match wins.
const CANDIDATES: Record<string, Candidate[]> = {
  nba: [{ url: ESPN('nba'), source: 'espn' }],
  wnba: [{ url: ESPN('wnba'), source: 'espn' }],
  euroliga: [
    { url: ESPN('euroleague'), source: 'espn' },
    { url: ESPN_DARK('euroleague'), source: 'espn-dark' },
    { url: 'https://upload.wikimedia.org/wikipedia/en/4/45/Euroleague_Basketball_logo.svg', source: 'wikipedia' },
  ],
  nfl: [{ url: ESPN('nfl'), source: 'espn' }],
  'college-football': [
    { url: ESPN('ncaa'), source: 'espn' },
    { url: ESPN_DARK('ncaa'), source: 'espn-dark' },
    { url: 'https://a.espncdn.com/i/teamlogos/leagues/500/ncaa-fb.png', source: 'espn-fb' },
  ],
  mlb: [{ url: ESPN('mlb'), source: 'espn' }],
  nhl: [{ url: ESPN('nhl'), source: 'espn' }],
  atp: [
    { url: ESPN('atp'), source: 'espn' },
    { url: ESPN_DARK('atp'), source: 'espn-dark' },
    { url: ESPN_DEFAULT('atp'), source: 'espn-default' },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/ATP_Tour_logo.svg', source: 'wikipedia' },
  ],
  wta: [
    { url: ESPN('wta'), source: 'espn' },
    { url: ESPN_DARK('wta'), source: 'espn-dark' },
    { url: 'https://upload.wikimedia.org/wikipedia/en/d/d7/WTA_Tour_logo_2020.svg', source: 'wikipedia' },
  ],
  f1: [{ url: ESPN('f1'), source: 'espn' }],
  nascar: [
    { url: ESPN('nascar-premier'), source: 'espn-premier' },
    { url: ESPN('nascar'), source: 'espn' },
    { url: ESPN_DARK('nascar-premier'), source: 'espn-dark' },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/NASCAR_logo.svg', source: 'wikipedia' },
  ],
  pga: [
    { url: ESPN('pga'), source: 'espn' },
    { url: ESPN_DARK('pga'), source: 'espn-dark' },
    { url: 'https://upload.wikimedia.org/wikipedia/en/9/9a/PGA_Tour_logo.svg', source: 'wikipedia' },
  ],
  lpga: [{ url: ESPN('lpga'), source: 'espn' }],
  ufc: [{ url: ESPN('ufc'), source: 'espn' }],
}

const PUBLIC_DIR = join(process.cwd(), 'public', 'sports')

async function ensureDir(p: string) {
  try {
    await stat(p)
  } catch {
    await mkdir(p, { recursive: true })
  }
}

async function tryDownload(slug: string, candidates: Candidate[]): Promise<{ source: string; ext: string } | null> {
  for (const c of candidates) {
    try {
      const res = await fetch(c.url, { redirect: 'follow' })
      if (!res.ok) continue
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.byteLength < 200) continue // too small, probably an error placeholder
      const ext = c.url.endsWith('.svg') ? 'svg' : 'png'
      const dest = join(PUBLIC_DIR, `${slug}.${ext}`)
      await writeFile(dest, buf)
      return { source: c.source, ext }
    } catch {
      continue
    }
  }
  return null
}

async function main() {
  await ensureDir(PUBLIC_DIR)
  const summary: Array<{ slug: string; status: 'ok' | 'missing'; source?: string; ext?: string }> = []

  for (const [slug, candidates] of Object.entries(CANDIDATES)) {
    const result = await tryDownload(slug, candidates)
    if (result) {
      summary.push({ slug, status: 'ok', source: result.source, ext: result.ext })
      console.log(`  ✓ ${slug.padEnd(20)} ${result.source} (.${result.ext})`)
    } else {
      summary.push({ slug, status: 'missing' })
      console.log(`  ✗ ${slug.padEnd(20)} (todas las fuentes fallaron)`)
    }
  }

  const ok = summary.filter((s) => s.status === 'ok').length
  console.log(`\nResumen: ${ok}/${summary.length} logos descargados a public/sports/`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
