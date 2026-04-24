import Image from 'next/image'
import { SportHero } from '@/components/espn/sport-hero'
import { getMmaEvents } from '@/lib/espn/rankings'
import type { SportConfig } from '@/lib/sports/registry'

interface Props {
  sport: SportConfig
}

export async function MmaView({ sport }: Props) {
  const promotion = sport.espnPath.replace('mma/', '')
  const events = await getMmaEvents(promotion)

  const now = Date.now()
  const upcoming = events.filter((e) => new Date(e.date).getTime() >= now - 3600_000)
  const past = events.filter((e) => new Date(e.date).getTime() < now - 3600_000)

  return (
    <>
      <SportHero
        eyebrow="CARTELERA"
        title={sport.name}
        accent={sport.accent || '#E30613'}
        subtitle={sport.tagline}
        icon={sport.icon}
      />

      {events.length === 0 ? (
        <div className="md-card text-center py-12">
          <div className="eyebrow mb-2">SIN EVENTOS</div>
          <p className="font-sans text-ink2 text-sm">Sin eventos programados actualmente.</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section className="space-y-6">
              <h2 className="md-heading">Próximos eventos</h2>
              {upcoming.map((ev) => (
                <div key={ev.id} className="bg-paper border border-border">
                  <div className="p-4 bg-md-black text-white">
                    <div className="eyebrow text-md">
                      {new Date(ev.date).toLocaleDateString('es-ES', {
                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </div>
                    <div className="font-display font-bold text-xl md:text-2xl uppercase leading-tight mt-1">
                      {ev.name}
                    </div>
                    {ev.venue && <div className="font-mono text-[10px] text-white/60 uppercase mt-1">{ev.venue}</div>}
                  </div>
                  <div className="divide-y divide-border">
                    {ev.fights.slice(0, 8).map((f, i) => (
                      <div key={i} className="p-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                        <div className="flex items-center gap-2 justify-end text-right min-w-0">
                          <span className={`font-display font-semibold uppercase text-sm truncate ${f.fighters[0]?.winner ? 'text-md' : ''}`}>
                            {f.fighters[0]?.name || 'TBD'}
                          </span>
                          {f.fighters[0]?.image && (
                            <Image src={f.fighters[0].image} alt="" width={32} height={32} className="shrink-0 bg-border" />
                          )}
                        </div>
                        <div className="font-mono text-xs text-ink3 uppercase tracking-wider text-center">VS</div>
                        <div className="flex items-center gap-2 min-w-0">
                          {f.fighters[1]?.image && (
                            <Image src={f.fighters[1].image} alt="" width={32} height={32} className="shrink-0 bg-border" />
                          )}
                          <span className={`font-display font-semibold uppercase text-sm truncate ${f.fighters[1]?.winner ? 'text-md' : ''}`}>
                            {f.fighters[1]?.name || 'TBD'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 className="md-heading mb-4">Eventos recientes</h2>
              <div className="bg-paper border border-border divide-y divide-border">
                {past.slice(0, 5).map((ev) => (
                  <div key={ev.id} className="p-3">
                    <div className="font-display font-semibold uppercase text-sm">{ev.name}</div>
                    <div className="font-mono text-[10px] text-ink3 uppercase mt-0.5">
                      {new Date(ev.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {ev.venue ? ` · ${ev.venue}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </>
  )
}
