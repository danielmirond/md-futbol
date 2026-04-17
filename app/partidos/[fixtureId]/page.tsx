import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { LiveRefresher } from '@/components/live-refresher'
import { Chronicle } from '@/components/chronicle'
import { MatchTimelineHeatmap } from '@/components/match-timeline-heatmap'
import { getFixture, getHeadToHead } from '@/lib/sportmonks/fixtures'
import { formatTime } from '@/lib/utils'

export const revalidate = 30

interface PageProps { params: { fixtureId: string } }

function eventIcon(event: any): string {
  const typeName = event.type?.developer_name || event.type_name || ''
  if (typeName.includes('GOAL') || event.type_id === 14) return '⚽'
  if (typeName.includes('YELLOW') || event.type_id === 19) return '🟨'
  if (typeName.includes('RED') || event.type_id === 20) return '🟥'
  if (typeName.includes('SUB') || event.type_id === 83) return '🔄'
  if (typeName.includes('PEN') || typeName.includes('PENALTY')) return '🎯'
  if (typeName.includes('VAR')) return '📺'
  return '•'
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
  const isLive =
    fixture.state?.developer_name?.includes('INPLAY') ||
    fixture.state?.developer_name === 'LIVE' ||
    fixture.state?.developer_name === 'HT'
  const events = (fixture as any).events as any[] | undefined
  const statistics = (fixture as any).statistics as any[] | undefined

  const h2h = home && away ? await getHeadToHead(home.id, away.id).catch(() => []) : []

  const homeEvents = events?.filter((e) => e.participant_id === home?.id) || []
  const awayEvents = events?.filter((e) => e.participant_id === away?.id) || []
  const homeStats = statistics?.filter((s: any) => s.participant_id === home?.id) || []
  const awayStats = statistics?.filter((s: any) => s.participant_id === away?.id) || []

  const statByType = (stats: any[], devName: string) =>
    stats.find((s) => s.type?.developer_name === devName)?.data?.value ?? '-'

  const STAT_ROWS = [
    { key: 'BALL_POSSESSION', label: 'Posesión' },
    { key: 'SHOTS_TOTAL', label: 'Tiros' },
    { key: 'SHOTS_ON_TARGET', label: 'Tiros a puerta' },
    { key: 'CORNERS', label: 'Córners' },
    { key: 'FOULS', label: 'Faltas' },
    { key: 'OFFSIDES', label: 'Fueras de juego' },
    { key: 'YELLOWCARDS', label: 'Amarillas' },
    { key: 'REDCARDS', label: 'Rojas' },
    { key: 'PASSES', label: 'Pases' },
  ]

  return (
    <>
      <Header />
      {isLive && <LiveRefresher intervalMs={30000} />}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Hero match */}
        <section className="bg-md-black text-white relative">
          <div className="md-bar" />
          <div className="p-6 md:p-10">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
              <div className="eyebrow text-md">
                {fixture.league?.name} {fixture.round?.name ? `· J${fixture.round.name}` : ''}
                {fixture.leg ? ` · IDA/VUELTA ${fixture.leg}` : ''}
              </div>
              {isLive && <span className="pill pill-live">● {fixture.state?.short_name}</span>}
              {fixture.state?.developer_name === 'FT' && <span className="pill pill-finished">FINAL</span>}
              {fixture.state?.developer_name === 'AET' && <span className="pill pill-finished">PRÓRROGA</span>}
            </div>

            {fixture.result_info && (
              <div className="mb-4 text-center">
                <span className="inline-block bg-accent text-md-black font-display font-bold uppercase text-xs md:text-sm tracking-wider px-4 py-2">
                  🏆 {fixture.result_info}
                </span>
              </div>
            )}

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 md:gap-10">
              <Link href={`/equipos/${home?.id}`} className="flex flex-col items-center text-center hover:text-md">
                {home?.image_path && <Image src={home.image_path} alt={home.name} width={96} height={96} />}
                <span className="font-display font-bold uppercase text-xl md:text-3xl mt-4">{home?.name}</span>
              </Link>

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

              <Link href={`/equipos/${away?.id}`} className="flex flex-col items-center text-center hover:text-md">
                {away?.image_path && <Image src={away.image_path} alt={away.name} width={96} height={96} />}
                <span className="font-display font-bold uppercase text-xl md:text-3xl mt-4">{away?.name}</span>
              </Link>
            </div>
          </div>
        </section>

        {/* AI Chronicle — only for finished matches */}
        {fixture.state?.developer_name === 'FT' && (
          <Chronicle fixtureId={fixture.id} />
        )}

        {/* Events */}
        {events && events.length > 0 && (
          <section>
            <h2 className="md-heading mb-4">Eventos del partido</h2>
            <div className="grid grid-cols-2 gap-[1px] bg-border">
              <div className="bg-paper p-3">
                <div className="eyebrow text-md mb-3 pb-2 border-b border-border">
                  {home?.name?.toUpperCase()}
                </div>
                <div className="space-y-2">
                  {homeEvents
                    .sort((a, b) => (a.minute || 0) - (b.minute || 0))
                    .map((ev) => (
                      <div key={ev.id} className="flex items-center gap-2">
                        <div className="w-10 font-mono font-bold text-md text-right text-sm">{ev.minute || '-'}&apos;</div>
                        <div className="text-lg">{eventIcon(ev)}</div>
                        <div className="flex-1 font-sans text-sm text-ink truncate">
                          {ev.player_name || ev.addition || '—'}
                        </div>
                      </div>
                    ))}
                  {homeEvents.length === 0 && <div className="text-ink3 font-mono text-xs py-2">Sin eventos.</div>}
                </div>
              </div>
              <div className="bg-paper p-3">
                <div className="eyebrow text-md mb-3 pb-2 border-b border-border text-right">
                  {away?.name?.toUpperCase()}
                </div>
                <div className="space-y-2">
                  {awayEvents
                    .sort((a, b) => (a.minute || 0) - (b.minute || 0))
                    .map((ev) => (
                      <div key={ev.id} className="flex items-center gap-2 flex-row-reverse">
                        <div className="w-10 font-mono font-bold text-md text-left text-sm">{ev.minute || '-'}&apos;</div>
                        <div className="text-lg">{eventIcon(ev)}</div>
                        <div className="flex-1 font-sans text-sm text-ink truncate text-right">
                          {ev.player_name || ev.addition || '—'}
                        </div>
                      </div>
                    ))}
                  {awayEvents.length === 0 && <div className="text-ink3 font-mono text-xs py-2 text-right">Sin eventos.</div>}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Timeline heatmap */}
        {events && events.length > 0 && home && away && (
          <section>
            <MatchTimelineHeatmap
              events={events}
              homeTeamId={home.id}
              awayTeamId={away.id}
              homeTeamName={home.name}
              awayTeamName={away.name}
            />
          </section>
        )}

        {/* Statistics */}
        {statistics && statistics.length > 0 && (
          <section>
            <h2 className="md-heading mb-4">Estadísticas</h2>
            <div className="bg-paper border border-border p-4 space-y-3">
              {STAT_ROWS.map((row) => {
                const homeVal = statByType(homeStats, row.key)
                const awayVal = statByType(awayStats, row.key)
                if (homeVal === '-' && awayVal === '-') return null

                const homeNum = parseInt(String(homeVal), 10) || 0
                const awayNum = parseInt(String(awayVal), 10) || 0
                const total = homeNum + awayNum
                const homePct = total > 0 ? (homeNum / total) * 100 : 50
                const awayPct = total > 0 ? (awayNum / total) * 100 : 50

                return (
                  <div key={row.key}>
                    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                      <span className="font-display font-bold text-base tabular-nums w-10 text-right">{homeVal}</span>
                      <span className="eyebrow text-center">{row.label}</span>
                      <span className="font-display font-bold text-base tabular-nums w-10">{awayVal}</span>
                    </div>
                    <div className="flex gap-[2px] h-1.5 mt-1">
                      <div className="bg-md" style={{ width: `${homePct}%` }} />
                      <div className="bg-ink3" style={{ width: `${awayPct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Head-to-head */}
        {h2h.length > 0 && (
          <section>
            <h2 className="md-heading mb-4">Cara a cara · Últimos {h2h.length}</h2>
            <div className="bg-paper border border-border divide-y divide-border">
              {h2h.map((m: any) => {
                const mHome = m.participants?.find((p: any) => p.meta?.location === 'home')
                const mAway = m.participants?.find((p: any) => p.meta?.location === 'away')
                const mHs = m.scores?.find((s: any) => s.score?.participant === 'home' && s.description === 'CURRENT')?.score.goals
                const mAs = m.scores?.find((s: any) => s.score?.participant === 'away' && s.description === 'CURRENT')?.score.goals
                return (
                  <Link key={m.id} href={`/partidos/${m.id}`} className="flex items-center gap-4 p-3 hover:bg-surface">
                    <div className="eyebrow w-24 truncate">
                      {new Date(m.starting_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="flex-1 flex items-center gap-3 justify-end min-w-0">
                      <span className="font-display font-semibold uppercase text-sm truncate">{mHome?.name}</span>
                      {mHome?.image_path && <Image src={mHome.image_path} alt={mHome.name} width={20} height={20} />}
                    </div>
                    <div className="font-display font-bold text-lg tabular-nums w-16 text-center">
                      {mHs ?? '-'} : {mAs ?? '-'}
                    </div>
                    <div className="flex-1 flex items-center gap-3 min-w-0">
                      {mAway?.image_path && <Image src={mAway.image_path} alt={mAway.name} width={20} height={20} />}
                      <span className="font-display font-semibold uppercase text-sm truncate">{mAway?.name}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* Info */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md-card">
            <div className="eyebrow mb-1">Fecha</div>
            <div className="font-display font-semibold">
              {new Date(fixture.starting_at).toLocaleDateString('es-ES', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
              })}
            </div>
          </div>
          <div className="md-card">
            <div className="eyebrow mb-1">Hora</div>
            <div className="font-display font-semibold">{formatTime(fixture.starting_at)}</div>
          </div>
          <div className="md-card">
            <div className="eyebrow mb-1">Competición</div>
            <Link href={`/ligas/${fixture.league_id}`} className="font-display font-semibold uppercase hover:text-md">
              {fixture.league?.name || '-'}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
