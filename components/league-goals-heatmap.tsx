'use client'

import { useEffect, useState } from 'react'

interface Props {
  leagueId: number
}

interface Data {
  totalGoals: number
  processedFixtures: number
  totalFixtures: number
  goalsPer5Min: number[]
}

export function LeagueGoalsHeatmap({ leagueId }: Props) {
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    fetch(`/api/goals-by-minute/${leagueId}`)
      .then((r) => r.json())
      .then((json) => {
        if (!alive) return
        if (json.error) setError(json.error)
        else setData(json)
      })
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [leagueId])

  if (loading) {
    return (
      <div className="bg-paper border border-border p-4 md:p-5">
        <div className="eyebrow text-md mb-2">📈 GOLES POR MINUTO</div>
        <div className="font-mono text-xs text-ink3 py-8 text-center">Calculando agregados…</div>
      </div>
    )
  }

  if (error || !data || data.totalGoals === 0) {
    return (
      <div className="bg-paper border border-border p-4 md:p-5">
        <div className="eyebrow text-md mb-2">📈 GOLES POR MINUTO</div>
        <p className="font-sans text-sm text-ink3 py-4">
          {error || 'Sin datos disponibles para esta competición.'}
        </p>
      </div>
    )
  }

  const { goalsPer5Min, totalGoals, processedFixtures } = data
  const max = Math.max(...goalsPer5Min, 1)
  const avgPerGame = processedFixtures > 0 ? (totalGoals / processedFixtures).toFixed(2) : '0'

  // Find peak bucket
  const peakIdx = goalsPer5Min.indexOf(max)
  const peakStart = peakIdx * 5
  const peakEnd = peakIdx === 18 ? '90+' : `${peakStart + 5}`

  return (
    <div className="bg-paper border border-border p-4 md:p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="eyebrow text-md">📈 HEATMAP · GOLES POR MINUTO DE PARTIDO</span>
        <span className="font-mono text-[10px] text-ink3">
          {totalGoals} goles · {processedFixtures} partidos · {avgPerGame} gol/partido
        </span>
      </div>

      {/* Peak insight */}
      <div className="bg-md-black text-white p-3 border-l-4 border-accent">
        <div className="eyebrow text-accent mb-1">🔥 TRAMO MÁS CALIENTE</div>
        <div className="font-display font-bold text-sm">
          Minutos <span className="text-accent">{peakStart}&apos;–{peakEnd}&apos;</span>
          <span className="font-mono text-xs text-white/60 ml-2">
            · {max} goles ({((max / totalGoals) * 100).toFixed(1)}%)
          </span>
        </div>
      </div>

      {/* Bars */}
      <div>
        <div className="flex items-end gap-[2px] h-32">
          {goalsPer5Min.map((count, i) => {
            const height = (count / max) * 100
            const intensity = count / max
            const isPeak = i === peakIdx
            const bg = intensity < 0.25
              ? 'bg-md/20'
              : intensity < 0.5
              ? 'bg-md/45'
              : intensity < 0.75
              ? 'bg-md/70'
              : 'bg-md'
            const label = i === 18 ? '90+' : `${i * 5}-${i * 5 + 5}`
            return (
              <div
                key={i}
                className="flex-1 flex flex-col justify-end items-center relative group"
                title={`${label}' — ${count} goles`}
              >
                <div
                  className={`w-full ${bg} ${isPeak ? 'ring-2 ring-accent' : ''} transition-all hover:brightness-125 relative`}
                  style={{ height: `${height}%`, minHeight: count > 0 ? '2px' : '1px' }}
                >
                  {count > 0 && intensity >= 0.5 && (
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-display font-bold text-white">
                      {count}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* X axis labels */}
        <div className="flex mt-1">
          {goalsPer5Min.map((_, i) => {
            const show = i === 0 || i === 3 || i === 6 || i === 9 || i === 12 || i === 15 || i === 18
            const label = i === 0 ? '0' : i === 18 ? '90+' : `${i * 5}`
            return (
              <div key={i} className="flex-1 text-center">
                {show && <span className="font-mono text-[9px] text-ink3">{label}</span>}
              </div>
            )
          })}
        </div>
        {/* Half-time marker */}
        <div className="flex mt-1">
          <div className="flex-[9]" />
          <div className="flex-1 text-center">
            <span className="font-mono text-[9px] text-md font-bold">HT</span>
          </div>
          <div className="flex-[9]" />
        </div>
      </div>
    </div>
  )
}
