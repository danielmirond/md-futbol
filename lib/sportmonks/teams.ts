import { smFetch } from './client'
import type { SmTeam } from './types'

export interface SmTeamDetail extends SmTeam {
  venue_id: number | null
  venue?: {
    id: number
    name: string
    city_name: string
    capacity: number
    image_path: string | null
    surface: string | null
  }
  country?: { name: string; image_path: string | null; fifa_name: string }
  coaches?: SmCoach[]
  statistics?: any[]
}

export interface SmCoach {
  id: number
  name: string
  common_name: string
  image_path: string | null
  nationality_id: number
}

export interface SmPlayer {
  id: number
  name: string
  common_name: string
  display_name: string
  firstname: string
  lastname: string
  image_path: string | null
  position_id: number | null
  nationality_id: number | null
  date_of_birth: string | null
  height: number | null
  weight: number | null
}

export interface SmSquadEntry {
  id: number
  team_id: number
  player_id: number
  position_id: number | null
  jersey_number: number | null
  captain: boolean | null
  player?: SmPlayer
}

export async function getTeam(id: number): Promise<SmTeamDetail | null> {
  try {
    const res = await smFetch<{ data: SmTeamDetail }>(`/teams/${id}`, {
      include: 'country;venue',
      revalidate: 3600,
    })
    return res.data
  } catch {
    return null
  }
}

export async function getTeamSquad(teamId: number): Promise<SmSquadEntry[]> {
  try {
    const res = await smFetch<{ data: SmSquadEntry[] }>(`/squads/teams/${teamId}`, {
      include: 'player',
      per_page: 50,
      revalidate: 3600,
    })
    return res.data
  } catch {
    return []
  }
}

export async function getTeamFixtures(teamId: number): Promise<any[]> {
  try {
    const res = await smFetch<{ data: any[] }>(
      `/fixtures?filters=fixtureParticipants:${teamId}`,
      {
        include: 'participants;scores;league;state',
        per_page: 10,
        revalidate: 300,
      },
    )
    return res.data
  } catch {
    return []
  }
}
