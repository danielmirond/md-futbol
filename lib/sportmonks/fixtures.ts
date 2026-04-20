import { smFetch } from './client'
import type { SmFixture } from './types'

export async function getFixturesByDate(date: string): Promise<SmFixture[]> {
  const res = await smFetch<{ data: SmFixture[] }>(`/fixtures/date/${date}`, {
    include: 'participants;scores;league;state;round',
    per_page: 100,
    revalidate: 60,
  })
  return res.data
}

export async function getTodayFixtures(): Promise<SmFixture[]> {
  const today = new Date().toISOString().split('T')[0]
  return getFixturesByDate(today)
}

export async function getFixturesByLeague(leagueId: number, seasonId?: number): Promise<SmFixture[]> {
  const path = seasonId
    ? `/fixtures?filters=fixtureSeasons:${seasonId}`
    : `/fixtures?filters=fixtureLeagues:${leagueId}`

  const res = await smFetch<{ data: SmFixture[] }>(path, {
    include: 'participants;scores;league;state;round',
    per_page: 50,
    revalidate: 300,
  })
  return res.data
}

export async function getFixture(id: number): Promise<SmFixture | null> {
  try {
    const res = await smFetch<{ data: SmFixture }>(`/fixtures/${id}`, {
      include: 'participants;scores;league;state;round;venue;events.type;events.participant;lineups.player;statistics.type',
      revalidate: 60,
    })
    return res.data
  } catch {
    return null
  }
}

export async function getHeadToHead(team1Id: number, team2Id: number): Promise<SmFixture[]> {
  try {
    const res = await smFetch<{ data: SmFixture[] }>(
      `/fixtures/head-to-head/${team1Id}/${team2Id}`,
      {
        include: 'participants;scores;league;state',
        per_page: 10,
        revalidate: 3600,
      },
    )
    return res.data
  } catch {
    return []
  }
}

/**
 * Get fixtures across the next N days (inclusive from today).
 * Useful for upcoming-matches widgets.
 */
export async function getUpcomingFixturesAcrossDays(days: number = 3): Promise<SmFixture[]> {
  const now = new Date()
  const results: SmFixture[] = []
  for (let i = 0; i < days; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() + i)
    const iso = d.toISOString().split('T')[0]
    try {
      const fs = await getFixturesByDate(iso)
      results.push(...fs)
    } catch {
      // continue
    }
  }
  // Filter future-only (remove already started today)
  const future = results.filter((f) => new Date(f.starting_at).getTime() >= now.getTime() - 2 * 3600_000)
  return future.sort((a, b) => a.starting_at.localeCompare(b.starting_at))
}

export async function getLiveFixtures(): Promise<SmFixture[]> {
  try {
    const res = await smFetch<{ data: SmFixture[] }>(`/livescores/inplay`, {
      include: 'participants;scores;league;state;round',
      per_page: 50,
      revalidate: 15,
    })
    return res.data
  } catch {
    return []
  }
}
