import { espnFetch } from './client'
import type { EspnStandingsResponse, EspnStandingsEntry, EspnStandingsGroup } from './types'

/** Fetch standings for a sport/league. Returns raw nested structure (some sports group by conference/division). */
export async function getStandings(
  sportPath: string,
  opts: { season?: number; level?: number; revalidate?: number } = {},
): Promise<EspnStandingsResponse> {
  return espnFetch<EspnStandingsResponse>(`/${sportPath}/standings`, {
    query: { season: opts.season, level: opts.level },
    revalidate: opts.revalidate ?? 600,
  })
}

/** Walk the group tree and return every leaf (innermost) standings table with a label. */
export function flattenStandings(
  resp: EspnStandingsResponse,
): Array<{ label: string; entries: EspnStandingsEntry[] }> {
  const out: Array<{ label: string; entries: EspnStandingsEntry[] }> = []
  if (resp.standings?.entries?.length) {
    out.push({ label: resp.name || 'General', entries: resp.standings.entries })
  }
  const walk = (groups: EspnStandingsGroup[] | undefined, parentLabel: string) => {
    for (const g of groups || []) {
      const label = [parentLabel, g.name].filter(Boolean).join(' · ')
      if (g.standings?.entries?.length) {
        out.push({ label: label || g.name || 'Grupo', entries: g.standings.entries })
      }
      if (g.children?.length) walk(g.children, label)
    }
  }
  walk(resp.children, resp.name || '')
  return out
}

/** Pick a stat by `abbreviation` or `type` from an entry. */
export function statBy(entry: EspnStandingsEntry, keys: string[]): string | undefined {
  for (const k of keys) {
    const s = entry.stats?.find(
      (x) => x.abbreviation === k || x.type === k || x.name === k || x.shortDisplayName === k,
    )
    if (s?.displayValue !== undefined) return s.displayValue
  }
  return undefined
}
