import Image from 'next/image'
import { SportHero } from '@/components/espn/sport-hero'
import { getRacingSchedule, getRacingStandings } from '@/lib/espn/rankings'
import type { SportConfig } from '@/lib/sports/registry'

interface Props {
  sport: SportConfig
}

export async function RacingView({ sport }: Props) {
  // The ESPN path is racing/{series}
  const series = sport.espnPath.replace('racing/', '')
  const [schedule, drivers, constructors] = await Promise.all([
    getRacingSchedule(series),
    getRacingStandings(series, 1),
    getRacingStandings(series, 2).catch(() => []),
  ])

  const now = Date.now()
  const upcoming = schedule.filter((e) => new Date(e.date).getTime() >= now - 3 * 3600_000)
  const past = schedule.filter((e) => new Date(e.date).getTime() < now - 3 * 3600_000)

  return (
    <>
      <SportHero
        eyebrow="CAMPEONATO MUNDIAL"
        title={sport.name}
        accent={sport.accent || '#E30613'}
        subtitle={sport.tagline}
        icon={sport.icon}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <h2 className="md-heading mb-4">Calendario</h2>
          {schedule.length === 0 ? (
            <div className="md-card text-center py-12 text-ink3 text-sm">
              Calendario no disponible.
            </div>
          ) : (
            <div className="bg-paper border border-border divide-y divide-border">
              {upcoming.slice(0, 6).map((e) => (
                <div key={e.id} className="p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-semibold uppercase text-sm truncate">{e.name}</div>
                    {e.venue && <div className="font-mono text-[10px] text-ink3 uppercase truncate">{e.venue}</div>}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-display font-bold tabular-nums text-sm">
                      {new Date(e.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </div>
                    <div className="eyebrow">PRÓXIMA</div>
                  </div>
                </div>
              ))}
              {past.slice(-6).reverse().map((e) => (
                <div key={e.id} className="p-3 flex items-center gap-3 opacity-70">
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-semibold uppercase text-sm truncate">{e.name}</div>
                    {e.venue && <div className="font-mono text-[10px] text-ink3 uppercase truncate">{e.venue}</div>}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-display font-bold tabular-nums text-sm">
                      {new Date(e.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </div>
                    <div className="eyebrow text-ink3">FINAL</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drivers standings */}
        <div className="space-y-6">
          {drivers.length > 0 && (
            <div>
              <h2 className="md-heading mb-3">Pilotos</h2>
              <div className="bg-paper border border-border">
                {drivers.slice(0, 10).map((d) => (
                  <div
                    key={`${d.position}-${d.athleteOrTeam}`}
                    className="flex items-center gap-2 px-3 py-2 border-b border-border last:border-b-0"
                  >
                    <span className="font-display font-bold tabular-nums text-sm w-6 text-ink3">{d.position}</span>
                    {d.image && <Image src={d.image} alt="" width={20} height={20} />}
                    <span className="flex-1 font-display font-semibold uppercase text-xs truncate">{d.athleteOrTeam}</span>
                    <span className="font-display font-bold tabular-nums text-sm text-md">{d.points}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {constructors.length > 0 && (
            <div>
              <h2 className="md-heading mb-3">Constructores</h2>
              <div className="bg-paper border border-border">
                {constructors.slice(0, 10).map((d) => (
                  <div
                    key={`${d.position}-${d.athleteOrTeam}`}
                    className="flex items-center gap-2 px-3 py-2 border-b border-border last:border-b-0"
                  >
                    <span className="font-display font-bold tabular-nums text-sm w-6 text-ink3">{d.position}</span>
                    {d.image && <Image src={d.image} alt="" width={20} height={20} />}
                    <span className="flex-1 font-display font-semibold uppercase text-xs truncate">{d.athleteOrTeam}</span>
                    <span className="font-display font-bold tabular-nums text-sm text-md">{d.points}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
