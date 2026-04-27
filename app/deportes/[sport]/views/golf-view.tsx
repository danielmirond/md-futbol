import Image from 'next/image'
import { SportHero } from '@/components/espn/sport-hero'
import { getGolfLeaderboard } from '@/lib/espn/rankings'
import type { SportConfig } from '@/lib/sports/registry'

interface Props {
  sport: SportConfig
}

export async function GolfView({ sport }: Props) {
  const tour = sport.slug === 'pga' ? 'pga' : 'lpga'
  const { tournamentName, entries } = await getGolfLeaderboard(tour)

  return (
    <>
      <SportHero eyebrow="LEADERBOARD" sport={sport} subtitle={tournamentName || sport.tagline} />

      {entries.length === 0 ? (
        <div className="md-card text-center py-12">
          <div className="eyebrow mb-2">SIN TORNEO ACTIVO</div>
          <p className="font-sans text-ink2 text-sm">No hay torneo en curso en este momento.</p>
        </div>
      ) : (
        <section>
          <h2 className="md-heading mb-4">Clasificación</h2>
          <div className="bg-paper border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-md-black text-white">
                  <th className="text-left font-mono text-[10px] uppercase tracking-wider px-3 py-2 w-12">Pos</th>
                  <th className="text-left font-mono text-[10px] uppercase tracking-wider px-3 py-2">Jugador</th>
                  <th className="text-right font-mono text-[10px] uppercase tracking-wider px-3 py-2">Total</th>
                  <th className="text-right font-mono text-[10px] uppercase tracking-wider px-3 py-2 hidden md:table-cell">Hoy</th>
                  <th className="text-right font-mono text-[10px] uppercase tracking-wider px-3 py-2 hidden md:table-cell">Thru</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e, i) => (
                  <tr key={e.athlete?.id || i} className="border-b border-border last:border-b-0 hover:bg-surface">
                    <td className="px-3 py-2 font-display font-bold tabular-nums text-ink3">{e.position}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        {e.athlete?.headshot?.href && (
                          <Image src={e.athlete.headshot.href} alt="" width={24} height={24} className="bg-border shrink-0" />
                        )}
                        <span className="font-display font-semibold uppercase text-xs md:text-sm truncate">
                          {e.athlete?.displayName || e.athlete?.fullName || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 font-display font-bold text-right text-md">{e.score ?? '-'}</td>
                    <td className="px-3 py-2 font-display text-right hidden md:table-cell">{e.today ?? '-'}</td>
                    <td className="px-3 py-2 font-mono text-xs text-ink3 text-right hidden md:table-cell">{e.thru ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  )
}
