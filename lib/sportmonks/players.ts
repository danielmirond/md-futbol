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
  statistics?: SmPlayerStat[]
}

export interface SmPlayerStat {
  id: number
  player_id: number
  team_id: number
  season_id: number
  has_values: boolean
  jersey_number: number | null
  season?: {
    id: number
    name: string
    league_id: number
    is_current: boolean
  }
  details?: Array<{
    id: number
    type_id: number
    value: { total?: number; average?: number } | number
    type?: { id: number; name: string; developer_name: string }
  }>
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
      include: 'country;position;teams.team;statistics.details.type;statistics.season',
      revalidate: 3600,
    })
    return res.data
  } catch {
    return null
  }
}

/** Common SportMonks stat type developer_name values we render. */
export const PLAYER_STAT_KEYS = {
  GOALS: 'GOALS',
  ASSISTS: 'ASSISTS',
  APPEARANCES: 'APPEARANCES',
  MINUTES_PLAYED: 'MINUTES_PLAYED',
  YELLOWCARDS: 'YELLOWCARDS',
  REDCARDS: 'REDCARDS',
  SHOTS_TOTAL: 'SHOTS_TOTAL',
  SHOTS_ON_TARGET: 'SHOTS_ON_TARGET',
  PASSES: 'PASSES',
  KEY_PASSES: 'KEY_PASSES',
  TACKLES: 'TACKLES',
  INTERCEPTIONS: 'INTERCEPTIONS',
  SAVES: 'SAVES',
  CLEANSHEETS: 'CLEANSHEETS',
} as const

export function statValue(stat: SmPlayerStat, devName: string): number | null {
  const d = stat.details?.find((x) => x.type?.developer_name === devName)
  if (!d) return null
  const v = d.value
  if (typeof v === 'number') return v
  if (v && typeof v === 'object' && typeof v.total === 'number') return v.total
  return null
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
