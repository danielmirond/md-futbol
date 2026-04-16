'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface Props {
  current: string
}

export function DatePicker({ current }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const change = (deltaDays: number) => {
    const d = new Date(current + 'T12:00:00')
    d.setDate(d.getDate() + deltaDays)
    const iso = d.toISOString().split('T')[0]
    const p = new URLSearchParams(searchParams.toString())
    p.set('d', iso)
    router.push(`/partidos?${p.toString()}`)
  }

  const setDate = (iso: string) => {
    const p = new URLSearchParams(searchParams.toString())
    p.set('d', iso)
    router.push(`/partidos?${p.toString()}`)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => change(-1)}
        className="btn-ghost"
        aria-label="Día anterior"
      >
        ← AYER
      </button>
      <input
        type="date"
        value={current}
        onChange={(e) => setDate(e.target.value)}
        className="font-mono text-sm bg-paper border border-border px-3 py-2 focus:outline-none focus:border-md"
      />
      <button
        onClick={() => change(1)}
        className="btn-ghost"
        aria-label="Día siguiente"
      >
        MAÑANA →
      </button>
      <button
        onClick={() => setDate(new Date().toISOString().split('T')[0])}
        className="btn-ghost"
      >
        HOY
      </button>
    </div>
  )
}
