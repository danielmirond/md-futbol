import { smFetch } from './client'
import type { SmLeague } from './types'

export async function getLeagues(): Promise<SmLeague[]> {
  const res = await smFetch<{ data: SmLeague[] }>('/leagues', {
    per_page: 100,
    revalidate: 3600,
  })
  return res.data
}

// Featured competitions we want to highlight on the home
export const FEATURED_LEAGUE_IDS = [
  2,     // Champions League
  5,     // Europa League
  564,   // La Liga
  567,   // La Liga 2
  8,     // Premier League
  82,    // Bundesliga
  384,   // Serie A
  301,   // Ligue 1
  486,   // Copa del Rey
  462,   // Liga Portugal
]

export async function getFeaturedLeagues(): Promise<SmLeague[]> {
  const leagues = await getLeagues()
  const byId = new Map(leagues.map((l) => [l.id, l]))
  return FEATURED_LEAGUE_IDS.map((id) => byId.get(id)).filter(Boolean) as SmLeague[]
}

export async function getLeague(id: number): Promise<SmLeague | null> {
  try {
    const res = await smFetch<{ data: SmLeague }>(`/leagues/${id}`, { revalidate: 3600 })
    return res.data
  } catch {
    return null
  }
}
