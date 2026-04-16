import { smFetch } from './client'
import type { SmLeague } from './types'

export async function getLeagues(): Promise<SmLeague[]> {
  const res = await smFetch<{ data: SmLeague[] }>('/leagues', {
    per_page: 100,
    revalidate: 3600,
  })
  return res.data
}

// Leagues accessible to the current SportMonks subscription (Starter + Euro Club Tournaments)
export const FEATURED_LEAGUE_IDS = [
  564,   // La Liga (Starter — Spain default)
  567,   // La Liga 2
  2,     // Champions League
  5,     // Europa League
  2286,  // Europa Conference League
]

export async function getFeaturedLeagues(): Promise<SmLeague[]> {
  // Fetch only the featured leagues directly by id
  const results = await Promise.all(
    FEATURED_LEAGUE_IDS.map((id) =>
      smFetch<{ data: SmLeague }>(`/leagues/${id}`, { revalidate: 3600 }).catch(() => null),
    ),
  )
  return results.filter(Boolean).map((r) => (r as { data: SmLeague }).data)
}

export async function getLeague(id: number): Promise<SmLeague | null> {
  try {
    const res = await smFetch<{ data: SmLeague }>(`/leagues/${id}`, { revalidate: 3600 })
    return res.data
  } catch {
    return null
  }
}

/**
 * Returns true if the league is accessible to the current subscription.
 * Checks via seasons endpoint (cheap call).
 */
export async function isLeagueAccessible(id: number): Promise<boolean> {
  try {
    const res = await smFetch<{ data: any[] }>(`/seasons?filters=seasonLeagues:${id}`, {
      per_page: 1,
      revalidate: 3600,
    })
    return (res.data?.length || 0) > 0
  } catch {
    return false
  }
}
