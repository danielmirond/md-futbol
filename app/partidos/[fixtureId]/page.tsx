import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { getFixture } from '@/lib/sportmonks/fixtures'
import { formatTime } from '@/lib/utils'

export const revalidate = 60

interface PageProps {
  params: { fixtureId: string }
}

export default async function FixturePage({ params: { fixtureId } }: PageProps) {
  const id = parseInt(fixtureId, 10)
  const fixture = !isNaN(id) ? await getFixture(id) : null

  if (!fixture) {
    return (
      <>
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="eyebrow mb-2">404</p>
          <h1 className="font-display text-3xl uppercase mb-4">Partido no encontrado</h1>
          <Link href="/" className="btn-ghost inline-block">← Volver al inicio</Link>
        </main>
        <Footer />
      </>
    )
  }

  const home = fixture.participants?.find((p) => p.meta?.location === 'home')
  const away = fixture.participants?.find((p) => p.meta?.location === 'away')
  const homeScore = fixture.scores?.find(
    (s) => s.score?.participant === 'home' && s.description === 'CURRENT',
  )?.score.goals
  const awayScore = fixture.scores?.find(
    (s) => s.score?.participant === 'away' && s.description === 'CURRENT',
  )?.score.goals
  const started = fixture.state?.developer_name !== 'NS' && fixture.state?.short_name !== 'NS'
  const events = (fixture as any).events as any[] | undefined

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Hero match */}
        <section className="bg-md-black text-white relative">
          <div className="md-bar" />
          <div className="p-6 md:p-10">
            <div className="flex items-center justify-between mb-6">
              <div className="eyebrow text-md">
                {fixture.league?.name} {fixture.round?.name ? `· J${fixture.round.name}` : ''}
              </div>
              {started && fixture.state && (
                <span className="pill pill-live">● {fixture.state.short_name}</span>
              )}
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 md:gap-10">
              <div className="flex flex-col items-center text-center">
                {home?.image_path && (
                  <Image src={home.image_path} alt={home.name} width={96} height={96} />
                )}
                <span className="font-display font-bold uppercase text-xl md:text-3xl mt-4">
                  {home?.name}
                </span>
              </div>

              <div className="text-center">
                {started ? (
                  <div className="font-display font-bold text-5xl md:text-8xl tabular-nums leading-none">
                    {homeScore ?? '-'}
                    <span className="text-md mx-1 md:mx-3">:</span>
                    {awayScore ?? '-'}
                  </div>
                ) : (
                  <div className="font-mono text-2xl md:text-3xl font-semibold text-white/80">
                    {formatTime(fixture.starting_at)}
                  </div>
                )}
                {fixture.venue?.name && (
                  <div className="eyebrow text-white/60 mt-2">{fixture.venue.name}</div>
                )}
              </div>

              <div className="flex flex-col items-center text-center">
                {away?.image_path && (
                  <Image src={away.image_path} alt={away.name} width={96} height={96} />
                )}
                <span className="font-display font-bold uppercase text-xl md:text-3xl mt-4">
                  {away?.name}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Events */}
        {events && events.length > 0 && (
          <section>
            <h2 className="md-heading mb-4">Eventos</h2>
            <div className="bg-paper border border-border divide-y divide-border">
              {events
                .sort((a: any, b: any) => (a.minute || 0) - (b.minute || 0))
                .map((ev: any) => (
                  <div key={ev.id} className="flex items-center gap-4 p-3">
                    <div className="w-10 font-display font-bold text-md text-right">
                      {ev.minute || '-'}&apos;
                    </div>
                    <div className="text-2xl">
                      {ev.type_id === 14 || ev.type === 'goal' ? '⚽' : ''}
                      {ev.type_id === 19 || ev.type === 'yellowcard' ? '🟨' : ''}
                      {ev.type_id === 20 || ev.type === 'redcard' ? '🟥' : ''}
                      {ev.type_id === 83 ? '🔄' : ''}
                    </div>
                    <div className="flex-1">
                      <div className="font-display font-semibold text-sm uppercase">
                        {ev.player_name || ev.addition || '—'}
                      </div>
                      {ev.result && (
                        <div className="font-mono text-[11px] text-ink3">{ev.result}</div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Info */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md-card">
            <div className="eyebrow mb-1">Fecha</div>
            <div className="font-display font-semibold">
              {new Date(fixture.starting_at).toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </div>
          </div>
          <div className="md-card">
            <div className="eyebrow mb-1">Hora</div>
            <div className="font-display font-semibold">{formatTime(fixture.starting_at)}</div>
          </div>
          <div className="md-card">
            <div className="eyebrow mb-1">Competición</div>
            <Link
              href={`/ligas/${fixture.league_id}`}
              className="font-display font-semibold uppercase hover:text-md"
            >
              {fixture.league?.name || '-'}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
