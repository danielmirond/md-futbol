import { NextRequest, NextResponse } from 'next/server'
import { getTeamFixtures } from '@/lib/sportmonks/teams'
import { getFixturesByLeague } from '@/lib/sportmonks/fixtures'
import { getCurrentSeasonByLeague, getStandingsBySeason } from '@/lib/sportmonks/standings'
import { getTopScorersBySeason } from '@/lib/sportmonks/players'
import type { SmFixture } from '@/lib/sportmonks/types'

export const revalidate = 60

function parseIds(raw: string | null): number[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((s) => parseInt(s, 10))
    .filter((n) => !isNaN(n) && n > 0)
    .slice(0, 10) // safety cap
}

export async function GET(req: NextRequest) {
  const teamIds = parseIds(req.nextUrl.searchParams.get('teams'))
  const leagueIds = parseIds(req.nextUrl.searchParams.get('leagues'))

  if (teamIds.length === 0 && leagueIds.length === 0) {
    return NextResponse.json({ upcoming: [], standings: null, topScorers: [], primaryLeague: null })
  }

  const now = Date.now()

  // Gather fixtures from teams + leagues
  const teamFixtures = await Promise.all(teamIds.map((id) => getTeamFixtures(id).catch(() => [] as SmFixture[])))
  const leagueFixtures = await Promise.all(leagueIds.map((id) => getFixturesByLeague(id).catch(() => [] as SmFixture[])))

  const all = [...teamFixtures.flat(), ...leagueFixtures.flat()]
  const dedupe = new Map<number, SmFixture>()
  for (const f of all) dedupe.set(f.id, f)
  const merged = Array.from(dedupe.values())

  const upcoming = merged
    .filter((f) => {
      const t = new Date(f.starting_at).getTime()
      return t >= now - 2 * 3600_000
    })
    .sort((a, b) => a.starting_at.localeCompare(b.starting_at))
    .slice(0, 8)

  // Primary league = first favorite league OR first league from favorite team's fixtures
  let primaryLeagueId: number | null = leagueIds[0] || null
  if (!primaryLeagueId && teamFixtures[0]?.[0]) {
    primaryLeagueId = teamFixtures[0][0].league_id
  }

  let standings = null
  let topScorers: any[] = []
  let primaryLeague = null

  if (primaryLeagueId) {
    const seasonId = await getCurrentSeasonByLeague(primaryLeagueId).catch(() => null)
    if (seasonId) {
      const [st, sc] = await Promise.all([
        getStandingsBySeason(seasonId).catch(() => []),
        getTopScorersBySeason(seasonId).catch(() => []),
      ])
      // Find league info from upcoming fixtures if available
      const lf = merged.find((f) => f.league_id === primaryLeagueId)
      primaryLeague = {
        id: primaryLeagueId,
        name: lf?.league?.name || null,
        image_path: lf?.league?.image_path || null,
      }
      standings = [...st].sort((a, b) => (a.position || 99) - (b.position || 99)).slice(0, 8)
      topScorers = sc.slice(0, 5)
    }
  }

  return NextResponse.json({ upcoming, standings, topScorers, primaryLeague })
}
