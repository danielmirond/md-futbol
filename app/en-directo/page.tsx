import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { FixtureCard } from '@/components/fixture-card'
import { getTodayFixtures } from '@/lib/sportmonks/fixtures'

export const revalidate = 30

export default async function LivePage() {
  const fixtures = await getTodayFixtures().catch(() => [])
  const live = fixtures.filter((f) => {
    const dn = f.state?.developer_name || ''
    return dn.includes('INPLAY') || dn === 'LIVE' || dn === 'HT'
  })

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-md-black text-white p-6 relative">
          <div className="md-bar -mx-6 -mt-6 mb-6" />
          <div className="eyebrow text-md mb-2 animate-pulse">● TRANSMISIÓN EN VIVO</div>
          <h1 className="font-display font-bold text-4xl md:text-6xl uppercase">
            En Directo · <span className="text-md">{live.length}</span> partidos
          </h1>
        </div>

        {live.length === 0 ? (
          <div className="md-card text-center py-16">
            <div className="eyebrow mb-2">NO HAY PARTIDOS EN VIVO</div>
            <p className="font-sans text-ink2">
              No hay partidos en directo ahora mismo en las competiciones disponibles.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {live.map((f) => (
              <FixtureCard key={f.id} fixture={f} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
