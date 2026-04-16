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
