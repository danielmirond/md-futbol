'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Image from 'next/image'
import { getFavorites, type Favorite } from '@/lib/favorites'

export type StateFilter = 'all' | 'live' | 'finished' | 'scheduled'

export interface LeagueOption {
  id: number
  name: string
  image_path: string | null
  count: number
}

interface Props {
  leagues: LeagueOption[]
  totalCount: number
  liveCount: number
}

export function MatchesFilterBar({ leagues, totalCount, liveCount }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const liga = params.get('liga') || 'all'
  const estado = (params.get('estado') as StateFilter) || 'all'
  const favOnly = params.get('fav') === '1'

  const [favCount, setFavCount] = useState(0)

  useEffect(() => {
    const updateCount = () => {
      const favs = getFavorites().filter((f: Favorite) => f.type === 'team' || f.type === 'league')
      setFavCount(favs.length)
    }
    updateCount()
    window.addEventListener('favorites:changed', updateCount)
    return () => window.removeEventListener('favorites:changed', updateCount)
  }, [])

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString())
    if (value === null || value === '' || value === 'all' || value === '0') next.delete(key)
    else next.set(key, value)
    const qs = next.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const stateTabs: Array<{ key: StateFilter; label: string; count?: number }> = [
    { key: 'all', label: 'Todos', count: totalCount },
    { key: 'live', label: '● En vivo', count: liveCount },
    { key: 'finished', label: 'Finalizados' },
    { key: 'scheduled', label: 'Programados' },
  ]

  return (
    <div className="bg-paper border border-border p-3 space-y-3">
      {/* State tabs */}
      <div className="flex items-center gap-1 flex-wrap">
        {stateTabs.map((t) => {
          const active = estado === t.key
          return (
            <button
              key={t.key}
              onClick={() => update('estado', t.key)}
              className={`font-display uppercase text-xs tracking-wider px-3 py-1.5 transition-colors inline-flex items-center gap-2 ${
                active
                  ? t.key === 'live'
                    ? 'bg-md text-white'
                    : 'bg-md-black text-white'
                  : 'bg-surface text-ink2 hover:text-ink'
              }`}
            >
              <span>{t.label}</span>
              {typeof t.count === 'number' && (
                <span className={`font-mono text-[10px] tabular-nums ${active ? 'text-white/80' : 'text-ink3'}`}>
                  {t.count}
                </span>
              )}
            </button>
          )
        })}

        <button
          onClick={() => update('fav', favOnly ? '0' : '1')}
          disabled={favCount === 0}
          title={favCount === 0 ? 'Añade equipos o ligas a favoritos' : undefined}
          className={`font-display uppercase text-xs tracking-wider px-3 py-1.5 transition-colors inline-flex items-center gap-2 ml-auto ${
            favOnly
              ? 'bg-accent text-md-black'
              : favCount === 0
              ? 'bg-surface text-ink3 cursor-not-allowed opacity-50'
              : 'bg-surface text-ink2 hover:text-ink'
          }`}
        >
          <span>★ Solo favoritos</span>
          {favCount > 0 && (
            <span className={`font-mono text-[10px] tabular-nums ${favOnly ? 'text-md-black/70' : 'text-ink3'}`}>
              {favCount}
            </span>
          )}
        </button>
      </div>

      {/* League pills — horizontally scrollable */}
      {leagues.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            onClick={() => update('liga', 'all')}
            className={`shrink-0 font-display uppercase text-xs tracking-wider px-3 py-1.5 border transition-colors ${
              liga === 'all'
                ? 'border-md text-md bg-md/5'
                : 'border-border text-ink2 hover:border-md hover:text-md'
            }`}
          >
            Todas las ligas
          </button>
          {leagues.map((l) => {
            const active = liga === String(l.id)
            return (
              <button
                key={l.id}
                onClick={() => update('liga', String(l.id))}
                className={`shrink-0 font-display uppercase text-xs tracking-wider px-3 py-1.5 border transition-colors inline-flex items-center gap-2 ${
                  active
                    ? 'border-md text-md bg-md/5'
                    : 'border-border text-ink2 hover:border-md hover:text-md'
                }`}
              >
                {l.image_path && (
                  <Image src={l.image_path} alt="" width={14} height={14} />
                )}
                <span className="truncate max-w-[160px]">{l.name}</span>
                <span className="font-mono text-[10px] tabular-nums text-ink3">{l.count}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
