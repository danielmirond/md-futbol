import Image from 'next/image'
import { SportHero } from '@/components/espn/sport-hero'
import { getTennisRankings } from '@/lib/espn/rankings'
import type { SportConfig } from '@/lib/sports/registry'

interface Props {
  sport: SportConfig
}

export async function TennisView({ sport }: Props) {
  const tour = sport.slug === 'atp' ? 'atp' : 'wta'
  const rankings = await getTennisRankings(tour)

  return (
    <>
      <SportHero eyebrow="RANKING MUNDIAL" sport={sport} subtitle={sport.tagline} />

      {rankings.length === 0 ? (
        <div className="md-card text-center py-12">
          <div className="eyebrow mb-2">SIN DATOS</div>
          <p className="font-sans text-ink2 text-sm">El ranking no está disponible en este momento.</p>
        </div>
      ) : (
        <section>
          <h2 className="md-heading mb-4">Top {Math.min(rankings.length, 100)}</h2>
          <div className="bg-paper border border-border">
            <div className="grid grid-cols-[3rem_auto_1fr_auto_auto] gap-3 items-center bg-md-black text-white px-4 py-2">
              <span className="eyebrow text-white/60">#</span>
              <span className="eyebrow text-white/60"></span>
              <span className="eyebrow text-white/60">Jugador</span>
              <span className="eyebrow text-white/60 text-right hidden md:block">Mov.</span>
              <span className="eyebrow text-white/60 text-right">Puntos</span>
            </div>
            <div className="divide-y divide-border">
              {rankings.slice(0, 100).map((r) => {
                const mov = r.movement ?? 0
                return (
                  <div
                    key={r.athlete?.id || r.rank}
                    className="grid grid-cols-[3rem_auto_1fr_auto_auto] gap-3 items-center px-4 py-2 hover:bg-surface"
                  >
                    <span className="font-display font-bold text-lg tabular-nums text-ink3">{r.rank}</span>
                    {r.athlete?.headshot?.href ? (
                      <Image src={r.athlete.headshot.href} alt="" width={32} height={32} className="bg-border" />
                    ) : (
                      <div className="w-8 h-8 bg-border" />
                    )}
                    <div className="min-w-0">
                      <div className="font-display font-semibold uppercase text-sm truncate">
                        {r.athlete?.displayName || r.athlete?.fullName || '-'}
                      </div>
                      {r.athlete?.flag?.href && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Image src={r.athlete.flag.href} alt="" width={14} height={10} />
                          <span className="font-mono text-[10px] text-ink3 uppercase">
                            {r.athlete.flag.alt}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="font-mono text-xs tabular-nums text-right hidden md:block">
                      {mov > 0 ? (
                        <span className="text-win">▲ {mov}</span>
                      ) : mov < 0 ? (
                        <span className="text-loss">▼ {Math.abs(mov)}</span>
                      ) : (
                        <span className="text-ink3">=</span>
                      )}
                    </span>
                    <span className="font-display font-bold text-base tabular-nums text-right">
                      {r.points?.toLocaleString('es-ES') ?? '-'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
