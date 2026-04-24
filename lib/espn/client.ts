/**
 * ESPN public API client.
 *
 * Undocumented but stable endpoints used by ESPN's own apps. No API key.
 * Base: http://site.api.espn.com/apis/site/v2/sports/{sport}/{league}/...
 *
 * Notes:
 *  - All responses are JSON. Some endpoints return { events: [...] } (scoreboards),
 *    others return { children: [...] } (standings), others { athletes: [...] } (rankings).
 *  - Data cadence varies per sport. Live games update ~every 15-30s.
 *  - If ESPN is unreachable, callers should degrade gracefully.
 */

const BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports'
const CORE_URL = 'https://sports.core.api.espn.com/v2/sports'

export interface EspnFetchOpts {
  /** ESPN-side query params (limit, dates, season, seasontype, etc.) */
  query?: Record<string, string | number | undefined>
  /** Next.js ISR revalidate window in seconds */
  revalidate?: number
}

async function fetchJson<T>(url: string, revalidate: number): Promise<T> {
  const res = await fetch(url, {
    next: { revalidate },
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) {
    throw new Error(`ESPN ${res.status}: ${url}`)
  }
  return res.json()
}

/** Site API: scoreboards, standings, teams, news, athletes. */
export async function espnFetch<T = any>(path: string, opts: EspnFetchOpts = {}): Promise<T> {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(opts.query || {})) {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v))
  }
  const qs = params.toString()
  const url = `${BASE_URL}${path}${qs ? `?${qs}` : ''}`
  return fetchJson<T>(url, opts.revalidate ?? 60)
}

/** Core API: richer data (event details, athletes, statistics per game). Heavier. */
export async function espnCore<T = any>(path: string, opts: EspnFetchOpts = {}): Promise<T> {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(opts.query || {})) {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v))
  }
  const qs = params.toString()
  const url = `${CORE_URL}${path}${qs ? `?${qs}` : ''}`
  return fetchJson<T>(url, opts.revalidate ?? 60)
}
