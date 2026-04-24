import { espnFetch } from './client'
import type { EspnScoreboardResponse, EspnEvent } from './types'

/**
 * Fetch scoreboard for a given sport+league.
 * sportPath example: 'basketball/nba', 'football/nfl', 'soccer/esp.1'
 *
 * ESPN accepts YYYYMMDD dates (single day) or ranges YYYYMMDD-YYYYMMDD.
 */
export async function getScoreboard(
  sportPath: string,
  opts: { dates?: string; limit?: number; revalidate?: number } = {},
): Promise<EspnScoreboardResponse> {
  return espnFetch<EspnScoreboardResponse>(`/${sportPath}/scoreboard`, {
    query: { dates: opts.dates, limit: opts.limit },
    revalidate: opts.revalidate ?? 30,
  })
}

export function getEventScore(ev: EspnEvent): {
  homeTeam?: { id: string; name: string; abbr?: string; logo?: string; score?: string; winner?: boolean }
  awayTeam?: { id: string; name: string; abbr?: string; logo?: string; score?: string; winner?: boolean }
  statusState?: 'pre' | 'in' | 'post'
  statusDetail?: string
  statusShort?: string
} {
  const comp = ev.competitions?.[0]
  if (!comp) return {}
  const home = comp.competitors?.find((c) => c.homeAway === 'home')
  const away = comp.competitors?.find((c) => c.homeAway === 'away')

  return {
    homeTeam: home
      ? {
          id: home.id,
          name: home.team?.displayName || home.team?.name || '',
          abbr: home.team?.abbreviation,
          logo: home.team?.logo,
          score: home.score,
          winner: home.winner,
        }
      : undefined,
    awayTeam: away
      ? {
          id: away.id,
          name: away.team?.displayName || away.team?.name || '',
          abbr: away.team?.abbreviation,
          logo: away.team?.logo,
          score: away.score,
          winner: away.winner,
        }
      : undefined,
    statusState: ev.status?.type?.state || comp.status?.type?.state,
    statusDetail: ev.status?.type?.detail || comp.status?.type?.detail,
    statusShort: ev.status?.type?.shortDetail || comp.status?.type?.shortDetail,
  }
}

/** Partition events into live / finished / upcoming based on ESPN status.type.state. */
export function partitionEvents(events: EspnEvent[]) {
  const live: EspnEvent[] = []
  const upcoming: EspnEvent[] = []
  const finished: EspnEvent[] = []
  for (const ev of events) {
    const state = ev.status?.type?.state || ev.competitions?.[0]?.status?.type?.state
    if (state === 'in') live.push(ev)
    else if (state === 'post') finished.push(ev)
    else upcoming.push(ev)
  }
  return { live, upcoming, finished }
}
