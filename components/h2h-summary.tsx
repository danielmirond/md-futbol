import Link from 'next/link'
import Image from 'next/image'
import type { SmFixture } from '@/lib/sportmonks/types'

interface Props {
  fixtures: SmFixture[]
  homeTeamId: number
  homeTeamName: string
  homeImagePath?: string | null
  awayTeamId: number
  awayTeamName: string
  awayImagePath?: string | null
}

interface Totals {
  played: number
  homeWins: number
  awayWins: number
  draws: number
  goalsHome: number
  goalsAway: number
}

function aggregate(fixtures: SmFixture[], homeId: number, awayId: number): Totals {
  const t: Totals = { played: 0, homeWins: 0, awayWins: 0, draws: 0, goalsHome: 0, goalsAway: 0 }
  for (const f of fixtures) {
    const hScore = f.scores?.find((s) => s.score?.participant === 'home' && s.description === 'CURRENT')?.score.goals
    const aScore = f.scores?.find((s) => s.score?.participant === 'away' && s.description === 'CURRENT')?.score.goals
    if (typeof hScore !== 'number' || typeof aScore !== 'number') continue

    const mHome = f.participants?.find((p) => p.meta?.location === 'home')
    if (!mHome) continue

    // Map home/away of each historic fixture to our current home/away perspective
    const hIsOurHome = mHome.id === homeId
    const ourHomeGoals = hIsOurHome ? hScore : aScore
    const ourAwayGoals = hIsOurHome ? aScore : hScore

    t.played++
    t.goalsHome += ourHomeGoals
    t.goalsAway += ourAwayGoals

    if (ourHomeGoals > ourAwayGoals) t.homeWins++
    else if (ourAwayGoals > ourHomeGoals) t.awayWins++
    else t.draws++
  }
  return t
}

function currentStreak(fixtures: SmFixture[], homeId: number): { streak: number; kind: 'H' | 'A' | 'D' } | null {
  // Fixtures assumed already sorted desc by starting_at by caller; use first N same-outcome
  const finished = [...fixtures].sort((a, b) => b.starting_at.localeCompare(a.starting_at))
  let kind: 'H' | 'A' | 'D' | null = null
  let streak = 0
  for (const f of finished) {
    const hScore = f.scores?.find((s) => s.score?.participant === 'home' && s.description === 'CURRENT')?.score.goals
    const aScore = f.scores?.find((s) => s.score?.participant === 'away' && s.description === 'CURRENT')?.score.goals
    if (typeof hScore !== 'number' || typeof aScore !== 'number') continue
    const mHome = f.participants?.find((p) => p.meta?.location === 'home')
    if (!mHome) continue
    const hIsOurHome = mHome.id === homeId
    const ourHome = hIsOurHome ? hScore : aScore
    const ourAway = hIsOurHome ? aScore : hScore
    const outcome: 'H' | 'A' | 'D' = ourHome > ourAway ? 'H' : ourAway > ourHome ? 'A' : 'D'
    if (kind === null) {
      kind = outcome
      streak = 1
    } else if (kind === outcome) {
      streak++
    } else {
      break
    }
  }
  return kind ? { streak, kind } : null
}

export function H2HSummary({
  fixtures,
  homeTeamId,
  homeTeamName,
  homeImagePath,
  awayTeamId,
  awayTeamName,
  awayImagePath,
}: Props) {
  if (fixtures.length === 0) return null

  const t = aggregate(fixtures, homeTeamId, awayTeamId)
  const streak = currentStreak(fixtures, homeTeamId)

  const homePct = t.played > 0 ? (t.homeWins / t.played) * 100 : 0
  const drawPct = t.played > 0 ? (t.draws / t.played) * 100 : 0
  const awayPct = t.played > 0 ? (t.awayWins / t.played) * 100 : 0

  const streakLabel = streak
    ? streak.kind === 'H'
      ? `${streak.streak} victoria${streak.streak > 1 ? 's' : ''} seguida${streak.streak > 1 ? 's' : ''} ${homeTeamName}`
      : streak.kind === 'A'
      ? `${streak.streak} victoria${streak.streak > 1 ? 's' : ''} seguida${streak.streak > 1 ? 's' : ''} ${awayTeamName}`
      : `${streak.streak} empate${streak.streak > 1 ? 's' : ''} seguido${streak.streak > 1 ? 's' : ''}`
    : null

  return (
    <section>
      <h2 className="md-heading mb-4">Cara a cara · {t.played} partido{t.played !== 1 ? 's' : ''}</h2>
      <div className="bg-paper border border-border p-4 md:p-6 space-y-5">
        {/* Win distribution */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 md:gap-6">
          <div className="flex items-center gap-2 justify-end text-right min-w-0">
            {homeImagePath && <Image src={homeImagePath} alt={homeTeamName} width={28} height={28} />}
            <div>
              <div className="font-display font-bold text-3xl md:text-4xl tabular-nums">{t.homeWins}</div>
              <div className="eyebrow">Victorias</div>
            </div>
          </div>
          <div className="text-center">
            <div className="font-display font-bold text-2xl md:text-3xl tabular-nums text-ink3">{t.draws}</div>
            <div className="eyebrow">Empates</div>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <div>
              <div className="font-display font-bold text-3xl md:text-4xl tabular-nums">{t.awayWins}</div>
              <div className="eyebrow">Victorias</div>
            </div>
            {awayImagePath && <Image src={awayImagePath} alt={awayTeamName} width={28} height={28} />}
          </div>
        </div>

        {/* Proportional bar */}
        <div className="flex gap-[2px] h-2">
          {t.homeWins > 0 && <div className="bg-md" style={{ width: `${homePct}%` }} title={`${t.homeWins} V ${homeTeamName}`} />}
          {t.draws > 0 && <div className="bg-ink3" style={{ width: `${drawPct}%` }} title={`${t.draws} empates`} />}
          {t.awayWins > 0 && <div className="bg-md-black" style={{ width: `${awayPct}%` }} title={`${t.awayWins} V ${awayTeamName}`} />}
        </div>

        {/* Goals + streak */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-center border-t border-border pt-4">
          <div>
            <div className="eyebrow mb-1">Goles totales</div>
            <div className="font-display font-bold text-2xl tabular-nums">
              <span>{t.goalsHome}</span>
              <span className="text-md mx-2">:</span>
              <span>{t.goalsAway}</span>
            </div>
          </div>
          <div>
            <div className="eyebrow mb-1">Media por partido</div>
            <div className="font-display font-bold text-2xl tabular-nums">
              {t.played > 0 ? ((t.goalsHome + t.goalsAway) / t.played).toFixed(2) : '0.00'}
            </div>
          </div>
          {streakLabel && (
            <div className="col-span-2 md:col-span-1">
              <div className="eyebrow mb-1">Racha</div>
              <div className="font-display font-semibold text-sm uppercase leading-tight">{streakLabel}</div>
            </div>
          )}
        </div>

        {/* Recent matches list */}
        <div className="border-t border-border pt-4 -mx-4 md:-mx-6">
          <div className="eyebrow px-4 md:px-6 mb-2">ÚLTIMOS PARTIDOS</div>
          <div className="divide-y divide-border">
            {fixtures.slice(0, 10).map((m) => {
              const mHome = m.participants?.find((p) => p.meta?.location === 'home')
              const mAway = m.participants?.find((p) => p.meta?.location === 'away')
              const mHs = m.scores?.find((s) => s.score?.participant === 'home' && s.description === 'CURRENT')?.score.goals
              const mAs = m.scores?.find((s) => s.score?.participant === 'away' && s.description === 'CURRENT')?.score.goals
              return (
                <Link key={m.id} href={`/partidos/${m.id}`} className="flex items-center gap-4 px-4 md:px-6 py-2.5 hover:bg-surface">
                  <div className="eyebrow w-24 truncate">
                    {new Date(m.starting_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: '2-digit' })}
                  </div>
                  <div className="flex-1 flex items-center gap-2 justify-end min-w-0">
                    <span className="font-display font-semibold uppercase text-sm truncate">{mHome?.name}</span>
                    {mHome?.image_path && <Image src={mHome.image_path} alt={mHome.name} width={18} height={18} />}
                  </div>
                  <div className="font-display font-bold text-lg tabular-nums w-16 text-center">
                    {mHs ?? '-'} : {mAs ?? '-'}
                  </div>
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    {mAway?.image_path && <Image src={mAway.image_path} alt={mAway.name} width={18} height={18} />}
                    <span className="font-display font-semibold uppercase text-sm truncate">{mAway?.name}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
