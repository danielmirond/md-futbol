import { espnFetch } from './client'
import type { EspnAthlete } from './types'

export interface TennisRankingEntry {
  rank: number
  previousRank?: number
  points?: number
  movement?: number
  athlete?: EspnAthlete
}

/** Fetch ATP/WTA world rankings. Returns the first page (top 100). */
export async function getTennisRankings(
  tour: 'atp' | 'wta',
): Promise<TennisRankingEntry[]> {
  try {
    const res = await espnFetch<any>(`/tennis/${tour}/rankings`, { revalidate: 86400 })
    // ESPN returns { rankings: [ { athletes:[{athlete, rank, ...}] } ] }
    const firstRanking = res?.rankings?.[0]
    const rows: any[] = firstRanking?.athletes || firstRanking?.rows || []
    return rows.map((r: any, i: number) => ({
      rank: r.current ?? r.rank ?? i + 1,
      previousRank: r.previous,
      points: r.points ?? r.rankingPoints,
      movement: r.movement ?? r.trend,
      athlete: r.athlete,
    }))
  } catch {
    return []
  }
}

export interface GolfLeaderboardEntry {
  position: string
  athlete?: EspnAthlete
  score?: string
  today?: string
  thru?: string
  totalStrokes?: string
}

export async function getGolfLeaderboard(
  tour: 'pga' | 'lpga',
): Promise<{ tournamentName: string | null; entries: GolfLeaderboardEntry[] }> {
  try {
    const res = await espnFetch<any>(`/golf/${tour}/leaderboard`, { revalidate: 300 })
    const event = res?.events?.[0]
    const competitors: any[] = event?.competitions?.[0]?.competitors || []
    return {
      tournamentName: event?.name || null,
      entries: competitors.slice(0, 60).map((c: any) => ({
        position: c.status?.position?.displayName || c.status?.position?.id || '-',
        athlete: c.athlete,
        score: c.score?.displayValue ?? c.status?.displayValue,
        today: c.status?.displayValue,
        thru: c.status?.thru ? String(c.status.thru) : undefined,
        totalStrokes: c.linescores?.reduce((s: number, l: any) => s + (l.value || 0), 0) + '' || undefined,
      })),
    }
  } catch {
    return { tournamentName: null, entries: [] }
  }
}

export interface RacingScheduleItem {
  id: string
  name: string
  date: string
  venue?: string
  status?: string
}

export async function getRacingSchedule(
  series: string, // 'f1' | 'nascar-premier'
): Promise<RacingScheduleItem[]> {
  try {
    const res = await espnFetch<any>(`/racing/${series}/scoreboard`, { revalidate: 600 })
    const events: any[] = res?.events || []
    return events.map((e) => ({
      id: String(e.id),
      name: e.name || e.shortName,
      date: e.date,
      venue: e.competitions?.[0]?.venue?.fullName,
      status: e.status?.type?.description,
    }))
  } catch {
    return []
  }
}

export interface RacingStandingEntry {
  position: number
  athleteOrTeam: string
  points: number
  image?: string
}

/** Drivers standings for F1 (or constructors if level=2). */
export async function getRacingStandings(
  series: string,
  level: number = 1,
): Promise<RacingStandingEntry[]> {
  try {
    const res = await espnFetch<any>(`/racing/${series}/standings`, {
      query: { level },
      revalidate: 3600,
    })
    const entries: any[] = res?.standings?.entries || res?.children?.[0]?.standings?.entries || []
    return entries.map((e: any, i: number) => {
      const pointsStat =
        e.stats?.find((s: any) => s.type === 'points' || s.abbreviation === 'PTS') ||
        e.stats?.[0]
      const athleteName = e.athlete?.displayName || e.team?.displayName || ''
      return {
        position: e.status?.position || i + 1,
        athleteOrTeam: athleteName,
        points: parseInt(pointsStat?.displayValue || '0', 10) || 0,
        image: e.athlete?.headshot?.href || e.team?.logos?.[0]?.href,
      }
    })
  } catch {
    return []
  }
}

export interface MmaEvent {
  id: string
  name: string
  shortName?: string
  date: string
  venue?: string
  statusState?: string
  fights: Array<{
    name: string
    date: string
    status?: string
    fighters: Array<{ name: string; image?: string; winner?: boolean }>
  }>
}

export async function getMmaEvents(promotion: string = 'ufc'): Promise<MmaEvent[]> {
  try {
    const res = await espnFetch<any>(`/mma/${promotion}/scoreboard`, { revalidate: 600 })
    const events: any[] = res?.events || []
    return events.map((e: any) => ({
      id: String(e.id),
      name: e.name,
      shortName: e.shortName,
      date: e.date,
      venue: e.competitions?.[0]?.venue?.fullName,
      statusState: e.status?.type?.state,
      fights: (e.competitions || []).map((c: any) => ({
        name: c.type?.text || 'Combate',
        date: c.date,
        status: c.status?.type?.shortDetail,
        fighters: (c.competitors || []).map((f: any) => ({
          name: f.athlete?.displayName || f.name || '',
          image: f.athlete?.headshot?.href,
          winner: f.winner,
        })),
      })),
    }))
  } catch {
    return []
  }
}
