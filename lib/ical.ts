import type { SmFixture } from './sportmonks/types'

const CRLF = '\r\n'

function escapeIcs(v: string): string {
  return v
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

function formatIcsDate(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z'
  )
}

function foldLine(line: string): string {
  // RFC 5545: wrap lines at 75 octets
  if (line.length <= 75) return line
  const out: string[] = []
  let remaining = line
  out.push(remaining.slice(0, 75))
  remaining = remaining.slice(75)
  while (remaining.length > 0) {
    out.push(' ' + remaining.slice(0, 74))
    remaining = remaining.slice(74)
  }
  return out.join(CRLF)
}

export interface IcsOptions {
  name: string
  fixtures: SmFixture[]
  baseUrl: string
  durationMinutes?: number
}

export function buildCalendar({ name, fixtures, baseUrl, durationMinutes = 120 }: IcsOptions): string {
  const now = new Date().toISOString()

  const events = fixtures.map((f) => {
    const home = f.participants?.find((p) => p.meta?.location === 'home')
    const away = f.participants?.find((p) => p.meta?.location === 'away')
    const summary = home && away ? `${home.name} vs ${away.name}` : f.name || 'Partido'
    const league = f.league?.name || ''
    const venue = f.venue?.name || ''
    const start = new Date(f.starting_at)
    const end = new Date(start.getTime() + durationMinutes * 60_000)
    const url = `${baseUrl}/partidos/${f.id}`
    const description = [league, venue, url].filter(Boolean).join(' · ')

    return [
      'BEGIN:VEVENT',
      foldLine(`UID:fixture-${f.id}@md-futbol`),
      foldLine(`DTSTAMP:${formatIcsDate(now)}`),
      foldLine(`DTSTART:${formatIcsDate(start.toISOString())}`),
      foldLine(`DTEND:${formatIcsDate(end.toISOString())}`),
      foldLine(`SUMMARY:${escapeIcs(summary)}${league ? ` (${escapeIcs(league)})` : ''}`),
      venue ? foldLine(`LOCATION:${escapeIcs(venue)}`) : null,
      foldLine(`DESCRIPTION:${escapeIcs(description)}`),
      foldLine(`URL:${url}`),
      'END:VEVENT',
    ]
      .filter(Boolean)
      .join(CRLF)
  })

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MD Fútbol//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    foldLine(`X-WR-CALNAME:${escapeIcs(name)}`),
    'X-WR-TIMEZONE:Europe/Madrid',
    ...events,
    'END:VCALENDAR',
  ].join(CRLF)
}

export function icsResponse(body: string, filename: string): Response {
  return new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  })
}
