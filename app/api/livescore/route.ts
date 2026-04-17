import { NextResponse } from 'next/server'
import { smFetch } from '@/lib/sportmonks/client'

export const runtime = 'nodejs'
export const revalidate = 10

interface LiveMatch {
  id: number
  leagueName: string
  leagueId: number
  leagueImage: string | null
  homeId: number
  homeName: string
  homeImage: string | null
  awayId: number
  awayName: string
  awayImage: string | null
  homeScore: number | null
  awayScore: number | null
  minute: string | null
  state: string
  stateDevName: string
}

function extractMatch(f: any): LiveMatch | null {
  const home = f.participants?.find((p: any) => p.meta?.location === 'home')
  const away = f.participants?.find((p: any) => p.meta?.location === 'away')
  if (!home || !away) return null

  const homeScore = f.scores?.find(
    (s: any) => s.score?.participant === 'home' && s.description === 'CURRENT',
  )?.score.goals ?? null
  const awayScore = f.scores?.find(
    (s: any) => s.score?.participant === 'away' && s.description === 'CURRENT',
  )?.score.goals ?? null

  // Try to extract the minute from periods or state
  const periods = f.periods as any[] | undefined
  let minute: string | null = null
  if (periods) {
    const active = periods.find((p) => p.ticking)
    if (active) {
      minute = active.minutes != null ? `${active.minutes}'` : null
    }
  }

  return {
    id: f.id,
    leagueName: f.league?.name || '',
    leagueId: f.league_id,
    leagueImage: f.league?.image_path || null,
    homeId: home.id,
    homeName: home.name,
    homeImage: home.image_path || null,
    awayId: away.id,
    awayName: away.name,
    awayImage: away.image_path || null,
    homeScore,
    awayScore,
    minute: minute || f.state?.short_name || null,
    state: f.state?.short_name || 'LIVE',
    stateDevName: f.state?.developer_name || 'INPLAY',
  }
}

export async function GET() {
  try {
    // Primary: livescores/inplay endpoint
    let fixtures: any[] = []
    try {
      const res = await smFetch<{ data: any[] }>(`/livescores/inplay`, {
        include: 'participants;scores;league;state;periods',
        per_page: 30,
        revalidate: 10,
      })
      fixtures = res.data || []
    } catch {
      // Fallback: today's fixtures filtered to live states
      const today = new Date().toISOString().split('T')[0]
      const res = await smFetch<{ data: any[] }>(`/fixtures/date/${today}`, {
        include: 'participants;scores;league;state;periods',
        per_page: 50,
        revalidate: 10,
      })
      fixtures = (res.data || []).filter((f: any) => {
        const dn = f.state?.developer_name || ''
        return dn.includes('INPLAY') || dn === 'LIVE' || dn === 'HT'
      })
    }

    const matches = fixtures
      .map(extractMatch)
      .filter((m): m is LiveMatch => m !== null)
      // Sort by league (featured first) then by score total desc
      .sort((a, b) => {
        const scoreA = (a.homeScore || 0) + (a.awayScore || 0)
        const scoreB = (b.homeScore || 0) + (b.awayScore || 0)
        return scoreB - scoreA
      })

    return NextResponse.json({ matches, count: matches.length, at: Date.now() })
  } catch (err) {
    return NextResponse.json({ matches: [], count: 0, at: Date.now(), error: (err as Error).message })
  }
}
