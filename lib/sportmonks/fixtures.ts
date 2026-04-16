import { smFetch } from './client'
import type { SmFixture } from './types'

export async function getFixturesByDate(date: string): Promise<SmFixture[]> {
  // date format: YYYY-MM-DD
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
      include: 'participants;scores;league;state;round;venue;events;lineups',
      revalidate: 60,
    })
    return res.data
  } catch {
    return null
  }
}
