import { smFetch } from './client'
import type { SmPlayer } from './teams'

export interface SmPlayerDetail extends SmPlayer {
  team_id?: number
  teams?: Array<{
    team_id: number
    team?: { id: number; name: string; image_path: string | null }
  }>
  country?: { name: string; image_path: string | null }
  position?: { name: string; developer_name: string }
}

export interface SmTopScorer {
  id: number
  season_id: number
  player_id: number
  type_id: number
  position: number
  total: number
  participant_id: number
  player?: SmPlayer
  participant?: {
    id: number
    name: string
    short_code: string | null
    image_path: string | null
  }
}

export async function getPlayer(id: number): Promise<SmPlayerDetail | null> {
  try {
    const res = await smFetch<{ data: SmPlayerDetail }>(`/players/${id}`, {
      include: 'country;position;teams.team',
      revalidate: 3600,
    })
    return res.data
  } catch {
    return null
  }
}

export async function getTopScorersBySeason(seasonId: number): Promise<SmTopScorer[]> {
  try {
    const res = await smFetch<{ data: SmTopScorer[] }>(`/topscorers/seasons/${seasonId}`, {
      include: 'player;participant',
      per_page: 30,
      revalidate: 600,
    })
    // Filter to just goals (type_id 83 is typically goal)
    return res.data.filter((t) => t.type_id === 83).slice(0, 15)
  } catch {
    return []
  }
}
