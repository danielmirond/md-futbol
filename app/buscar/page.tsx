import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { searchAll } from '@/lib/sportmonks/search'

export const revalidate = 300

interface PageProps {
  searchParams: { q?: string }
}

export async function generateMetadata({ searchParams }: PageProps) {
  const q = (searchParams.q || '').trim()
  return {
    title: q ? `"${q}" · Búsqueda · MD Fútbol` : 'Búsqueda · MD Fútbol',
    description: q
      ? `Resultados de búsqueda para "${q}": equipos, jugadores y competiciones.`
      : 'Busca equipos, jugadores y competiciones en MD Fútbol.',
  }
}

export default async function SearchPage({ searchParams }: PageProps) {
  const q = (searchParams.q || '').trim()
  const results = q.length >= 2
    ? await searchAll(q, 30).catch(() => ({ teams: [], players: [], leagues: [] }))
    : { teams: [], players: [], leagues: [] }

  const totalCount = results.teams.length + results.players.length + results.leagues.length

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <section className="bg-md-black text-white relative overflow-hidden">
          <div className="md-bar" />
          <div className="p-6 md:p-10">
            <div className="eyebrow text-md mb-2">BÚSQUEDA</div>
            <h1 className="font-display font-bold text-4xl md:text-6xl uppercase tracking-tight">
              {q ? <>Resultados de <span className="text-md">&ldquo;{q}&rdquo;</span></> : 'Buscar'}
            </h1>
            {q && (
              <p className="font-sans text-white/60 mt-3">
                {totalCount} coincidencias · {results.teams.length} equipos · {results.players.length} jugadores · {results.leagues.length} ligas
              </p>
            )}
          </div>
        </section>

        {!q && (
          <div className="md-card text-center py-16">
            <p className="eyebrow mb-3">ESCRIBE ALGO</p>
            <p className="font-sans text-ink2 max-w-md mx-auto">
              Busca nombres de equipos, jugadores o competiciones desde la barra de búsqueda superior, o añade un parámetro <code className="font-mono bg-border px-1">?q=</code> a la URL.
            </p>
          </div>
        )}

        {q && totalCount === 0 && (
          <div className="md-card text-center py-16">
            <p className="eyebrow mb-3">SIN RESULTADOS</p>
            <p className="font-sans text-ink2 max-w-md mx-auto">
              Ningún equipo, jugador ni liga coincide con &ldquo;{q}&rdquo;. Prueba otros términos.
            </p>
          </div>
        )}

        {results.teams.length > 0 && (
          <section>
            <h2 className="md-heading mb-4">Equipos · {results.teams.length}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {results.teams.map((t) => (
                <Link
                  key={t.id}
                  href={`/equipos/${t.id}`}
                  className="md-card flex flex-col items-center text-center gap-2 hover:border-md transition-colors"
                >
                  {t.image_path && (
                    <Image src={t.image_path} alt={t.name} width={56} height={56} />
                  )}
                  <span className="font-display font-semibold uppercase text-xs md:text-sm tracking-tight">
                    {t.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {results.players.length > 0 && (
          <section>
            <h2 className="md-heading mb-4">Jugadores · {results.players.length}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {results.players.map((p) => (
                <Link
                  key={p.id}
                  href={`/jugadores/${p.id}`}
                  className="md-card flex items-center gap-3 hover:border-md transition-colors"
                >
                  {p.image_path ? (
                    <Image src={p.image_path} alt={p.name} width={40} height={40} className="shrink-0 bg-border" />
                  ) : (
                    <div className="w-10 h-10 bg-border shrink-0" />
                  )}
                  <span className="font-display font-semibold uppercase text-xs truncate">
                    {p.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {results.leagues.length > 0 && (
          <section>
            <h2 className="md-heading mb-4">Competiciones · {results.leagues.length}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {results.leagues.map((l) => (
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
        )}
      </main>
      <Footer />
    </>
  )
}
