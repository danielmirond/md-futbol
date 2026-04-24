import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { FEATURED_LEAGUE_IDS, getFeaturedLeagues } from '@/lib/sportmonks/leagues'
import { getCurrentSeasonByLeague } from '@/lib/sportmonks/standings'
import { getTopScorersBySeason, type SmTopScorer } from '@/lib/sportmonks/players'

export const revalidate = 600

export const metadata = {
  title: 'Goleadores · MD Fútbol',
  description: 'Ranking de máximos goleadores combinado de La Liga, Champions, Europa League y Conference.',
}

interface GlobalScorer {
  player_id: number
  player?: SmTopScorer['player']
  total: number
  byLeague: Array<{ leagueId: number; leagueName: string; leagueImage: string | null; goals: number; teamId?: number; teamName?: string; teamImage?: string | null }>
}

interface PageProps {
  searchParams: { liga?: string }
}

export default async function GoleadoresPage({ searchParams }: PageProps) {
  const filterLeague = searchParams.liga && /^\d+$/.test(searchParams.liga) ? parseInt(searchParams.liga, 10) : null

  const leagues = await getFeaturedLeagues().catch(() => [])

  // Fetch top scorers for each featured league's current season in parallel
  const perLeague = await Promise.all(
    FEATURED_LEAGUE_IDS.map(async (leagueId) => {
      const seasonId = await getCurrentSeasonByLeague(leagueId).catch(() => null)
      if (!seasonId) return { leagueId, scorers: [] as SmTopScorer[] }
      const scorers = await getTopScorersBySeason(seasonId).catch(() => [])
      return { leagueId, scorers }
    }),
  )

  // Aggregate cross-league by player_id
  const map = new Map<number, GlobalScorer>()
  for (const { leagueId, scorers } of perLeague) {
    const league = leagues.find((l) => l.id === leagueId)
    for (const s of scorers) {
      if (!s.player_id || typeof s.total !== 'number') continue
      const existing = map.get(s.player_id)
      const entry = {
        leagueId,
        leagueName: league?.name || `Liga #${leagueId}`,
        leagueImage: league?.image_path || null,
        goals: s.total,
        teamId: s.participant?.id,
        teamName: s.participant?.name,
        teamImage: s.participant?.image_path,
      }
      if (existing) {
        existing.total += s.total
        existing.byLeague.push(entry)
      } else {
        map.set(s.player_id, {
          player_id: s.player_id,
          player: s.player,
          total: s.total,
          byLeague: [entry],
        })
      }
    }
  }

  let ranked = Array.from(map.values()).sort((a, b) => b.total - a.total)
  if (filterLeague) {
    ranked = ranked
      .map((r) => ({ ...r, byLeague: r.byLeague.filter((l) => l.leagueId === filterLeague) }))
      .filter((r) => r.byLeague.length > 0)
      .map((r) => ({ ...r, total: r.byLeague.reduce((s, e) => s + e.goals, 0) }))
      .sort((a, b) => b.total - a.total)
  }

  ranked = ranked.slice(0, 50)
  const topGoals = ranked[0]?.total || 0

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <section className="bg-md-black text-white p-6 md:p-10 relative">
          <div className="md-bar -mx-6 md:-mx-10 -mt-6 md:-mt-10 mb-6" />
          <div className="eyebrow text-md mb-2">RANKING GLOBAL</div>
          <h1 className="font-display font-bold text-4xl md:text-6xl uppercase tracking-tight mb-4">
            Top <span className="text-md">goleadores</span>
          </h1>
          <p className="font-sans text-white/60 max-w-2xl">
            Máximos anotadores combinando todas las competiciones destacadas. Los goles se suman a través de las ligas.
          </p>
        </section>

        {/* League filter pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Link
            href="/goleadores"
            className={`shrink-0 font-display uppercase text-xs tracking-wider px-3 py-1.5 border transition-colors ${
              !filterLeague ? 'border-md text-md bg-md/5' : 'border-border text-ink2 hover:border-md hover:text-md'
            }`}
          >
            Todas
          </Link>
          {leagues.map((l) => {
            const active = filterLeague === l.id
            return (
              <Link
                key={l.id}
                href={`/goleadores?liga=${l.id}`}
                className={`shrink-0 font-display uppercase text-xs tracking-wider px-3 py-1.5 border transition-colors inline-flex items-center gap-2 ${
                  active ? 'border-md text-md bg-md/5' : 'border-border text-ink2 hover:border-md hover:text-md'
                }`}
              >
                {l.image_path && <Image src={l.image_path} alt="" width={14} height={14} />}
                <span className="truncate max-w-[160px]">{l.name}</span>
              </Link>
            )
          })}
        </div>

        {ranked.length === 0 ? (
          <div className="md-card text-center py-12">
            <div className="eyebrow mb-2">SIN DATOS</div>
            <p className="font-sans text-ink2 text-sm">
              No hay goleadores disponibles para esta selección.
            </p>
          </div>
        ) : (
          <section className="bg-paper border border-border">
            <div className="grid grid-cols-[3rem_1fr_auto] md:grid-cols-[3rem_1fr_1fr_auto] gap-3 items-center bg-md-black text-white px-4 py-3">
              <span className="eyebrow text-white/60">#</span>
              <span className="eyebrow text-white/60">Jugador</span>
              <span className="eyebrow text-white/60 hidden md:block">Competiciones</span>
              <span className="eyebrow text-white/60 text-right">Goles</span>
            </div>
            <div className="divide-y divide-border">
              {ranked.map((r, i) => {
                const pct = topGoals > 0 ? (r.total / topGoals) * 100 : 0
                return (
                  <div
                    key={r.player_id}
                    className="grid grid-cols-[3rem_1fr_auto] md:grid-cols-[3rem_1fr_1fr_auto] gap-3 items-center px-4 py-3 hover:bg-surface"
                  >
                    <div className="font-display font-bold text-xl tabular-nums text-ink3">{i + 1}</div>
                    <Link href={`/jugadores/${r.player_id}`} className="flex items-center gap-3 min-w-0 hover:text-md">
                      {r.player?.image_path ? (
                        <Image src={r.player.image_path} alt={r.player.display_name || ''} width={32} height={32} className="shrink-0 bg-border" />
                      ) : (
                        <div className="w-8 h-8 bg-border shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="font-display font-bold uppercase text-sm truncate">
                          {r.player?.display_name || r.player?.name || `Jugador #${r.player_id}`}
                        </div>
                        {r.byLeague[0]?.teamName && (
                          <div className="font-mono text-[10px] text-ink3 uppercase truncate">
                            {r.byLeague[0].teamName}
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="hidden md:flex items-center gap-1.5 flex-wrap">
                      {r.byLeague.map((entry, idx) => (
                        <span
                          key={idx}
                          title={`${entry.goals} en ${entry.leagueName}`}
                          className="inline-flex items-center gap-1 bg-surface px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider"
                        >
                          {entry.leagueImage && <Image src={entry.leagueImage} alt="" width={12} height={12} />}
                          <span>{entry.goals}</span>
                        </span>
                      ))}
                    </div>
                    <div className="text-right">
                      <div className="font-display font-bold text-2xl tabular-nums text-md">{r.total}</div>
                      <div className="flex gap-[2px] h-1 mt-1 w-16 ml-auto">
                        <div className="bg-md" style={{ width: `${pct}%` }} />
                        <div className="bg-border flex-1" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}
