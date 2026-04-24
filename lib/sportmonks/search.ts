import { smFetch } from './client'

export interface SearchTeam {
  id: number
  name: string
  image_path: string | null
  country_id?: number
}
export interface SearchPlayer {
  id: number
  name: string
  display_name?: string
  image_path: string | null
}
export interface SearchLeague {
  id: number
  name: string
  image_path: string | null
  short_code: string | null
}
export interface SearchResults {
  teams: SearchTeam[]
  players: SearchPlayer[]
  leagues: SearchLeague[]
}

export async function searchAll(query: string, limit: number = 20): Promise<SearchResults> {
  const q = query.trim()
  if (!q || q.length < 2) return { teams: [], players: [], leagues: [] }
  const encoded = encodeURIComponent(q)

  const [teamsRes, playersRes, leaguesRes] = await Promise.all([
    smFetch<{ data: any[] }>(`/teams/search/${encoded}`, { per_page: limit, revalidate: 300 }).catch(() => ({ data: [] })),
    smFetch<{ data: any[] }>(`/players/search/${encoded}`, { per_page: limit, revalidate: 300 }).catch(() => ({ data: [] })),
    smFetch<{ data: any[] }>(`/leagues/search/${encoded}`, { per_page: limit, revalidate: 300 }).catch(() => ({ data: [] })),
  ])

  return {
    teams: teamsRes.data.map((t: any) => ({
      id: t.id,
      name: t.name,
      image_path: t.image_path,
      country_id: t.country_id,
    })),
    players: playersRes.data.map((p: any) => ({
      id: p.id,
      name: p.display_name || p.name,
      display_name: p.display_name,
      image_path: p.image_path,
    })),
    leagues: leaguesRes.data.map((l: any) => ({
      id: l.id,
      name: l.name,
      image_path: l.image_path,
      short_code: l.short_code,
    })),
  }
}
