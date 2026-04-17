import { NextResponse } from 'next/server'
import { smFetch } from '@/lib/sportmonks/client'
import { getCurrentSeasonByLeague } from '@/lib/sportmonks/standings'

export const runtime = 'nodejs'
export const revalidate = 3600

/**
 * Aggregates goals per minute (0-90+) across all fixtures of the
 * current season for a given league. Useful for a heatmap showing
 * when goals tend to happen.
 */
export async function GET(_req: Request, { params }: { params: { leagueId: string } }) {
  try {
    const leagueId = parseInt(params.leagueId, 10)
    if (isNaN(leagueId)) {
      return NextResponse.json({ error: 'Invalid leagueId' }, { status: 400 })
    }

    const seasonId = await getCurrentSeasonByLeague(leagueId)
    if (!seasonId) {
      return NextResponse.json({ error: 'No current season' }, { status: 404 })
    }

    // Get all fixtures of the season — only finished
    const res = await smFetch<{ data: any[] }>(
      `/fixtures?filters=fixtureSeasons:${seasonId}`,
      {
        include: 'events;state',
        per_page: 100,
        revalidate: 1800,
      },
    )

    const fixtures = res.data || []
    // Only finished matches
    const finished = fixtures.filter((f: any) => {
      const dn = f.state?.developer_name || ''
      return dn === 'FT' || dn === 'AET' || dn === 'AP'
    })

    // 91 buckets: 0-89, and 90 for extra time (90+)
    const bins = new Array(91).fill(0) as number[]
    let totalGoals = 0
    let processedFixtures = 0

    for (const f of finished) {
      const events = (f.events || []) as any[]
      for (const ev of events) {
        const tn: string = ev.type?.developer_name || ''
        const isGoal = tn.includes('GOAL') || ev.type_id === 14 || /goal/i.test(ev.addition || '')
        if (!isGoal) continue
        if (ev.minute == null) continue

        let m = ev.minute
        if (ev.extra_minute) m += ev.extra_minute
        if (m > 90) m = 90
        if (m < 0) m = 0

        bins[m]++
        totalGoals++
      }
      processedFixtures++
    }

    // Build 5-min buckets for chart: 18 buckets of 5 mins each (0-5, ..., 85-90)
    const buckets5: number[] = new Array(19).fill(0) // 19th bucket for 90+
    for (let i = 0; i < bins.length; i++) {
      const b = Math.min(18, Math.floor(i / 5))
      buckets5[b] += bins[i]
    }

    return NextResponse.json({
      leagueId,
      seasonId,
      totalGoals,
      processedFixtures,
      totalFixtures: fixtures.length,
      goalsPerMinute: bins,
      goalsPer5Min: buckets5,
      at: Date.now(),
    })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
