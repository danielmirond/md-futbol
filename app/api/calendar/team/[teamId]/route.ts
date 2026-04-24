import { NextRequest } from 'next/server'
import { getTeam, getTeamFixtures } from '@/lib/sportmonks/teams'
import { buildCalendar, icsResponse } from '@/lib/ical'

export const revalidate = 300

export async function GET(req: NextRequest, { params }: { params: { teamId: string } }) {
  const id = parseInt(params.teamId, 10)
  if (isNaN(id)) return new Response('Invalid team id', { status: 400 })

  const [team, fixtures] = await Promise.all([
    getTeam(id).catch(() => null),
    getTeamFixtures(id).catch(() => []),
  ])

  if (!team) return new Response('Team not found', { status: 404 })

  const baseUrl = req.nextUrl.origin
  const body = buildCalendar({
    name: `${team.name} · MD Fútbol`,
    fixtures,
    baseUrl,
  })

  const slug = team.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return icsResponse(body, `${slug || `team-${id}`}.ics`)
}
