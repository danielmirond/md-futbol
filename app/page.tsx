import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { FixtureCard } from '@/components/fixture-card'
import { StaggerGrid } from '@/components/stagger-grid'
import { CompetitionWidget } from '@/components/competition-widget'
import { MyFavoritesSection } from '@/components/my-favorites-section'
import { getFixturesByDate, getTodayFixtures, getUpcomingFixturesAcrossDays } from '@/lib/sportmonks/fixtures'
import { getFeaturedLeagues, FEATURED_LEAGUE_IDS } from '@/lib/sportmonks/leagues'

export const revalidate = 60

function yesterdayISO(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

function tomorrowISO(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

export default async function HomePage() {
  const [today, yesterday, tomorrow, leagues, upcoming] = await Promise.all([
    getTodayFixtures().catch(() => []),
    getFixturesByDate(yesterdayISO()).catch(() => []),
    getFixturesByDate(tomorrowISO()).catch(() => []),
    getFeaturedLeagues().catch(() => []),
    getUpcomingFixturesAcrossDays(5).catch(() => []),
  ])

  // Upcoming fixtures filtered to featured leagues (for the widget carousel)
  const widgetFixtures = upcoming
    .filter((f) => FEATURED_LEAGUE_IDS.includes(f.league_id))
    .filter((f) => {
      const dn = f.state?.developer_name || ''
      return dn === 'NS' || dn.includes('INPLAY') || dn === 'LIVE' || dn === 'HT'
    })

  // Filter featured
  const featuredToday = today
    .filter((f) => FEATURED_LEAGUE_IDS.includes(f.league_id))
    .sort((a, b) => a.starting_at.localeCompare(b.starting_at))

  const featuredYesterday = yesterday
    .filter((f) => FEATURED_LEAGUE_IDS.includes(f.league_id))
    .filter((f) => f.state?.developer_name === 'FT' || f.state?.developer_name === 'AET')
    .sort((a, b) => b.starting_at.localeCompare(a.starting_at))

  const featuredTomorrow = tomorrow
    .filter((f) => FEATURED_LEAGUE_IDS.includes(f.league_id))
    .sort((a, b) => a.starting_at.localeCompare(b.starting_at))

  const liveFixtures = featuredToday.filter((f) => {
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
              La Liga, Champions, Europa League y Conference. Marcadores, clasificaciones y crónicas con IA en tiempo real.
            </p>
          </div>
        </section>

        {/* Personalized favorites feed (only renders if user has favorites) */}
        <MyFavoritesSection />

        {/* Competition widget — editorial+classic hybrid */}
        {leagues.length > 0 && (
          <CompetitionWidget
            variant="editorial"
            leagues={leagues}
            fixtures={widgetFixtures.length > 0 ? widgetFixtures : upcoming.slice(0, 20)}
          />
        )}

        {/* Live section */}
        {liveFixtures.length > 0 && (
          <section>
            <h2 className="md-heading mb-4 text-md">● EN VIVO AHORA · {liveFixtures.length}</h2>
            <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 gap-3" stepMs={50}>
              {liveFixtures.slice(0, 6).map((f) => (
                <FixtureCard key={f.id} fixture={f} />
              ))}
            </StaggerGrid>
          </section>
        )}

        {/* Quick day nav — links to /partidos with date query */}
        <section>
          <h2 className="md-heading mb-4">Calendario</h2>
          <div className="grid grid-cols-3 gap-3">
            <Link
              href={`/partidos?d=${yesterdayISO()}`}
              className="md-card hover:border-md transition-colors text-center"
            >
              <div className="eyebrow mb-1">AYER</div>
              <div className="font-display font-bold text-3xl md:text-4xl tabular-nums">
                {featuredYesterday.length}
              </div>
              <div className="font-mono text-[10px] text-ink3 uppercase mt-1">resultados</div>
            </Link>
            <Link
              href="/partidos"
              className="bg-md-black text-white p-4 border border-md-black hover:bg-md hover:border-md transition-colors text-center relative overflow-hidden"
            >
              <div className="md-bar absolute top-0 left-0 right-0" />
              <div className="eyebrow text-md mb-1">HOY</div>
              <div className="font-display font-bold text-3xl md:text-4xl tabular-nums">
                {featuredToday.length}
              </div>
              <div className="font-mono text-[10px] text-white/60 uppercase mt-1">partidos</div>
            </Link>
            <Link
              href={`/partidos?d=${tomorrowISO()}`}
              className="md-card hover:border-md transition-colors text-center"
            >
              <div className="eyebrow mb-1">MAÑANA</div>
              <div className="font-display font-bold text-3xl md:text-4xl tabular-nums">
                {featuredTomorrow.length}
              </div>
              <div className="font-mono text-[10px] text-ink3 uppercase mt-1">programados</div>
            </Link>
          </div>
        </section>

        {/* Yesterday results */}
        {featuredYesterday.length > 0 && (
          <section>
            <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
              <h2 className="md-heading">Resultados de ayer</h2>
              <Link
                href={`/partidos?d=${yesterdayISO()}`}
                className="font-mono text-xs text-md uppercase tracking-wider hover:underline"
              >
                VER TODOS →
              </Link>
            </div>
            <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 gap-3" stepMs={60} startDelayMs={100}>
              {featuredYesterday.slice(0, 6).map((f) => (
                <FixtureCard key={f.id} fixture={f} />
              ))}
            </StaggerGrid>
          </section>
        )}

        {/* Today fixtures */}
        <section>
          <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
            <h2 className="md-heading">Partidos de hoy</h2>
            <span className="font-mono text-xs text-ink3">
              {featuredToday.length} partidos · competiciones destacadas
            </span>
          </div>

          {featuredToday.length === 0 ? (
            <div className="md-card text-center py-12">
              <p className="font-sans text-ink2">No hay partidos hoy en las competiciones destacadas.</p>
              {featuredTomorrow.length > 0 && (
                <Link href={`/partidos?d=${tomorrowISO()}`} className="btn-ghost inline-block mt-4">
                  VER MAÑANA →
                </Link>
              )}
            </div>
          ) : (
            <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 gap-3" stepMs={60} startDelayMs={150}>
              {featuredToday.map((f) => (
                <FixtureCard key={f.id} fixture={f} />
              ))}
            </StaggerGrid>
          )}
        </section>

        {/* Tomorrow preview */}
        {featuredTomorrow.length > 0 && (
          <section>
            <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
              <h2 className="md-heading">Mañana</h2>
              <Link
                href={`/partidos?d=${tomorrowISO()}`}
                className="font-mono text-xs text-md uppercase tracking-wider hover:underline"
              >
                VER TODOS →
              </Link>
            </div>
            <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 gap-3" stepMs={60} startDelayMs={200}>
              {featuredTomorrow.slice(0, 4).map((f) => (
                <FixtureCard key={f.id} fixture={f} />
              ))}
            </StaggerGrid>
          </section>
        )}

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
