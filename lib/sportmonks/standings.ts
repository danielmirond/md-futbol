import { smFetch } from './client'
import type { SmStandingRow } from './types'

export async function getStandingsBySeason(seasonId: number): Promise<SmStandingRow[]> {
  const res = await smFetch<{ data: SmStandingRow[] }>(
    `/standings/seasons/${seasonId}`,
    {
      include: 'participant;details.type;form',
      per_page: 50,
      revalidate: 600,
    },
  )
  return res.data
}

export async function getCurrentSeasonByLeague(leagueId: number): Promise<number | null> {
  try {
    const res = await smFetch<{ data: { id: number; league_id: number }[] }>(
      `/seasons?filters=seasonLeagues:${leagueId}&filters=seasonIsCurrent:true`,
      { per_page: 1, revalidate: 3600 },
    )
    return res.data[0]?.id || null
  } catch {
    return null
  }
}
