import { NextRequest } from 'next/server'
import { getLeague } from '@/lib/sportmonks/leagues'
import { getFixturesByLeague } from '@/lib/sportmonks/fixtures'
import { buildCalendar, icsResponse } from '@/lib/ical'

export const revalidate = 300

export async function GET(req: NextRequest, { params }: { params: { leagueId: string } }) {
  const id = parseInt(params.leagueId, 10)
  if (isNaN(id)) return new Response('Invalid league id', { status: 400 })

  const [league, fixtures] = await Promise.all([
    getLeague(id).catch(() => null),
    getFixturesByLeague(id).catch(() => []),
  ])

  if (!league) return new Response('League not found', { status: 404 })

  const baseUrl = req.nextUrl.origin
  const body = buildCalendar({
    name: `${league.name} · MD Fútbol`,
    fixtures,
    baseUrl,
  })

  const slug = league.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return icsResponse(body, `${slug || `league-${id}`}.ics`)
}
