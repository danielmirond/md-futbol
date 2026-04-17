'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface LiveMatch {
  id: number
  leagueName: string
  leagueId: number
  leagueImage: string | null
  homeName: string
  homeImage: string | null
  awayName: string
  awayImage: string | null
  homeScore: number | null
  awayScore: number | null
  minute: string | null
  state: string
  stateDevName: string
}

const DISMISSED_KEY = 'md-futbol:livescore-dismissed'

export function LivescoreTicker() {
  const [matches, setMatches] = useState<LiveMatch[]>([])
  const [loaded, setLoaded] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const scrollerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dismissedAt = Number(sessionStorage.getItem(DISMISSED_KEY) || 0)
    if (Date.now() - dismissedAt < 3 * 60 * 60 * 1000) {
      setDismissed(true)
    }
  }, [])

  useEffect(() => {
    if (dismissed) return

    let alive = true
    async function fetchLive() {
      try {
        const res = await fetch('/api/livescore', { cache: 'no-store' })
        const json = await res.json()
        if (alive) {
          setMatches(json.matches || [])
          setLoaded(true)
        }
      } catch {
        if (alive) setLoaded(true)
      }
    }

    fetchLive()
    const timer = setInterval(fetchLive, 25000)
    return () => {
      alive = false
      clearInterval(timer)
    }
  }, [dismissed])

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, String(Date.now()))
    setDismissed(true)
  }

  if (dismissed) return null
  if (!loaded) return null
  if (matches.length === 0) return null

  return (
    <div className="bg-md-black text-white border-t border-md-border border-b-2 border-b-md">
      <div className="max-w-7xl mx-auto flex items-stretch">
        {/* Label */}
        <div className="bg-md px-3 py-1.5 flex items-center gap-2 shrink-0">
          <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="font-display font-bold uppercase text-xs tracking-wider whitespace-nowrap">
            {matches.length} EN VIVO
          </span>
        </div>

        {!collapsed && (
          <>
            {/* Scroller */}
            <div
              ref={scrollerRef}
              className="flex-1 flex items-center gap-0 overflow-x-auto scroll-smooth"
              style={{ scrollbarWidth: 'none' }}
            >
              {matches.map((m) => {
                const scoreDiff =
                  m.homeScore != null && m.awayScore != null && m.homeScore !== m.awayScore
                return (
                  <Link
                    key={m.id}
                    href={`/partidos/${m.id}`}
                    className="flex items-center gap-2 px-3 py-1.5 border-r border-md-border hover:bg-md-grey-light shrink-0 min-w-fit transition-colors group"
                    title={`${m.homeName} vs ${m.awayName} — ${m.leagueName}`}
                  >
                    {m.homeImage && (
                      <Image
                        src={m.homeImage}
                        alt={m.homeName}
                        width={16}
                        height={16}
                        className="shrink-0"
                      />
                    )}
                    <span className="font-display font-semibold uppercase text-[11px] truncate max-w-[72px]">
                      {m.homeName}
                    </span>
                    <span className="font-display font-bold text-sm tabular-nums">
                      <span className={scoreDiff && m.homeScore! > m.awayScore! ? 'text-accent' : ''}>
                        {m.homeScore ?? '-'}
                      </span>
                      <span className="text-md mx-0.5">–</span>
                      <span className={scoreDiff && m.awayScore! > m.homeScore! ? 'text-accent' : ''}>
                        {m.awayScore ?? '-'}
                      </span>
                    </span>
                    <span className="font-display font-semibold uppercase text-[11px] truncate max-w-[72px]">
                      {m.awayName}
                    </span>
                    {m.awayImage && (
                      <Image
                        src={m.awayImage}
                        alt={m.awayName}
                        width={16}
                        height={16}
                        className="shrink-0"
                      />
                    )}
                    <span className="font-mono text-[9px] text-md font-bold ml-1 bg-md/10 px-1.5 py-0.5 border border-md/30 whitespace-nowrap">
                      {m.minute || 'LIVE'}
                    </span>
                  </Link>
                )
              })}
            </div>
          </>
        )}

        {collapsed && (
          <div className="flex-1 flex items-center px-3 py-1.5 font-mono text-[11px] text-white/60">
            Livescore en segundo plano · actualización cada 25s
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center shrink-0 border-l border-md-border">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="px-2 py-1.5 text-white/60 hover:text-white hover:bg-md-grey-light transition-colors font-mono text-xs"
            aria-label={collapsed ? 'Expandir' : 'Contraer'}
            title={collapsed ? 'Expandir' : 'Contraer'}
          >
            {collapsed ? '▶' : '◀'}
          </button>
          <button
            onClick={handleDismiss}
            className="px-2 py-1.5 text-white/60 hover:text-md hover:bg-md-grey-light transition-colors font-mono text-xs"
            aria-label="Ocultar"
            title="Ocultar hasta nuevo partido"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
