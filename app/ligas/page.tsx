import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { getLeagues } from '@/lib/sportmonks/leagues'

export const revalidate = 3600

export default async function LeaguesPage() {
  const leagues = await getLeagues().catch(() => [])

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-md-black text-white p-6">
          <div className="md-bar -mx-6 -mt-6 mb-6" />
          <h1 className="font-display font-bold text-4xl md:text-5xl uppercase tracking-tight">
            Ligas & Competiciones
          </h1>
          <p className="font-sans text-white/60 mt-3">
            {leagues.length} competiciones disponibles a través de SportMonks.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {leagues.map((l) => (
            <Link
              key={l.id}
              href={`/ligas/${l.id}`}
              className="md-card flex items-center gap-3 hover:border-md transition-colors"
            >
              {l.image_path && (
                <Image src={l.image_path} alt={l.name} width={40} height={40} className="shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <div className="font-display font-semibold uppercase text-sm truncate">{l.name}</div>
                {l.short_code && (
                  <div className="font-mono text-[10px] text-ink3 uppercase">{l.short_code}</div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}
