import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { FixtureCard } from '@/components/fixture-card'
import { FavoriteButton } from '@/components/favorite-button'
import { CalendarSubscribe } from '@/components/calendar-subscribe'
import { LeagueGoalsHeatmap } from '@/components/league-goals-heatmap'
import { getLeague } from '@/lib/sportmonks/leagues'
import { getCurrentSeasonByLeague, getStandingsBySeason } from '@/lib/sportmonks/standings'
import { getFixturesByLeague } from '@/lib/sportmonks/fixtures'
import { getTopScorersBySeason } from '@/lib/sportmonks/players'

export const revalidate = 300

interface PageProps { params: { leagueId: string } }

export default async function LeaguePage({ params: { leagueId } }: PageProps) {
  const id = parseInt(leagueId, 10)
  if (isNaN(id)) {
    return (
      <>
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="eyebrow mb-2">404</p>
          <h1 className="font-display text-3xl uppercase">Liga no válida</h1>
        </main>
      </>
    )
  }

  const league = await getLeague(id)
  if (!league) {
    return (
      <>
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="eyebrow mb-2">404</p>
          <h1 className="font-display text-3xl uppercase">Liga no disponible</h1>
          <Link href="/ligas" className="btn-ghost inline-block mt-4">← Volver a ligas</Link>
        </main>
        <Footer />
      </>
    )
  }

  const seasonId = await getCurrentSeasonByLeague(id)
  const accessible = seasonId !== null
  const [standings, fixtures, topScorers] = await Promise.all([
    seasonId ? getStandingsBySeason(seasonId).catch(() => []) : Promise.resolve([]),
    getFixturesByLeague(id, seasonId || undefined).catch(() => []),
    seasonId ? getTopScorersBySeason(seasonId).catch(() => []) : Promise.resolve([]),
  ])

  const sortedStandings = [...standings].sort((a, b) => (a.position || 99) - (b.position || 99))
  const isCupFormat = league.sub_type?.includes('cup')

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Hero */}
        <section className="bg-md-black text-white relative">
          <div className="md-bar" />
          <div className="p-6 md:p-10 flex items-center gap-6">
            {league.image_path && (
              <Image
                src={league.image_path}
                alt={league.name}
                width={96}
                height={96}
                className="shrink-0 bg-white p-2"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="eyebrow text-md mb-2">{league.short_code || 'COMPETICIÓN'}</div>
              <h1 className="font-display font-bold text-4xl md:text-6xl uppercase tracking-tight">
                {league.name}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <CalendarSubscribe icsPath={`/api/calendar/league/${league.id}`} label="Calendario" />
              <FavoriteButton type="league" id={league.id} name={league.name} imagePath={league.image_path} size="lg" />
            </div>
          </div>
        </section>

        {/* League goals heatmap — only show if accessible */}
        {accessible && <LeagueGoalsHeatmap leagueId={id} />}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Standings */}
          <div className="lg:col-span-2">
            <h2 className="md-heading mb-4">Clasificación</h2>
            {!accessible ? (
              <div className="md-card py-8 text-center">
                <div className="eyebrow mb-2">⚠ NO DISPONIBLE</div>
                <p className="font-sans text-ink2 text-sm max-w-md mx-auto">
                  Esta competición no está incluida en el plan actual de SportMonks.
                  Upgrade necesario para acceder a sus datos.
                </p>
              </div>
            ) : sortedStandings.length === 0 ? (
              <div className="md-card py-8 text-center">
                <div className="eyebrow mb-2">
                  {isCupFormat ? '🏆 FORMATO DE COPA' : 'SIN DATOS'}
                </div>
                <p className="font-sans text-ink2 text-sm max-w-md mx-auto">
                  {isCupFormat
                    ? 'Competición eliminatoria sin clasificación lineal. Consulta los partidos para ver el progreso.'
                    : 'La clasificación de esta competición aún no está disponible.'}
                </p>
              </div>
            ) : (
              <div className="bg-paper border border-border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-md-black text-white">
                    <tr>
                      <th className="font-mono text-[10px] uppercase tracking-wider text-left px-3 py-2 w-10">#</th>
                      <th className="font-mono text-[10px] uppercase tracking-wider text-left px-3 py-2">Equipo</th>
                      <th className="font-mono text-[10px] uppercase tracking-wider text-center px-2 py-2 w-10">PJ</th>
                      <th className="font-mono text-[10px] uppercase tracking-wider text-center px-2 py-2 w-10">V</th>
                      <th className="font-mono text-[10px] uppercase tracking-wider text-center px-2 py-2 w-10">E</th>
                      <th className="font-mono text-[10px] uppercase tracking-wider text-center px-2 py-2 w-10">D</th>
                      <th className="font-mono text-[10px] uppercase tracking-wider text-center px-2 py-2 w-12">GF</th>
                      <th className="font-mono text-[10px] uppercase tracking-wider text-center px-2 py-2 w-12">GC</th>
                      <th className="font-mono text-[10px] uppercase tracking-wider text-center px-2 py-2 w-14 hidden md:table-cell">Forma</th>
                      <th className="font-mono text-[10px] uppercase tracking-wider text-center px-2 py-2 w-12 bg-md">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedStandings.map((row, idx) => {
                      const detail = (key: string) =>
                        row.details?.find((d) => d.type?.developer_name === key)?.value ?? '-'
                      const played = detail('OVERALL_PLAYED')
                      const won = detail('OVERALL_WON')
                      const drawn = detail('OVERALL_DRAW')
                      const lost = detail('OVERALL_LOST')
                      const gf = detail('OVERALL_SCORED')
                      const ga = detail('OVERALL_CONCEDED')
                      const form = row.form?.slice(0, 5) || []

                      const borderClass =
                        idx < 4 ? 'border-l-4 border-l-win' :
                        idx >= sortedStandings.length - 3 ? 'border-l-4 border-l-md' : ''

                      return (
                        <tr
                          key={row.id}
                          className={`border-t border-border hover:bg-surface ${borderClass}`}
                        >
                          <td className="px-3 py-2 font-display font-bold text-md">{row.position}</td>
                          <td className="px-3 py-2">
                            <Link
                              href={`/equipos/${row.participant_id}`}
                              className="flex items-center gap-2 min-w-0 hover:text-md"
                            >
                              {row.participant?.image_path && (
                                <Image
                                  src={row.participant.image_path}
                                  alt={row.participant.name}
                                  width={20}
                                  height={20}
                                  className="shrink-0"
                                />
                              )}
                              <span className="font-display font-semibold uppercase text-xs truncate">
                                {row.participant?.name || `#${row.participant_id}`}
                              </span>
                            </Link>
                          </td>
                          <td className="text-center font-mono text-xs">{played}</td>
                          <td className="text-center font-mono text-xs">{won}</td>
                          <td className="text-center font-mono text-xs">{drawn}</td>
                          <td className="text-center font-mono text-xs">{lost}</td>
                          <td className="text-center font-mono text-xs">{gf}</td>
                          <td className="text-center font-mono text-xs">{ga}</td>
                          <td className="text-center hidden md:table-cell">
                            <div className="flex gap-1 justify-center">
                              {form.map((f, i) => (
                                <span
                                  key={i}
                                  className={`w-4 h-4 inline-flex items-center justify-center text-[9px] font-bold text-white ${
                                    f.form === 'W' ? 'bg-win' :
                                    f.form === 'D' ? 'bg-draw' : 'bg-md'
                                  }`}
                                >{f.form}</span>
                              ))}
                            </div>
                          </td>
                          <td className="text-center font-display font-bold bg-surface">{row.points}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right side: Fixtures + Top Scorers */}
          <div className="space-y-6">
            {topScorers.length > 0 && (
              <div>
                <h2 className="md-heading mb-4">⚽ Pichichi</h2>
                <div className="bg-paper border border-border divide-y divide-border">
                  {topScorers.slice(0, 10).map((s, idx) => (
                    <Link
                      key={s.id}
                      href={`/jugadores/${s.player_id}`}
                      className="flex items-center gap-3 p-3 hover:bg-surface transition-colors"
                    >
                      <div className="w-6 font-display font-bold text-md text-center">{s.position}</div>
                      {s.player?.image_path && (
                        <Image
                          src={s.player.image_path}
                          alt={s.player.display_name}
                          width={32}
                          height={32}
                          className="bg-border shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-display font-semibold uppercase text-xs truncate">
                          {s.player?.display_name || s.player?.name || '-'}
                        </div>
                        <div className="font-mono text-[9px] text-ink3 truncate uppercase">
                          {s.participant?.name}
                        </div>
                      </div>
                      <div className="font-display font-bold text-lg tabular-nums">{s.total}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="md-heading mb-4">Próximos partidos</h2>
              {fixtures.length === 0 ? (
                <div className="md-card text-center py-8 text-ink3 text-sm">
                  Sin partidos disponibles.
                </div>
              ) : (
                <div className="space-y-3">
                  {fixtures.slice(0, 10).map((f) => (
                    <FixtureCard key={f.id} fixture={f} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
