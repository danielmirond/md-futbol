import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { DayCarousel } from '@/components/day-carousel'
import { ScheduleHeatmap } from '@/components/schedule-heatmap'
import { FilterableMatches } from '@/components/filterable-matches'
import { getFixturesByDate } from '@/lib/sportmonks/fixtures'

export const dynamic = 'force-dynamic'
export const revalidate = 60

interface PageProps {
  searchParams: { d?: string; liga?: string; estado?: string; fav?: string }
}

export default async function MatchesPage({ searchParams }: PageProps) {
  const today = new Date().toISOString().split('T')[0]
  const date = /^\d{4}-\d{2}-\d{2}$/.test(searchParams.d || '') ? searchParams.d! : today

  const fixtures = await getFixturesByDate(date).catch(() => [])
  const sorted = [...fixtures].sort((a, b) => a.starting_at.localeCompare(b.starting_at))

  const displayDate = new Date(date + 'T12:00:00').toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const isToday = date === today
  const isYesterday = (() => {
    const y = new Date()
    y.setDate(y.getDate() - 1)
    return date === y.toISOString().split('T')[0]
  })()
  const isTomorrow = (() => {
    const t = new Date()
    t.setDate(t.getDate() + 1)
    return date === t.toISOString().split('T')[0]
  })()

  const shortLabel = isToday ? 'HOY' : isYesterday ? 'AYER' : isTomorrow ? 'MAÑANA' : displayDate.toUpperCase()
  const leagueCount = new Set(sorted.map((f) => f.league_id)).size

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <section className="bg-md-black text-white p-6 md:p-10">
          <div className="md-bar -mx-6 md:-mx-10 -mt-6 md:-mt-10 mb-6" />
          <div className="eyebrow text-md mb-2">PARTIDOS · {shortLabel}</div>
          <h1 className="font-display font-bold text-4xl md:text-6xl uppercase tracking-tight mb-4">
            {sorted.length} <span className="text-md">partidos</span>
          </h1>
          <p className="font-sans text-white/60">
            {leagueCount} competiciones · {displayDate}
          </p>
        </section>

        <DayCarousel current={date} />

        {sorted.length > 0 && (
          <ScheduleHeatmap
            fixtures={sorted}
            title={`Horarios · ${displayDate}`}
          />
        )}

        {sorted.length === 0 ? (
          <div className="md-card text-center py-12">
            <div className="eyebrow mb-2">SIN PARTIDOS</div>
            <p className="font-sans text-ink2 text-sm">
              No hay partidos programados para {displayDate}.
            </p>
          </div>
        ) : (
          <FilterableMatches fixtures={sorted} />
        )}
      </main>
      <Footer />
    </>
  )
}
