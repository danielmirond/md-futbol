import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { FixtureCard } from '@/components/fixture-card'
import { getTeam, getTeamSquad, getTeamFixtures } from '@/lib/sportmonks/teams'

export const revalidate = 600

interface PageProps { params: { teamId: string } }

export default async function TeamPage({ params: { teamId } }: PageProps) {
  const id = parseInt(teamId, 10)
  if (isNaN(id)) {
    return (
      <>
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="eyebrow mb-2">404</p>
          <h1 className="font-display text-3xl uppercase">Equipo no válido</h1>
        </main>
      </>
    )
  }

  const [team, squad, fixtures] = await Promise.all([
    getTeam(id),
    getTeamSquad(id),
    getTeamFixtures(id),
  ])

  if (!team) {
    return (
      <>
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="eyebrow mb-2">404</p>
          <h1 className="font-display text-3xl uppercase mb-4">Equipo no encontrado</h1>
          <Link href="/" className="btn-ghost inline-block">← Volver al inicio</Link>
        </main>
        <Footer />
      </>
    )
  }

  // Group squad by position
  const positions = new Map<string, typeof squad>()
  const POSITION_NAMES: Record<number, string> = {
    24: 'Portero',
    25: 'Defensa',
    26: 'Mediocampista',
    27: 'Delantero',
  }
  for (const entry of squad) {
    const posName = POSITION_NAMES[entry.position_id || 0] || 'Otros'
    if (!positions.has(posName)) positions.set(posName, [])
    positions.get(posName)!.push(entry)
  }

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Hero */}
        <section className="bg-md-black text-white relative overflow-hidden">
          <div className="md-bar" />
          <div className="p-6 md:p-10 flex items-center gap-6">
            {team.image_path && (
              <Image
                src={team.image_path}
                alt={team.name}
                width={120}
                height={120}
                className="shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="eyebrow text-md mb-2">
                {team.country?.name?.toUpperCase() || ''}
                {team.founded ? ` · FUNDADO EN ${team.founded}` : ''}
              </div>
              <h1 className="font-display font-bold text-4xl md:text-6xl uppercase tracking-tight">
                {team.name}
              </h1>
              {team.venue && (
                <div className="mt-4 font-mono text-xs text-white/60">
                  🏟 {team.venue.name} · {team.venue.city_name}
                  {team.venue.capacity ? ` · ${team.venue.capacity.toLocaleString('es-ES')} plazas` : ''}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Grid: Squad + Fixtures */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Squad */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="md-heading">Plantilla · {squad.length} jugadores</h2>
            {squad.length === 0 ? (
              <div className="md-card text-center py-12 text-ink3 text-sm">
                Plantilla no disponible.
              </div>
            ) : (
              <div className="space-y-4">
                {Array.from(positions.entries()).map(([posName, players]) => (
                  <div key={posName}>
                    <div className="eyebrow text-md mb-2">{posName.toUpperCase()} · {players.length}</div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {players.map((entry) => (
                        <Link
                          key={entry.id}
                          href={`/jugadores/${entry.player_id}`}
                          className="md-card flex items-center gap-3 hover:border-md transition-colors"
                        >
                          {entry.player?.image_path && (
                            <Image
                              src={entry.player.image_path}
                              alt={entry.player.display_name}
                              width={40}
                              height={40}
                              className="shrink-0 bg-border"
                            />
                          )}
                          <div className="min-w-0">
                            <div className="font-display font-semibold uppercase text-xs truncate">
                              {entry.player?.display_name || entry.player?.name || '-'}
                            </div>
                            {entry.jersey_number && (
                              <div className="font-mono text-[10px] text-ink3">
                                #{entry.jersey_number}
                              </div>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Next fixtures */}
          <div>
            <h2 className="md-heading mb-4">Próximos partidos</h2>
            {fixtures.length === 0 ? (
              <div className="md-card text-center py-8 text-ink3 text-sm">
                Sin partidos programados.
              </div>
            ) : (
              <div className="space-y-3">
                {fixtures.slice(0, 5).map((f: any) => (
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
