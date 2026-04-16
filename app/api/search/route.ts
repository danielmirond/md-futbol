import { NextResponse } from 'next/server'
import { smFetch } from '@/lib/sportmonks/client'

export const runtime = 'edge'
export const revalidate = 300

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim()

  if (!query || query.length < 2) {
    return NextResponse.json({ teams: [], players: [], leagues: [] })
  }

  const encoded = encodeURIComponent(query)

  const [teamsRes, playersRes, leaguesRes] = await Promise.all([
    smFetch<{ data: any[] }>(`/teams/search/${encoded}`, { per_page: 8, revalidate: 300 }).catch(() => ({ data: [] })),
    smFetch<{ data: any[] }>(`/players/search/${encoded}`, { per_page: 8, revalidate: 300 }).catch(() => ({ data: [] })),
    smFetch<{ data: any[] }>(`/leagues/search/${encoded}`, { per_page: 6, revalidate: 300 }).catch(() => ({ data: [] })),
  ])

  return NextResponse.json({
    teams: teamsRes.data.slice(0, 8).map((t: any) => ({
      id: t.id,
      name: t.name,
      image_path: t.image_path,
      country_id: t.country_id,
    })),
    players: playersRes.data.slice(0, 8).map((p: any) => ({
      id: p.id,
      name: p.display_name || p.name,
      image_path: p.image_path,
    })),
    leagues: leaguesRes.data.slice(0, 6).map((l: any) => ({
      id: l.id,
      name: l.name,
      image_path: l.image_path,
      short_code: l.short_code,
    })),
  })
}
