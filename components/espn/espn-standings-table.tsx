import Image from 'next/image'
import type { EspnStandingsEntry } from '@/lib/espn/types'
import { statBy } from '@/lib/espn/standings'

interface Props {
  label: string
  entries: EspnStandingsEntry[]
  /** Which stat columns to render. Each passes a list of candidate keys (first match wins). */
  columns?: Array<{ label: string; keys: string[] }>
}

const DEFAULT_COLUMNS = [
  { label: 'PJ', keys: ['GP', 'gamesPlayed'] },
  { label: 'V', keys: ['W', 'wins'] },
  { label: 'D', keys: ['L', 'losses'] },
  { label: 'E', keys: ['D', 'T', 'ties'] },
  { label: 'PTS', keys: ['PTS', 'points'] },
  { label: '%', keys: ['PCT', 'winPercent'] },
]

export function EspnStandingsTable({ label, entries, columns }: Props) {
  // Deduplicate default columns depending on availability in first row
  const sample = entries[0]
  const allCols = columns || DEFAULT_COLUMNS
  const cols = sample
    ? allCols.filter((c) => statBy(sample, c.keys) !== undefined)
    : allCols

  return (
    <div className="bg-paper border border-border">
      <div className="eyebrow px-3 py-2 bg-surface border-b border-border">{label}</div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-surface border-b border-border">
              <th className="font-mono text-[10px] uppercase tracking-wider text-ink3 px-3 py-2 w-8">#</th>
              <th className="font-mono text-[10px] uppercase tracking-wider text-ink3 px-3 py-2">Equipo</th>
              {cols.map((c) => (
                <th key={c.label} className="font-mono text-[10px] uppercase tracking-wider text-ink3 px-2 py-2 text-right">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={e.team.id || i} className="border-b border-border last:border-b-0 hover:bg-surface">
                <td className="px-3 py-2 font-display font-bold tabular-nums text-ink3">{i + 1}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {e.team.logo && (
                      <Image src={e.team.logo} alt="" width={18} height={18} className="shrink-0" />
                    )}
                    <span className="font-display font-semibold uppercase text-xs md:text-sm truncate">
                      {e.team.displayName || e.team.name}
                    </span>
                  </div>
                </td>
                {cols.map((c) => (
                  <td key={c.label} className="px-2 py-2 font-display tabular-nums text-right">
                    {statBy(e, c.keys) ?? '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
