import Link from 'next/link'
import Image from 'next/image'
import type { SmFixture } from '@/lib/sportmonks/types'
import { formatTime } from '@/lib/utils'

interface Props {
  fixture: SmFixture
}

function getStateBadge(state?: SmFixture['state']) {
  if (!state) return null
  const sn = state.short_name?.toUpperCase() || ''
  const dn = state.developer_name || ''
  if (['LIVE', 'HT', 'INPLAY_1ST_HALF', 'INPLAY_2ND_HALF'].some((k) => dn.includes(k)) || sn === 'LIVE') {
    return <span className="pill pill-live">● EN VIVO</span>
  }
  if (dn === 'FT' || dn === 'AET' || sn === 'FT') {
    return <span className="pill pill-finished">FINALIZADO</span>
  }
  if (dn === 'NS' || sn === 'NS') {
    return <span className="pill pill-scheduled">PROGRAMADO</span>
  }
  return <span className="pill pill-scheduled">{state.short_name}</span>
}

export function FixtureCard({ fixture }: Props) {
  const home = fixture.participants?.find((p) => p.meta?.location === 'home')
  const away = fixture.participants?.find((p) => p.meta?.location === 'away')

  const homeScore = fixture.scores?.find(
    (s) => s.score?.participant === 'home' && s.description === 'CURRENT',
  )?.score.goals
  const awayScore = fixture.scores?.find(
    (s) => s.score?.participant === 'away' && s.description === 'CURRENT',
  )?.score.goals

  const started = fixture.state?.developer_name !== 'NS' && fixture.state?.short_name !== 'NS'

  return (
    <Link
      href={`/partidos/${fixture.id}`}
      className="md-card block group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {fixture.league?.image_path && (
            <Image
              src={fixture.league.image_path}
              alt={fixture.league.name}
              width={16}
              height={16}
              className="shrink-0"
            />
          )}
          <span className="eyebrow truncate">{fixture.league?.name || ''}</span>
        </div>
        {getStateBadge(fixture.state)}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex items-center gap-2 justify-end text-right min-w-0">
          <span className="font-display font-semibold uppercase text-sm md:text-base truncate">
            {home?.name || ''}
          </span>
          {home?.image_path && (
            <Image src={home.image_path} alt={home.name} width={28} height={28} className="shrink-0" />
          )}
        </div>

        <div className="text-center min-w-[4.5rem]">
          {started ? (
            <span className="font-display font-bold text-2xl md:text-3xl tabular-nums">
              {homeScore ?? '-'}
              <span className="text-md mx-1">:</span>
              {awayScore ?? '-'}
            </span>
          ) : (
            <span className="font-mono text-base font-semibold text-ink2">
              {formatTime(fixture.starting_at)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 min-w-0">
          {away?.image_path && (
            <Image src={away.image_path} alt={away.name} width={28} height={28} className="shrink-0" />
          )}
          <span className="font-display font-semibold uppercase text-sm md:text-base truncate">
            {away?.name || ''}
          </span>
        </div>
      </div>
    </Link>
  )
}
