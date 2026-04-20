'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { SmLeague, SmFixture } from '@/lib/sportmonks/types'

export type WidgetVariant = 'classic' | 'glass' | 'neon' | 'editorial'

interface Props {
  leagues: SmLeague[]
  fixtures: SmFixture[]
  activeLeagueId?: number
  variant?: WidgetVariant
}

const SPANISH_DAY_MAP: Record<string, string> = {
  Mon: 'LUN', Tue: 'MAR', Wed: 'MIÉ', Thu: 'JUE', Fri: 'VIE', Sat: 'SÁB', Sun: 'DOM',
}

function formatMatchDate(iso: string): { day: string; date: string; time: string } {
  const d = new Date(iso)
  const dayEn = d.toLocaleDateString('en-US', { weekday: 'short' })
  const day = SPANISH_DAY_MAP[dayEn] || dayEn.toUpperCase()
  const date = d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
  const time = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  return { day, date, time }
}

// Theme tokens per variant
function useTheme(variant: WidgetVariant) {
  switch (variant) {
    case 'glass':
      return {
        root: 'rounded-2xl overflow-hidden relative bg-gradient-to-br from-white/[0.03] via-white/[0.06] to-white/[0.03] backdrop-blur-xl ring-1 ring-white/10 text-white shadow-[0_20px_60px_rgba(0,0,0,0.4)]',
        topBand: 'border-b border-white/10',
        tabBase: 'px-5 py-3.5 min-w-[140px] text-left transition-all',
        tabIdle: 'hover:bg-white/[0.06]',
        tabActive: 'bg-white/[0.08]',
        tabLabel: 'font-mono text-[9px] uppercase tracking-[0.15em]',
        tabLabelIdle: 'text-white/40 group-hover:text-white/70',
        tabLabelActive: 'text-accent',
        tabName: 'font-display font-bold uppercase text-sm leading-tight',
        tabNameIdle: 'text-white/85 group-hover:text-white',
        tabNameActive: 'text-white',
        underline: 'absolute bottom-0 left-5 right-5 h-[3px] bg-gradient-to-r from-accent via-white to-accent rounded-full',
        matchBand: '',
        match: 'px-5 py-4 min-w-[230px] shrink-0 border-r border-white/5 hover:bg-white/[0.05]',
        arrow: 'bg-accent hover:scale-110 hover:shadow-[0_0_25px_rgba(255,199,0,0.5)] text-md-black',
        fade: 'bg-gradient-to-l from-md-black/70 via-md-black/40 to-transparent',
      }
    case 'neon':
      return {
        root: 'rounded-lg overflow-hidden relative bg-black text-white border border-white/10',
        topBand: 'border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent',
        tabBase: 'px-5 py-4 min-w-[140px] text-left transition-all',
        tabIdle: 'hover:bg-white/[0.03]',
        tabActive: '',
        tabLabel: 'font-mono text-[8px] uppercase tracking-[0.2em]',
        tabLabelIdle: 'text-white/30',
        tabLabelActive: 'text-[#00FF9C]',
        tabName: 'font-display font-bold uppercase text-sm leading-tight',
        tabNameIdle: 'text-white/70 group-hover:text-white',
        tabNameActive: 'text-[#00FF9C]',
        underline: 'absolute bottom-0 left-0 right-0 h-[1px] bg-[#00FF9C] shadow-[0_0_12px_#00FF9C]',
        matchBand: '',
        match: 'px-5 py-4 min-w-[230px] shrink-0 border-r border-white/5 hover:bg-white/[0.03]',
        arrow: 'bg-[#00FF9C] text-black hover:shadow-[0_0_25px_#00FF9C] hover:scale-110',
        fade: 'bg-gradient-to-l from-black via-black/60 to-transparent',
      }
    case 'editorial':
      return {
        root: 'rounded-none overflow-hidden relative bg-paper text-ink border-t-4 border-b border-md border-b-border',
        topBand: 'border-b border-border',
        tabBase: 'px-5 py-3.5 min-w-[140px] text-left transition-colors',
        tabIdle: 'hover:bg-surface',
        tabActive: 'bg-surface',
        tabLabel: 'font-serif italic text-[10px] tracking-normal text-ink2',
        tabLabelIdle: 'text-ink2',
        tabLabelActive: 'text-md',
        tabName: 'font-display font-bold uppercase text-sm leading-tight',
        tabNameIdle: 'text-ink',
        tabNameActive: 'text-md',
        underline: 'absolute bottom-0 left-5 right-5 h-[2px] bg-md',
        matchBand: 'bg-surface',
        match: 'px-5 py-4 min-w-[230px] shrink-0 border-r border-border hover:bg-paper',
        arrow: 'bg-md hover:bg-md-dark text-white',
        fade: 'bg-gradient-to-l from-surface via-surface/70 to-transparent',
      }
    case 'classic':
    default:
      return {
        root: 'rounded-xl overflow-hidden relative bg-gradient-to-b from-md-black via-md-grey to-md-black text-white shadow-[0_20px_60px_rgba(0,0,0,0.35)] ring-1 ring-white/5',
        topBand: 'border-b border-white/10',
        tabBase: 'px-5 py-3.5 min-w-[140px] text-left transition-all',
        tabIdle: 'hover:bg-white/[0.03]',
        tabActive: 'bg-white/[0.04]',
        tabLabel: 'font-mono text-[9px] uppercase tracking-[0.15em]',
        tabLabelIdle: 'text-white/40 group-hover:text-white/60',
        tabLabelActive: 'text-md',
        tabName: 'font-display font-bold uppercase text-sm leading-tight',
        tabNameIdle: 'text-white/80 group-hover:text-white',
        tabNameActive: 'text-white',
        underline: 'absolute bottom-0 left-5 right-5 h-[3px] bg-gradient-to-r from-md via-accent to-md rounded-full shadow-[0_0_12px_rgba(227,6,19,0.6)]',
        matchBand: '',
        match: 'px-5 py-4 min-w-[230px] shrink-0 border-r border-white/5 hover:bg-white/[0.04]',
        arrow: 'bg-md hover:bg-md-dark hover:scale-110 hover:shadow-[0_0_20px_rgba(227,6,19,0.5)] text-white',
        fade: 'bg-gradient-to-l from-md-black via-md-black/60 to-transparent',
      }
  }
}

export function CompetitionWidget({ leagues, fixtures, activeLeagueId, variant = 'classic' }: Props) {
  const theme = useTheme(variant)
  const [activeId, setActiveId] = useState<number>(
    activeLeagueId ?? leagues[0]?.id ?? 0,
  )
  const scrollerRef = useRef<HTMLDivElement>(null)

  const filteredFixtures = activeId
    ? fixtures.filter((f) => f.league_id === activeId)
    : fixtures
  const displayed = filteredFixtures.length > 0 ? filteredFixtures : fixtures

  const scrollMatches = () => {
    scrollerRef.current?.scrollBy({ left: 300, behavior: 'smooth' })
  }

  const isLight = variant === 'editorial'

  return (
    <div className={theme.root}>
      {/* Tabs */}
      <div className={`relative ${theme.topBand}`}>
        <div className="overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="flex items-stretch min-w-max">
            {leagues.map((league) => {
              const isActive = league.id === activeId
              return (
                <button
                  key={league.id}
                  onClick={() => setActiveId(league.id)}
                  className={`group relative flex flex-col items-start ${theme.tabBase} ${isActive ? theme.tabActive : theme.tabIdle}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {league.image_path && (
                      <Image
                        src={league.image_path}
                        alt={league.name}
                        width={14}
                        height={14}
                        className={`transition-all ${isActive ? 'opacity-100' : 'opacity-60'}`}
                      />
                    )}
                    <span className={`${theme.tabLabel} ${isActive ? theme.tabLabelActive : theme.tabLabelIdle}`}>
                      Clasificación
                    </span>
                  </div>
                  <span className={`${theme.tabName} ${isActive ? theme.tabNameActive : theme.tabNameIdle}`}>
                    {league.name}
                  </span>
                  {isActive && <span className={theme.underline} />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Arrow to league page */}
        <Link
          href={`/ligas/${activeId}`}
          className={`absolute top-1/2 -translate-y-1/2 right-3 rounded-full w-9 h-9 flex items-center justify-center transition-all z-10 ${theme.arrow}`}
          aria-label="Ver competición"
          title="Ver ficha completa"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </Link>
      </div>

      {/* Matches carousel */}
      <div className={`relative ${theme.matchBand}`}>
        <div
          ref={scrollerRef}
          className="overflow-x-auto scroll-smooth"
          style={{ scrollbarWidth: 'none' }}
        >
          <div className="flex items-stretch min-w-max">
            {displayed.length === 0 ? (
              <div className={`px-6 py-6 font-mono text-xs ${isLight ? 'text-ink3' : 'text-white/50'}`}>
                Sin próximos partidos disponibles.
              </div>
            ) : (
              displayed.slice(0, 15).map((f) => {
                const home = f.participants?.find((p) => p.meta?.location === 'home')
                const away = f.participants?.find((p) => p.meta?.location === 'away')
                const { day, date, time } = formatMatchDate(f.starting_at)
                const isLive =
                  f.state?.developer_name?.includes('INPLAY') ||
                  f.state?.developer_name === 'LIVE' ||
                  f.state?.developer_name === 'HT'
                const isToday = new Date(f.starting_at).toDateString() === new Date().toDateString()

                return (
                  <Link
                    key={f.id}
                    href={`/partidos/${f.id}`}
                    className={`relative group transition-all ${theme.match}`}
                    title={`${home?.name} vs ${away?.name}`}
                  >
                    {isLive && (
                      <span className="absolute top-2 right-2 flex items-center gap-1 bg-md/20 text-md font-mono text-[8px] font-bold uppercase px-1.5 py-0.5 rounded tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-md animate-pulse" />
                        LIVE
                      </span>
                    )}
                    {!isLive && isToday && (
                      <span className={`absolute top-2 right-2 font-mono text-[8px] font-bold uppercase px-1.5 py-0.5 rounded tracking-wider ${
                        variant === 'neon' ? 'bg-[#00FF9C]/20 text-[#00FF9C]' : 'bg-accent/20 text-accent'
                      }`}>
                        HOY
                      </span>
                    )}

                    <div className="flex items-center gap-2 mb-2">
                      {home?.image_path ? (
                        <Image src={home.image_path} alt={home.name} width={18} height={18} className="shrink-0" />
                      ) : (
                        <div className={`w-[18px] h-[18px] rounded-full shrink-0 ${isLight ? 'bg-border' : 'bg-white/10'}`} />
                      )}
                      <span className={`font-display font-bold uppercase text-[13px] truncate group-hover:text-md transition-colors ${isLight ? 'text-ink' : 'text-white'}`}>
                        {home?.name || 'Local'}
                      </span>
                    </div>

                    <div className={`h-px mb-2 ${isLight ? 'bg-border' : 'bg-gradient-to-r from-transparent via-white/15 to-transparent'}`} />

                    <div className="flex items-center gap-2 mb-3">
                      {away?.image_path ? (
                        <Image src={away.image_path} alt={away.name} width={18} height={18} className="shrink-0" />
                      ) : (
                        <div className={`w-[18px] h-[18px] rounded-full shrink-0 ${isLight ? 'bg-border' : 'bg-white/10'}`} />
                      )}
                      <span className={`font-display font-bold uppercase text-[13px] truncate group-hover:text-md transition-colors ${isLight ? 'text-ink' : 'text-white'}`}>
                        {away?.name || 'Visitante'}
                      </span>
                    </div>

                    <div className={`flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider ${isLight ? 'text-ink3' : 'text-white/60'}`}>
                      <span className={`px-1.5 py-0.5 rounded ${isLight ? 'bg-border text-ink2' : 'bg-white/5 text-white/80'}`}>
                        {day}
                      </span>
                      <span>{date}</span>
                      <span className="opacity-40">·</span>
                      <span className={`font-semibold ${
                        variant === 'neon' ? 'text-[#00FF9C]' : 'text-accent'
                      }`}>{time}</span>
                    </div>

                    <div className={`absolute left-0 top-0 bottom-0 w-[3px] opacity-0 group-hover:opacity-100 transition-opacity ${
                      variant === 'neon' ? 'bg-[#00FF9C]' : 'bg-md'
                    }`} />
                  </Link>
                )
              })
            )}
          </div>
        </div>

        <button
          onClick={scrollMatches}
          className={`absolute top-1/2 -translate-y-1/2 right-3 rounded-full w-10 h-10 flex items-center justify-center transition-all z-10 ${theme.arrow}`}
          aria-label="Siguiente"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>

        <div className={`pointer-events-none absolute top-0 bottom-0 right-0 w-24 ${theme.fade}`} />
      </div>
    </div>
  )
}
