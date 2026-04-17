'use client'

import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface Props {
  current: string  // YYYY-MM-DD
  daysBefore?: number
  daysAfter?: number
}

function toISO(d: Date): string {
  return d.toISOString().split('T')[0]
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function dayLabel(d: Date, today: Date): { primary: string; secondary: string } {
  const diffDays = Math.round((d.getTime() - today.getTime()) / 86400000)
  if (diffDays === -1) return { primary: 'AYER', secondary: d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).toUpperCase() }
  if (diffDays === 0) return { primary: 'HOY', secondary: d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).toUpperCase() }
  if (diffDays === 1) return { primary: 'MAÑANA', secondary: d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).toUpperCase() }
  return {
    primary: d.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase().replace('.', ''),
    secondary: d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).toUpperCase(),
  }
}

export function DayCarousel({ current, daysBefore = 3, daysAfter = 4 }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const scrollerRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  const today = new Date()
  today.setHours(12, 0, 0, 0)
  const currentDate = new Date(current + 'T12:00:00')

  // Build day list: -daysBefore to +daysAfter relative to today
  const days: Date[] = []
  for (let i = -daysBefore; i <= daysAfter; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push(d)
  }

  // Ensure current date is in the list (if user jumped to a far date)
  const currentInList = days.some((d) => isSameDay(d, currentDate))
  if (!currentInList) {
    days.push(currentDate)
    days.sort((a, b) => a.getTime() - b.getTime())
  }

  const go = (d: Date) => {
    const p = new URLSearchParams(searchParams.toString())
    p.set('d', toISO(d))
    router.push(`/partidos?${p.toString()}`)
  }

  const goDelta = (delta: number) => {
    const d = new Date(currentDate)
    d.setDate(currentDate.getDate() + delta)
    go(d)
  }

  // Scroll active into view on mount
  useEffect(() => {
    if (activeRef.current && scrollerRef.current) {
      const btn = activeRef.current
      const scroller = scrollerRef.current
      const scrollLeft = btn.offsetLeft - scroller.clientWidth / 2 + btn.clientWidth / 2
      scroller.scrollTo({ left: scrollLeft, behavior: 'smooth' })
    }
  }, [current])

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          onClick={() => goDelta(-1)}
          aria-label="Día anterior"
          className="shrink-0 w-10 h-[64px] bg-paper border border-border flex items-center justify-center hover:border-md hover:text-md transition-colors font-display font-bold text-lg"
        >
          ‹
        </button>

        <div
          ref={scrollerRef}
          className="flex-1 flex gap-2 overflow-x-auto scroll-smooth pb-1"
          style={{ scrollbarWidth: 'none' }}
        >
          {days.map((d) => {
            const active = isSameDay(d, currentDate)
            const isToday = isSameDay(d, today)
            const label = dayLabel(d, today)
            return (
              <button
                key={toISO(d)}
                ref={active ? activeRef : undefined}
                onClick={() => go(d)}
                className={`shrink-0 min-w-[96px] px-3 py-3 text-center border transition-colors ${
                  active
                    ? 'bg-md-black text-white border-md-black'
                    : isToday
                    ? 'bg-md text-white border-md hover:bg-md-dark'
                    : 'bg-paper text-ink border-border hover:border-md hover:text-md'
                }`}
              >
                <div className={`font-display font-bold uppercase text-xs tracking-wider ${
                  active ? 'text-md' : isToday ? 'text-white' : ''
                }`}>
                  {label.primary}
                </div>
                <div className="font-mono text-[10px] mt-1 opacity-80">{label.secondary}</div>
              </button>
            )
          })}
        </div>

        <button
          onClick={() => goDelta(1)}
          aria-label="Día siguiente"
          className="shrink-0 w-10 h-[64px] bg-paper border border-border flex items-center justify-center hover:border-md hover:text-md transition-colors font-display font-bold text-lg"
        >
          ›
        </button>

        <input
          type="date"
          value={current}
          onChange={(e) => {
            if (/^\d{4}-\d{2}-\d{2}$/.test(e.target.value)) {
              go(new Date(e.target.value + 'T12:00:00'))
            }
          }}
          className="hidden md:block shrink-0 h-[64px] font-mono text-xs bg-paper border border-border px-3 focus:outline-none focus:border-md"
        />
      </div>
    </div>
  )
}
