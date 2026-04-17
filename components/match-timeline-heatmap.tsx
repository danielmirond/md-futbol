interface MatchEvent {
  minute: number | null
  type_id?: number
  participant_id?: number
  addition?: string
  type?: { developer_name?: string }
}

interface Props {
  events: MatchEvent[]
  homeTeamId: number
  awayTeamId: number
  homeTeamName: string
  awayTeamName: string
}

const BUCKET_SIZE = 5  // 5-minute buckets
const TOTAL_BUCKETS = 18 // 0-5, 5-10, ..., 85-90

function isGoal(e: MatchEvent): boolean {
  const name = e.type?.developer_name || ''
  return name.includes('GOAL') || e.type_id === 14 || /goal/i.test(e.addition || '')
}

function isCard(e: MatchEvent): boolean {
  const name = e.type?.developer_name || ''
  return name.includes('YELLOW') || name.includes('RED') || e.type_id === 19 || e.type_id === 20
}

export function MatchTimelineHeatmap({ events, homeTeamId, awayTeamId, homeTeamName, awayTeamName }: Props) {
  // Aggregate events into buckets
  const homeGoals = new Array(TOTAL_BUCKETS).fill(0) as number[]
  const awayGoals = new Array(TOTAL_BUCKETS).fill(0) as number[]
  const homeEvents = new Array(TOTAL_BUCKETS).fill(0) as number[]
  const awayEvents = new Array(TOTAL_BUCKETS).fill(0) as number[]

  for (const e of events) {
    if (e.minute == null) continue
    const bucket = Math.min(TOTAL_BUCKETS - 1, Math.floor(e.minute / BUCKET_SIZE))
    if (e.participant_id === homeTeamId) {
      homeEvents[bucket]++
      if (isGoal(e)) homeGoals[bucket]++
    } else if (e.participant_id === awayTeamId) {
      awayEvents[bucket]++
      if (isGoal(e)) awayGoals[bucket]++
    }
  }

  const maxEvents = Math.max(...homeEvents, ...awayEvents, 1)

  const Row = ({ counts, goals, align }: { counts: number[]; goals: number[]; align: 'home' | 'away' }) => (
    <div className="flex gap-[2px]">
      {counts.map((c, i) => {
        const intensity = c / maxEvents
        const hasGoal = goals[i] > 0
        const bg = intensity === 0
          ? 'bg-border'
          : intensity < 0.3
          ? align === 'home' ? 'bg-md/20' : 'bg-md/20'
          : intensity < 0.6
          ? 'bg-md/50'
          : 'bg-md'

        return (
          <div
            key={i}
            title={`${i * BUCKET_SIZE}-${(i + 1) * BUCKET_SIZE}' · ${c} eventos${hasGoal ? ` · ${goals[i]} gol(es)` : ''}`}
            className={`flex-1 h-8 md:h-10 flex items-center justify-center relative transition-all hover:brightness-110 cursor-default ${bg}`}
          >
            {hasGoal && (
              <span className="absolute top-1/2 -translate-y-1/2 text-[10px] md:text-xs font-display font-bold text-white">
                ⚽{goals[i] > 1 ? goals[i] : ''}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="bg-paper border border-border p-4 md:p-5 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="eyebrow text-md">📊 HEATMAP · ACTIVIDAD POR TRAMOS DE 5 MIN</span>
        <span className="font-mono text-[10px] text-ink3">
          {events.length} eventos · ⚽ = gol
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-display font-semibold uppercase text-xs truncate">
            {homeTeamName}
          </span>
          <span className="font-mono text-[10px] text-ink3">
            {homeGoals.reduce((a, b) => a + b, 0)} ⚽ · {homeEvents.reduce((a, b) => a + b, 0)} ev
          </span>
        </div>
        <Row counts={homeEvents} goals={homeGoals} align="home" />

        <Row counts={awayEvents} goals={awayGoals} align="away" />
        <div className="flex items-center justify-between">
          <span className="font-display font-semibold uppercase text-xs truncate">
            {awayTeamName}
          </span>
          <span className="font-mono text-[10px] text-ink3">
            {awayGoals.reduce((a, b) => a + b, 0)} ⚽ · {awayEvents.reduce((a, b) => a + b, 0)} ev
          </span>
        </div>
      </div>

      {/* Axis labels: 0', 15', 30', 45' (HT), 60', 75', 90' */}
      <div className="flex text-[9px] font-mono text-ink3 -mt-1">
        <span className="flex-1">0&apos;</span>
        <span className="flex-1 text-center">15&apos;</span>
        <span className="flex-1 text-center">30&apos;</span>
        <span className="flex-1 text-center font-bold text-md">HT</span>
        <span className="flex-1 text-center">60&apos;</span>
        <span className="flex-1 text-center">75&apos;</span>
        <span className="flex-1 text-right">90&apos;</span>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <span className="font-mono text-[9px] text-ink3 uppercase">Intensidad</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-3 bg-border" />
          <span className="font-mono text-[9px] text-ink3">0</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-3 bg-md/20" />
          <span className="font-mono text-[9px] text-ink3">bajo</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-3 bg-md/50" />
          <span className="font-mono text-[9px] text-ink3">medio</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-3 bg-md" />
          <span className="font-mono text-[9px] text-ink3">alto</span>
        </div>
      </div>
    </div>
  )
}
