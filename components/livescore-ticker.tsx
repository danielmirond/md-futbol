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

interface GoalFlash {
  matchId: number
  team: 'home' | 'away'
  at: number
}

const DISMISSED_KEY = 'md-futbol:livescore-dismissed'
const GOAL_FLASH_MS = 8000

export function LivescoreTicker() {
  const [matches, setMatches] = useState<LiveMatch[]>([])
  const [loaded, setLoaded] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [visible, setVisible] = useState(false)
  const [goalFlashes, setGoalFlashes] = useState<GoalFlash[]>([])
  const scrollerRef = useRef<HTMLDivElement>(null)
  const prevScoresRef = useRef<Map<number, { home: number; away: number }>>(new Map())
  const goalAudioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const dismissedAt = Number(sessionStorage.getItem(DISMISSED_KEY) || 0)
    if (Date.now() - dismissedAt < 3 * 60 * 60 * 1000) {
      setDismissed(true)
    }
  }, [])

  // Pre-create a simple beep using the Web Audio API for goal sound
  useEffect(() => {
    if (typeof window === 'undefined') return
    // Create a short whistle sound using data URL (silent synthesis fallback)
  }, [])

  function playGoalSound() {
    try {
      const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext | undefined
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)

      // Ascending "whistle" tone
      osc.frequency.setValueAtTime(440, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15)
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.3)

      gain.gain.setValueAtTime(0.0001, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5)

      osc.type = 'sine'
      osc.start()
      osc.stop(ctx.currentTime + 0.55)
      setTimeout(() => ctx.close(), 700)
    } catch {
      // Audio not allowed or unsupported — silent
    }
  }

  useEffect(() => {
    if (dismissed) return

    let alive = true

    async function fetchLive() {
      try {
        const res = await fetch('/api/livescore', { cache: 'no-store' })
        const json = await res.json()
        if (!alive) return

        const newMatches: LiveMatch[] = json.matches || []

        // Detect goals by comparing with previous snapshot
        const prev = prevScoresRef.current
        const newFlashes: GoalFlash[] = []
        for (const m of newMatches) {
          const p = prev.get(m.id)
          if (p && m.homeScore != null && m.awayScore != null) {
            if (m.homeScore > p.home) {
              newFlashes.push({ matchId: m.id, team: 'home', at: Date.now() })
            }
            if (m.awayScore > p.away) {
              newFlashes.push({ matchId: m.id, team: 'away', at: Date.now() })
            }
          }
        }

        // Update snapshot
        const nextSnapshot = new Map<number, { home: number; away: number }>()
        for (const m of newMatches) {
          nextSnapshot.set(m.id, { home: m.homeScore ?? 0, away: m.awayScore ?? 0 })
        }
        prevScoresRef.current = nextSnapshot

        setMatches(newMatches)
        if (newFlashes.length > 0) {
          setGoalFlashes((prev) => [...prev, ...newFlashes])
          playGoalSound()
          // Scroll the first goal into view
          setTimeout(() => {
            const el = document.querySelector(`[data-match-id="${newFlashes[0].matchId}"]`)
            if (el && 'scrollIntoView' in el) {
              ;(el as HTMLElement).scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
            }
          }, 100)
        }
        setLoaded(true)
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

  // Clear old goal flashes
  useEffect(() => {
    if (goalFlashes.length === 0) return
    const timer = setTimeout(() => {
      const now = Date.now()
      setGoalFlashes((prev) => prev.filter((g) => now - g.at < GOAL_FLASH_MS))
    }, 1000)
    return () => clearTimeout(timer)
  }, [goalFlashes])

  // Entrance animation: fade+slide when first matches load
  useEffect(() => {
    if (loaded && matches.length > 0 && !visible) {
      // Small delay to trigger CSS transition
      const t = setTimeout(() => setVisible(true), 50)
      return () => clearTimeout(t)
    }
    if (matches.length === 0 && visible) {
      setVisible(false)
    }
  }, [loaded, matches.length, visible])

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, String(Date.now()))
    setVisible(false)
    setTimeout(() => setDismissed(true), 300)
  }

  if (dismissed) return null
  if (!loaded) return null
  if (matches.length === 0) return null

  function hasGoalFlash(matchId: number, team: 'home' | 'away'): boolean {
    return goalFlashes.some((g) => g.matchId === matchId && g.team === team)
  }

  function hasAnyFlash(matchId: number): boolean {
    return goalFlashes.some((g) => g.matchId === matchId)
  }

  return (
    <div
      className={`bg-md-black text-white border-t border-md-border border-b-2 border-b-md overflow-hidden transition-all duration-300 ease-out ${
        visible ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-stretch">
        {/* Label */}
        <div className="bg-md px-3 py-1.5 flex items-center gap-2 shrink-0 relative">
          <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="font-display font-bold uppercase text-xs tracking-wider whitespace-nowrap">
            {matches.length} EN VIVO
          </span>
          {/* Global GOAL banner when any new goal */}
          {goalFlashes.length > 0 && (
            <span className="absolute -bottom-5 left-0 right-0 bg-accent text-md-black font-display font-black uppercase text-[10px] tracking-wider text-center py-0.5 animate-pulse z-10">
              ⚽ GOL
            </span>
          )}
        </div>

        {!collapsed && (
          <div
            ref={scrollerRef}
            className="flex-1 flex items-center gap-0 overflow-x-auto scroll-smooth"
            style={{ scrollbarWidth: 'none' }}
          >
            {matches.map((m) => {
              const scoreDiff =
                m.homeScore != null && m.awayScore != null && m.homeScore !== m.awayScore
              const flashing = hasAnyFlash(m.id)
              const homeFlash = hasGoalFlash(m.id, 'home')
              const awayFlash = hasGoalFlash(m.id, 'away')

              return (
                <Link
                  key={m.id}
                  data-match-id={m.id}
                  href={`/partidos/${m.id}`}
                  className={`flex items-center gap-2 px-3 py-1.5 border-r border-md-border shrink-0 min-w-fit transition-all group relative ${
                    flashing
                      ? 'bg-accent/20 animate-[pulse_0.8s_ease-in-out_infinite]'
                      : 'hover:bg-md-grey-light'
                  }`}
                  title={`${m.homeName} vs ${m.awayName} — ${m.leagueName}`}
                >
                  {flashing && (
                    <span className="absolute inset-0 border-2 border-accent pointer-events-none animate-ping" />
                  )}
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
                    <span
                      className={`inline-block transition-all ${
                        homeFlash
                          ? 'text-accent scale-150 drop-shadow-[0_0_8px_rgba(255,199,0,0.8)]'
                          : scoreDiff && m.homeScore! > m.awayScore!
                          ? 'text-accent'
                          : ''
                      }`}
                    >
                      {m.homeScore ?? '-'}
                    </span>
                    <span className="text-md mx-0.5">–</span>
                    <span
                      className={`inline-block transition-all ${
                        awayFlash
                          ? 'text-accent scale-150 drop-shadow-[0_0_8px_rgba(255,199,0,0.8)]'
                          : scoreDiff && m.awayScore! > m.homeScore!
                          ? 'text-accent'
                          : ''
                      }`}
                    >
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
                  <span
                    className={`font-mono text-[9px] font-bold ml-1 px-1.5 py-0.5 border whitespace-nowrap transition-colors ${
                      flashing
                        ? 'bg-accent text-md-black border-accent'
                        : 'text-md bg-md/10 border-md/30'
                    }`}
                  >
                    {flashing ? '⚽ GOL' : m.minute || 'LIVE'}
                  </span>
                </Link>
              )
            })}
          </div>
        )}

        {collapsed && (
          <div className="flex-1 flex items-center px-3 py-1.5 font-mono text-[11px] text-white/60">
            Livescore en segundo plano · actualización cada 25s
          </div>
        )}

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
