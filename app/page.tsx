import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { FixtureCard } from '@/components/fixture-card'
import { getTodayFixtures } from '@/lib/sportmonks/fixtures'
import { getFeaturedLeagues, FEATURED_LEAGUE_IDS } from '@/lib/sportmonks/leagues'

export const revalidate = 60

export default async function HomePage() {
  const [fixtures, leagues] = await Promise.all([
    getTodayFixtures().catch(() => []),
    getFeaturedLeagues().catch(() => []),
  ])

  // Filter fixtures to featured leagues for the main list
  const featuredFixtures = fixtures
    .filter((f) => FEATURED_LEAGUE_IDS.includes(f.league_id))
    .sort((a, b) => a.starting_at.localeCompare(b.starting_at))

  const liveFixtures = featuredFixtures.filter((f) => {
    const dn = f.state?.developer_name || ''
    return dn.includes('INPLAY') || dn === 'LIVE' || dn === 'HT'
  })

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Hero band */}
        <section className="bg-md-black text-white relative overflow-hidden">
          <div className="md-bar" />
          <div className="p-6 md:p-10">
            <div className="eyebrow text-md mb-3">DIARIO DEPORTIVO · EDICIÓN DIGITAL</div>
            <h1 className="font-display font-bold text-5xl md:text-7xl uppercase tracking-tight leading-[0.9]">
              Todas las <span className="text-md">competiciones</span>.<br />
              En directo. En serio.
            </h1>
            <p className="font-sans text-white/60 mt-6 max-w-2xl">
              La Liga, Champions, Premier, Bundesliga, Serie A y Ligue 1. Marcadores, clasificaciones y estadísticas
              en vivo con datos de SportMonks.
            </p>
          </div>
        </section>

        {/* Live section */}
        {liveFixtures.length > 0 && (
          <section>
            <h2 className="md-heading mb-4 text-md">● EN VIVO AHORA · {liveFixtures.length}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {liveFixtures.slice(0, 6).map((f) => (
                <FixtureCard key={f.id} fixture={f} />
              ))}
            </div>
          </section>
        )}

        {/* Today fixtures */}
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="md-heading">Partidos de hoy</h2>
            <span className="font-mono text-xs text-ink3">
              {featuredFixtures.length} partidos · competiciones destacadas
            </span>
          </div>

          {featuredFixtures.length === 0 ? (
            <div className="md-card text-center py-12">
              <p className="font-sans text-ink2">No hay partidos hoy en las competiciones destacadas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {featuredFixtures.map((f) => (
                <FixtureCard key={f.id} fixture={f} />
              ))}
            </div>
          )}
        </section>

        {/* Featured leagues grid */}
        <section>
          <h2 className="md-heading mb-4">Competiciones</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {leagues.map((l) => (
              <Link
                key={l.id}
                href={`/ligas/${l.id}`}
                className="md-card flex flex-col items-center text-center gap-2 hover:border-md transition-colors"
              >
                {l.image_path && (
                  <Image src={l.image_path} alt={l.name} width={48} height={48} />
                )}
                <span className="font-display font-semibold uppercase text-xs md:text-sm tracking-tight">
                  {l.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
