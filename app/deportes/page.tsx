import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { SportLogo } from '@/components/espn/sport-logo'
import { SPORTS, SPORT_CATEGORIES, getSport } from '@/lib/sports/registry'

export const revalidate = 3600

export const metadata = {
  title: 'Todos los deportes · MD Fútbol',
  description: 'Baloncesto, NFL, tenis, F1, golf, UFC y más. Resultados, clasificaciones y calendario en tiempo real.',
}

export default function DeportesHubPage() {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        <section className="bg-md-black text-white p-6 md:p-10 relative">
          <div className="md-bar -mx-6 md:-mx-10 -mt-6 md:-mt-10 mb-6" />
          <div className="eyebrow text-md mb-2">TODOS LOS DEPORTES</div>
          <h1 className="font-display font-bold text-4xl md:text-6xl uppercase tracking-tight leading-[0.95]">
            Más que <span className="text-md">fútbol</span>.
          </h1>
          <p className="font-sans text-white/60 mt-4 max-w-2xl">
            Baloncesto, NFL, tenis, Fórmula 1, golf, UFC, béisbol, hockey... en tiempo real, con el estilo de siempre.
          </p>
          <div className="mt-4 font-mono text-[10px] text-white/40 uppercase tracking-wider">
            {Object.keys(SPORTS).length} deportes · {SPORT_CATEGORIES.length} categorías · datos ESPN
          </div>
        </section>

        {/* Categories */}
        <div className="space-y-8">
          {SPORT_CATEGORIES.map((cat) => (
            <section key={cat.label}>
              <h2 className="md-heading mb-4">{cat.label}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {cat.slugs.map((slug) => {
                  const s = getSport(slug)
                  if (!s) return null
                  return (
                    <Link
                      key={slug}
                      href={`/deportes/${slug}`}
                      className="md-card flex items-center gap-3 hover:border-md transition-colors group"
                    >
                      <SportLogo sport={s} size={48} emojiClass="text-4xl" className="shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-display font-bold uppercase text-base md:text-lg tracking-tight group-hover:text-md transition-colors">
                          {s.name}
                        </div>
                        <div className="font-mono text-[10px] text-ink3 uppercase truncate">{s.tagline}</div>
                      </div>
                      <span className="font-display text-md shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    </Link>
                  )
                })}
              </div>
            </section>
          ))}
        </div>

        {/* Back to football */}
        <section className="bg-md text-white p-6 md:p-10 text-center">
          <div className="eyebrow text-white/80 mb-2">NUESTRO DEPORTE REY</div>
          <h2 className="font-display font-bold text-3xl md:text-5xl uppercase tracking-tight mb-4">
            Vuelve al fútbol
          </h2>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Link href="/" className="btn-ghost border-white text-white hover:bg-white hover:text-md">Inicio</Link>
            <Link href="/partidos" className="btn-ghost border-white text-white hover:bg-white hover:text-md">Partidos</Link>
            <Link href="/ligas" className="btn-ghost border-white text-white hover:bg-white hover:text-md">Ligas</Link>
            <Link href="/goleadores" className="btn-ghost border-white text-white hover:bg-white hover:text-md">Goleadores</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
