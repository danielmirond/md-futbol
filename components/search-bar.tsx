'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface SearchResult {
  teams: { id: number; name: string; image_path: string | null }[]
  players: { id: number; name: string; image_path: string | null }[]
  leagues: { id: number; name: string; image_path: string | null; short_code: string | null }[]
}

export function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLFormElement>(null)

  const goToSearchPage = (q: string) => {
    const trimmed = q.trim()
    if (trimmed.length < 2) return
    setOpen(false)
    router.push(`/buscar?q=${encodeURIComponent(trimmed)}`)
  }

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null)
      return
    }
    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
        if (res.ok) {
          setResults(await res.json())
        }
      } catch {}
      setLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  const total = (results?.teams.length || 0) + (results?.players.length || 0) + (results?.leagues.length || 0)
  const showDropdown = open && (loading || total > 0 || query.trim().length >= 2)

  return (
    <form
      ref={containerRef}
      role="search"
      onSubmit={(e) => {
        e.preventDefault()
        goToSearchPage(query)
      }}
      className="relative w-full max-w-xs"
    >
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder="Buscar equipo, jugador…"
        className="w-full bg-md-grey-light text-white font-sans text-sm px-3 py-2 border border-md-border
                   placeholder:text-white/40 focus:outline-none focus:border-md focus:bg-md-grey"
      />

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-paper border border-border shadow-xl z-50 max-h-[70vh] overflow-y-auto">
          {loading && (
            <div className="p-4 text-center eyebrow">Buscando…</div>
          )}
          {!loading && results && total === 0 && (
            <div className="p-4 text-center eyebrow text-ink3">Sin resultados</div>
          )}

          {results && results.teams.length > 0 && (
            <div>
              <div className="eyebrow px-3 py-2 bg-surface border-b border-border">Equipos</div>
              {results.teams.map((t) => (
                <Link
                  key={`t-${t.id}`}
                  href={`/equipos/${t.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-surface border-b border-border"
                >
                  {t.image_path && (
                    <Image src={t.image_path} alt={t.name} width={24} height={24} className="shrink-0" />
                  )}
                  <span className="font-display font-semibold uppercase text-sm">{t.name}</span>
                </Link>
              ))}
            </div>
          )}

          {results && results.players.length > 0 && (
            <div>
              <div className="eyebrow px-3 py-2 bg-surface border-b border-border">Jugadores</div>
              {results.players.map((p) => (
                <Link
                  key={`p-${p.id}`}
                  href={`/jugadores/${p.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-surface border-b border-border"
                >
                  {p.image_path ? (
                    <Image src={p.image_path} alt={p.name} width={24} height={24} className="shrink-0 bg-border" />
                  ) : (
                    <div className="w-6 h-6 bg-border shrink-0" />
                  )}
                  <span className="font-display font-semibold uppercase text-sm">{p.name}</span>
                </Link>
              ))}
            </div>
          )}

          {results && results.leagues.length > 0 && (
            <div>
              <div className="eyebrow px-3 py-2 bg-surface border-b border-border">Ligas</div>
              {results.leagues.map((l) => (
                <Link
                  key={`l-${l.id}`}
                  href={`/ligas/${l.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-surface border-b border-border"
                >
                  {l.image_path && (
                    <Image src={l.image_path} alt={l.name} width={24} height={24} className="shrink-0" />
                  )}
                  <span className="font-display font-semibold uppercase text-sm">{l.name}</span>
                  {l.short_code && (
                    <span className="ml-auto font-mono text-[10px] text-ink3">{l.short_code}</span>
                  )}
                </Link>
              ))}
            </div>
          )}

          {query.trim().length >= 2 && (
            <button
              type="button"
              onClick={() => goToSearchPage(query)}
              className="w-full bg-md-black text-white font-display font-semibold uppercase text-xs tracking-wider px-3 py-2.5 hover:bg-md transition-colors"
            >
              Ver todos los resultados →
            </button>
          )}
        </div>
      )}
    </form>
  )
}
