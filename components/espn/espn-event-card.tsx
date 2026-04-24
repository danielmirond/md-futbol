import Image from 'next/image'
import type { EspnEvent } from '@/lib/espn/types'
import { getEventScore } from '@/lib/espn/scoreboard'

interface Props {
  event: EspnEvent
}

function StatusBadge({ state, detail, short }: { state?: string; detail?: string; short?: string }) {
  if (state === 'in') {
    return (
      <span className="pill pill-live">● {short || detail || 'EN VIVO'}</span>
    )
  }
  if (state === 'post') {
    return <span className="pill pill-finished">{short || 'FINAL'}</span>
  }
  return <span className="pill pill-scheduled">{short || 'PRÓXIMO'}</span>
}

export function EspnEventCard({ event }: Props) {
  const { homeTeam, awayTeam, statusState, statusDetail, statusShort } = getEventScore(event)
  const started = statusState === 'in' || statusState === 'post'
  const league = event.leagues?.[0]
  const time = new Date(event.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

  return (
    <article className="md-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {league?.logos?.[0]?.href && (
            <Image src={league.logos[0].href} alt={league.name} width={16} height={16} className="shrink-0" />
          )}
          <span className="eyebrow truncate">
            {league?.name || event.shortName || ''}
          </span>
        </div>
        <StatusBadge state={statusState} detail={statusDetail} short={statusShort} />
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex items-center gap-2 justify-end text-right min-w-0">
          <span className={`font-display font-semibold uppercase text-sm md:text-base truncate ${homeTeam?.winner ? '' : 'text-ink2'}`}>
            {homeTeam?.name || '-'}
          </span>
          {homeTeam?.logo && (
            <Image src={homeTeam.logo} alt={homeTeam.name} width={28} height={28} className="shrink-0" />
          )}
        </div>

        <div className="text-center min-w-[4.5rem]">
          {started ? (
            <span className="font-display font-bold text-2xl md:text-3xl tabular-nums">
              {homeTeam?.score ?? '-'}
              <span className="text-md mx-1">:</span>
              {awayTeam?.score ?? '-'}
            </span>
          ) : (
            <span className="font-mono text-base font-semibold text-ink2">{time}</span>
          )}
        </div>

        <div className="flex items-center gap-2 min-w-0">
          {awayTeam?.logo && (
            <Image src={awayTeam.logo} alt={awayTeam.name} width={28} height={28} className="shrink-0" />
          )}
          <span className={`font-display font-semibold uppercase text-sm md:text-base truncate ${awayTeam?.winner ? '' : 'text-ink2'}`}>
            {awayTeam?.name || '-'}
          </span>
        </div>
      </div>
    </article>
  )
}
