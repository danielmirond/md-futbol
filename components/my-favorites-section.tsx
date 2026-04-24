'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FixtureCard } from './fixture-card'
import { getFavorites, type Favorite } from '@/lib/favorites'
import type { SmFixture } from '@/lib/sportmonks/types'

interface HomeData {
  upcoming: SmFixture[]
  standings: Array<{
    position: number
    points: number
    participant?: { id: number; name: string; image_path: string | null }
  }> | null
  topScorers: Array<{
    player_id: number
    total: number
    player?: { id: number; display_name?: string; name: string; image_path: string | null }
    participant?: { id: number; name: string; image_path: string | null }
  }>
  primaryLeague: { id: number; name: string | null; image_path: string | null } | null
}

export function MyFavoritesSection() {
  const [favs, setFavs] = useState<Favorite[]>([])
  const [data, setData] = useState<HomeData | null>(null)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const sync = () => setFavs(getFavorites())
    sync()
    window.addEventListener('favorites:changed', sync)
    return () => window.removeEventListener('favorites:changed', sync)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const teamIds = favs.filter((f) => f.type === 'team').map((f) => f.id)
    const leagueIds = favs.filter((f) => f.type === 'league').map((f) => f.id)
    if (teamIds.length === 0 && leagueIds.length === 0) {
      setData(null)
      return
    }
    setLoading(true)
    const params = new URLSearchParams()
    if (teamIds.length) params.set('teams', teamIds.join(','))
    if (leagueIds.length) params.set('leagues', leagueIds.join(','))
    fetch(`/api/my/home?${params}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [favs, mounted])

  if (!mounted) return null

  const hasFavs = favs.some((f) => f.type === 'team' || f.type === 'league')
  if (!hasFavs) return null

  if (loading && !data) {
    return (
      <section className="bg-accent/10 border border-accent p-4">
        <div className="eyebrow">CARGANDO TU FEED PERSONALIZADO…</div>
      </section>
    )
  }

  if (!data || (data.upcoming.length === 0 && !data.standings && data.topScorers.length === 0)) {
    return null
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="inline-block bg-accent text-md-black px-3 py-1.5 font-display font-bold uppercase text-xs tracking-wider">
          ★ Para ti
        </span>
        <h2 className="font-display font-bold uppercase text-xl md:text-2xl tracking-tight">
          Tu feed
        </h2>
      </div>

      {/* Upcoming from favorites */}
      {data.upcoming.length > 0 && (
        <div>
          <h3 className="md-heading mb-3">Próximos partidos · favoritos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.upcoming.slice(0, 6).map((f) => (
              <FixtureCard key={f.id} fixture={f} />
            ))}
          </div>
        </div>
      )}

      {(data.standings || data.topScorers.length > 0) && data.primaryLeague && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Standings snapshot */}
          {data.standings && data.standings.length > 0 && (
            <div>
              <div className="flex items-baseline justify-between gap-2 mb-3">
                <h3 className="md-heading">
                  {data.primaryLeague.name || 'Clasificación'}
                </h3>
                <Link
                  href={`/ligas/${data.primaryLeague.id}`}
                  className="font-mono text-xs text-md uppercase tracking-wider hover:underline"
                >
                  VER TODA →
                </Link>
              </div>
              <div className="bg-paper border border-border">
                {data.standings.map((row) => (
                  <Link
                    key={row.participant?.id || row.position}
                    href={row.participant ? `/equipos/${row.participant.id}` : '#'}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-surface border-b border-border last:border-b-0"
                  >
                    <span className="font-display font-bold text-sm tabular-nums w-6 text-ink3">
                      {row.position}
                    </span>
                    {row.participant?.image_path && (
                      <Image src={row.participant.image_path} alt="" width={20} height={20} />
                    )}
                    <span className="flex-1 font-display font-semibold uppercase text-sm truncate">
                      {row.participant?.name}
                    </span>
                    <span className="font-display font-bold tabular-nums">{row.points}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Top scorer snapshot */}
          {data.topScorers.length > 0 && (
            <div>
              <div className="flex items-baseline justify-between gap-2 mb-3">
                <h3 className="md-heading">Pichichi</h3>
                <Link
                  href="/goleadores"
                  className="font-mono text-xs text-md uppercase tracking-wider hover:underline"
                >
                  VER TODO →
                </Link>
              </div>
              <div className="bg-paper border border-border">
                {data.topScorers.map((s, i) => (
                  <Link
                    key={s.player_id}
                    href={`/jugadores/${s.player_id}`}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-surface border-b border-border last:border-b-0"
                  >
                    <span className="font-display font-bold text-sm tabular-nums w-6 text-ink3">
                      {i + 1}
                    </span>
                    {s.player?.image_path ? (
                      <Image src={s.player.image_path} alt="" width={24} height={24} className="bg-border" />
                    ) : (
                      <div className="w-6 h-6 bg-border" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-semibold uppercase text-sm truncate">
                        {s.player?.display_name || s.player?.name}
                      </div>
                      {s.participant && (
                        <div className="font-mono text-[10px] text-ink3 uppercase truncate">
                          {s.participant.name}
                        </div>
                      )}
                    </div>
                    <span className="font-display font-bold text-lg tabular-nums text-md">{s.total}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
