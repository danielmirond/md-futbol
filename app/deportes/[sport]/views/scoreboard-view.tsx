import Link from 'next/link'
import { SportHero } from '@/components/espn/sport-hero'
import { EspnEventCard } from '@/components/espn/espn-event-card'
import { EspnStandingsTable } from '@/components/espn/espn-standings-table'
import { getScoreboard, partitionEvents } from '@/lib/espn/scoreboard'
import { getStandings, flattenStandings } from '@/lib/espn/standings'
import type { SportConfig } from '@/lib/sports/registry'

interface Props {
  sport: SportConfig
  date?: string
}

function toEspnDateParam(date?: string): string | undefined {
  if (!date) return undefined
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  if (!m) return undefined
  return `${m[1]}${m[2]}${m[3]}`
}

export async function ScoreboardView({ sport, date }: Props) {
  const dateParam = toEspnDateParam(date)
  const [scoreboard, standings] = await Promise.all([
    getScoreboard(sport.espnPath, { dates: dateParam, revalidate: sport.revalidate }).catch(() => null),
    getStandings(sport.espnPath).catch(() => null),
  ])

  const events = scoreboard?.events || []
  const { live, upcoming, finished } = partitionEvents(events)
  const standingsGroups = standings ? flattenStandings(standings) : []

  const today = new Date()
  const ymd = (d: Date) => d.toISOString().split('T')[0]
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  return (
    <>
      <SportHero
        eyebrow="DEPORTES · MULTI"
        title={sport.name}
        accent={sport.accent || '#E30613'}
        subtitle={sport.tagline}
        icon={sport.icon}
      />

      {/* Day nav */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {[
          { label: 'Ayer', d: ymd(yesterday) },
          { label: 'Hoy', d: ymd(today) },
          { label: 'Mañana', d: ymd(tomorrow) },
        ].map((item) => {
          const active = (date || ymd(today)) === item.d
          return (
            <Link
              key={item.d}
              href={`/deportes/${sport.slug}${item.d === ymd(today) ? '' : `?d=${item.d}`}`}
              className={`font-display uppercase text-xs tracking-wider px-3 py-1.5 border transition-colors ${
                active ? 'border-md text-md bg-md/5' : 'border-border text-ink2 hover:border-md hover:text-md'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </div>

      {/* Live */}
      {live.length > 0 && (
        <section>
          <h2 className="md-heading mb-4 text-md">● EN VIVO · {live.length}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {live.map((ev) => (
              <EspnEventCard key={ev.id} event={ev} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <section>
          <h2 className="md-heading mb-4">Próximos partidos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {upcoming.map((ev) => (
              <EspnEventCard key={ev.id} event={ev} />
            ))}
          </div>
        </section>
      )}

      {/* Finished */}
      {finished.length > 0 && (
        <section>
          <h2 className="md-heading mb-4">Finalizados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {finished.map((ev) => (
              <EspnEventCard key={ev.id} event={ev} />
            ))}
          </div>
        </section>
      )}

      {events.length === 0 && (
        <div className="md-card text-center py-12">
          <div className="eyebrow mb-2">SIN PARTIDOS</div>
          <p className="font-sans text-ink2 text-sm">No hay partidos programados en esta fecha.</p>
        </div>
      )}

      {/* Standings */}
      {standingsGroups.length > 0 && (
        <section className="space-y-4">
          <h2 className="md-heading">Clasificación</h2>
          {standingsGroups.map((g, i) => (
            <EspnStandingsTable key={`${g.label}-${i}`} label={g.label} entries={g.entries} />
          ))}
        </section>
      )}
    </>
  )
}
