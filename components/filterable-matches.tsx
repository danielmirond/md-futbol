'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { FixtureCard } from './fixture-card'
import { MatchesFilterBar, type LeagueOption, type StateFilter } from './matches-filter-bar'
import { getFavorites, type Favorite } from '@/lib/favorites'
import type { SmFixture } from '@/lib/sportmonks/types'

interface Props {
  fixtures: SmFixture[]
}

function matchesState(f: SmFixture, estado: StateFilter): boolean {
  if (estado === 'all') return true
  const dn = f.state?.developer_name || ''
  const sn = f.state?.short_name || ''
  const isLive = dn.includes('INPLAY') || dn === 'LIVE' || dn === 'HT'
  const isFinished = dn === 'FT' || dn === 'AET' || dn === 'FT_PEN' || sn === 'FT'
  const isScheduled = dn === 'NS' || sn === 'NS'
  if (estado === 'live') return isLive
  if (estado === 'finished') return isFinished
  if (estado === 'scheduled') return isScheduled
  return true
}

export function FilterableMatches({ fixtures }: Props) {
  const params = useSearchParams()
  const liga = params.get('liga') || 'all'
  const estado = (params.get('estado') as StateFilter) || 'all'
  const favOnly = params.get('fav') === '1'

  const [favs, setFavs] = useState<Favorite[]>([])

  useEffect(() => {
    const sync = () => setFavs(getFavorites())
    sync()
    window.addEventListener('favorites:changed', sync)
    return () => window.removeEventListener('favorites:changed', sync)
  }, [])

  const favTeamIds = useMemo(
    () => new Set(favs.filter((f) => f.type === 'team').map((f) => f.id)),
    [favs],
  )
  const favLeagueIds = useMemo(
    () => new Set(favs.filter((f) => f.type === 'league').map((f) => f.id)),
    [favs],
  )

  const isFavoriteFixture = (f: SmFixture) => {
    if (favLeagueIds.has(f.league_id)) return true
    const participants = f.participants || []
    return participants.some((p) => favTeamIds.has(p.id))
  }

  // League options derived from the (date-scoped) fixtures prop
  const leagueOptions: LeagueOption[] = useMemo(() => {
    const map = new Map<number, LeagueOption>()
    for (const f of fixtures) {
      const id = f.league_id
      const existing = map.get(id)
      if (existing) {
        existing.count++
      } else {
        map.set(id, {
          id,
          name: f.league?.name || `Liga #${id}`,
          image_path: f.league?.image_path || null,
          count: 1,
        })
      }
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count)
  }, [fixtures])

  const liveCount = useMemo(
    () => fixtures.filter((f) => matchesState(f, 'live')).length,
    [fixtures],
  )

  // Apply filters
  const filtered = useMemo(() => {
    return fixtures.filter((f) => {
      if (liga !== 'all' && String(f.league_id) !== liga) return false
      if (!matchesState(f, estado)) return false
      if (favOnly && !isFavoriteFixture(f)) return false
      return true
    })
  }, [fixtures, liga, estado, favOnly, favTeamIds, favLeagueIds])

  const byLeague = useMemo(() => {
    const m = new Map<number, SmFixture[]>()
    for (const f of filtered) {
      if (!m.has(f.league_id)) m.set(f.league_id, [])
      m.get(f.league_id)!.push(f)
    }
    return Array.from(m.entries())
  }, [filtered])

  return (
    <>
      <MatchesFilterBar
        leagues={leagueOptions}
        totalCount={fixtures.length}
        liveCount={liveCount}
      />

      {filtered.length === 0 ? (
        <div className="md-card text-center py-12">
          <div className="eyebrow mb-2">SIN RESULTADOS</div>
          <p className="font-sans text-ink2 text-sm">
            Ningún partido coincide con los filtros aplicados.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {byLeague.map(([leagueId, matches]) => (
            <section key={leagueId}>
              <h2 className="md-heading mb-4">
                {matches[0].league?.name || `Liga #${leagueId}`}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {matches.map((f) => (
                  <FixtureCard key={f.id} fixture={f} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  )
}
