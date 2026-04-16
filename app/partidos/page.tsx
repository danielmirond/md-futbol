import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { FixtureCard } from '@/components/fixture-card'
import { DatePicker } from '@/components/date-picker'
import { getFixturesByDate } from '@/lib/sportmonks/fixtures'

export const dynamic = 'force-dynamic'
export const revalidate = 60

interface PageProps {
  searchParams: { d?: string }
}

export default async function MatchesPage({ searchParams }: PageProps) {
  const today = new Date().toISOString().split('T')[0]
  const date = /^\d{4}-\d{2}-\d{2}$/.test(searchParams.d || '') ? searchParams.d! : today

  const fixtures = await getFixturesByDate(date).catch(() => [])
  const sorted = [...fixtures].sort((a, b) => a.starting_at.localeCompare(b.starting_at))

  const byLeague = new Map<number, typeof sorted>()
  for (const f of sorted) {
    const id = f.league_id
    if (!byLeague.has(id)) byLeague.set(id, [])
    byLeague.get(id)!.push(f)
  }

  const displayDate = new Date(date + 'T12:00:00').toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <section className="bg-md-black text-white p-6 md:p-10">
          <div className="md-bar -mx-6 md:-mx-10 -mt-6 md:-mt-10 mb-6" />
          <div className="eyebrow text-md mb-2">PARTIDOS · {displayDate.toUpperCase()}</div>
          <h1 className="font-display font-bold text-4xl md:text-6xl uppercase tracking-tight mb-4">
            {sorted.length} <span className="text-md">partidos</span>
          </h1>
          <p className="font-sans text-white/60">
            {byLeague.size} competiciones
          </p>
        </section>

        <DatePicker current={date} />

        {sorted.length === 0 ? (
          <div className="md-card text-center py-12 eyebrow">
            No hay partidos en esta fecha.
          </div>
        ) : (
          Array.from(byLeague.entries()).map(([leagueId, matches]) => (
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
          ))
        )}
      </main>
      <Footer />
    </>
  )
}
