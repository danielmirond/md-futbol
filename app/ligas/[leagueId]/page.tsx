import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { FixtureCard } from '@/components/fixture-card'
import { getLeague } from '@/lib/sportmonks/leagues'
import { getCurrentSeasonByLeague, getStandingsBySeason } from '@/lib/sportmonks/standings'
import { getFixturesByLeague } from '@/lib/sportmonks/fixtures'

export const revalidate = 300

interface PageProps {
  params: { leagueId: string }
}

export default async function LeaguePage({ params: { leagueId } }: PageProps) {
  const id = parseInt(leagueId, 10)
  if (isNaN(id)) {
    return (
      <>
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="eyebrow mb-2">404</p>
          <h1 className="font-display text-3xl uppercase">Liga no encontrada</h1>
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
          <Link href="/ligas" className="btn-ghost inline-block mt-4">
            ← Volver a ligas
          </Link>
        </main>
        <Footer />
      </>
    )
  }

  const seasonId = await getCurrentSeasonByLeague(id)
  const [standings, fixtures] = await Promise.all([
    seasonId ? getStandingsBySeason(seasonId).catch(() => []) : Promise.resolve([]),
    getFixturesByLeague(id, seasonId || undefined).catch(() => []),
  ])

  // Sort standings by position
  const sortedStandings = [...standings].sort((a, b) => (a.position || 99) - (b.position || 99))

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
            <div>
              <div className="eyebrow text-md mb-2">{league.short_code || 'COMPETICIÓN'}</div>
              <h1 className="font-display font-bold text-4xl md:text-6xl uppercase tracking-tight">
                {league.name}
              </h1>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Standings */}
          <div className="lg:col-span-2">
            <h2 className="md-heading mb-4">Clasificación</h2>
            {sortedStandings.length === 0 ? (
              <div className="md-card text-center py-8 text-ink3 text-sm">
                Clasificación no disponible para esta competición.
              </div>
            ) : (
              <div className="bg-paper border border-border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-md-black text-white">
                    <tr>
                      <th className="font-mono text-[10px] uppercase tracking-wider text-left px-3 py-2 w-10">#</th>
                      <th className="font-mono text-[10px] uppercase tracking-wider text-left px-3 py-2">Equipo</th>
                      <th className="font-mono text-[10px] uppercase tracking-wider text-center px-2 py-2 w-12">PJ</th>
                      <th className="font-mono text-[10px] uppercase tracking-wider text-center px-2 py-2 w-12">V</th>
                      <th className="font-mono text-[10px] uppercase tracking-wider text-center px-2 py-2 w-12">E</th>
                      <th className="font-mono text-[10px] uppercase tracking-wider text-center px-2 py-2 w-12">D</th>
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
                      return (
                        <tr
                          key={row.id}
                          className={`border-t border-border hover:bg-surface ${
                            idx < 4 ? 'border-l-4 border-l-win' : idx > sortedStandings.length - 4 ? 'border-l-4 border-l-md' : ''
                          }`}
                        >
                          <td className="px-3 py-2 font-display font-bold text-md">{row.position}</td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2 min-w-0">
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
                            </div>
                          </td>
                          <td className="text-center font-mono text-xs">{played}</td>
                          <td className="text-center font-mono text-xs">{won}</td>
                          <td className="text-center font-mono text-xs">{drawn}</td>
                          <td className="text-center font-mono text-xs">{lost}</td>
                          <td className="text-center font-display font-bold bg-surface">{row.points}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Fixtures */}
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
      </main>
      <Footer />
    </>
  )
}
