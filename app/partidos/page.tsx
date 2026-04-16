import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { FixtureCard } from '@/components/fixture-card'
import { getTodayFixtures } from '@/lib/sportmonks/fixtures'

export const revalidate = 60

export default async function MatchesPage() {
  const fixtures = await getTodayFixtures().catch(() => [])
  const sorted = [...fixtures].sort((a, b) => a.starting_at.localeCompare(b.starting_at))

  // Group by league
  const byLeague = new Map<number, typeof sorted>()
  for (const f of sorted) {
    const id = f.league_id
    if (!byLeague.has(id)) byLeague.set(id, [])
    byLeague.get(id)!.push(f)
  }

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-md-black text-white p-6">
          <div className="md-bar -mx-6 -mt-6 mb-6" />
          <h1 className="font-display font-bold text-4xl md:text-6xl uppercase">Partidos de hoy</h1>
          <p className="font-sans text-white/60 mt-3">
            {sorted.length} partidos programados hoy en {byLeague.size} competiciones
          </p>
        </div>

        {Array.from(byLeague.entries()).map(([leagueId, matches]) => (
          <section key={leagueId}>
            <h2 className="md-heading mb-4">
              {matches[0].league?.name || `Liga #${leagueId}`}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {matches.map((f) => (
                <FixtureCard key={f.id} fixture={f} />
              ))}
            </div>
          </section>
        ))}
      </main>
      <Footer />
    </>
  )
}
