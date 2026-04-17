interface FixtureLike {
  starting_at: string
}

interface Props {
  fixtures: FixtureLike[]
  title?: string
}

const DAYS = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM']
const HOURS = Array.from({ length: 18 }, (_, i) => i + 6) // 06h - 23h

/**
 * Heatmap calendario: día de la semana × hora del día.
 * Color más intenso = más partidos programados.
 */
export function ScheduleHeatmap({ fixtures, title = 'Calendario de partidos' }: Props) {
  // Build 7x18 grid (day × hour)
  const grid: number[][] = Array.from({ length: 7 }, () => new Array(HOURS.length).fill(0))

  for (const f of fixtures) {
    const d = new Date(f.starting_at)
    let day = d.getDay() // 0=dom, 1=lun, ..., 6=sab
    day = day === 0 ? 6 : day - 1 // lunes=0, domingo=6
    const hour = d.getHours()
    const hourIdx = HOURS.indexOf(hour)
    if (hourIdx === -1) continue
    grid[day][hourIdx]++
  }

  const max = Math.max(...grid.flat(), 1)

  return (
    <div className="bg-paper border border-border p-4 md:p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <span className="eyebrow text-md">🗓 {title.toUpperCase()}</span>
        <span className="font-mono text-[10px] text-ink3">
          {fixtures.length} partidos
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Hour headers */}
          <div className="flex items-center ml-10">
            {HOURS.map((h) => (
              <div
                key={h}
                className="w-6 text-center font-mono text-[9px] text-ink3"
              >
                {h}
              </div>
            ))}
          </div>

          {/* Day rows */}
          {DAYS.map((day, dayIdx) => (
            <div key={day} className="flex items-center mt-1">
              <div className="w-10 font-mono text-[10px] font-bold text-ink2 uppercase">{day}</div>
              <div className="flex gap-[1px]">
                {grid[dayIdx].map((count, hourIdx) => {
                  const intensity = count / max
                  const bg = count === 0
                    ? 'bg-border'
                    : intensity < 0.25
                    ? 'bg-md/15'
                    : intensity < 0.5
                    ? 'bg-md/35'
                    : intensity < 0.75
                    ? 'bg-md/60'
                    : 'bg-md'
                  const textColor = intensity >= 0.5 ? 'text-white' : 'text-ink'

                  return (
                    <div
                      key={hourIdx}
                      title={`${day} ${HOURS[hourIdx]}:00 · ${count} partidos`}
                      className={`w-6 h-6 flex items-center justify-center font-mono text-[9px] font-bold transition-transform hover:scale-125 ${bg} ${textColor}`}
                    >
                      {count > 0 ? count : ''}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 pt-3 mt-3 border-t border-border">
        <span className="font-mono text-[9px] text-ink3 uppercase">Densidad</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-3 bg-border" />
          <span className="font-mono text-[9px] text-ink3">0</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-3 bg-md/15" />
          <div className="w-4 h-3 bg-md/35" />
          <div className="w-4 h-3 bg-md/60" />
          <div className="w-4 h-3 bg-md" />
          <span className="font-mono text-[9px] text-ink3 ml-1">{max}</span>
        </div>
      </div>
    </div>
  )
}
