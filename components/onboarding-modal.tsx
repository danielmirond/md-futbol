'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { toggleFavorite } from '@/lib/favorites'

interface TeamResult {
  id: number
  name: string
  image_path: string | null
}
interface LeagueResult {
  id: number
  name: string
  image_path: string | null
  short_code: string | null
}

const KEY = 'md-futbol:onboarded'

const SUGGESTED_LEAGUES: LeagueResult[] = [
  { id: 564, name: 'La Liga', image_path: null, short_code: 'ESP' },
  { id: 567, name: 'La Liga 2', image_path: null, short_code: 'ESP' },
  { id: 2, name: 'Champions League', image_path: null, short_code: 'UCL' },
  { id: 5, name: 'Europa League', image_path: null, short_code: 'UEL' },
  { id: 2286, name: 'Conference League', image_path: null, short_code: 'UECL' },
]

export function OnboardingModal() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [teamQuery, setTeamQuery] = useState('')
  const [teamResults, setTeamResults] = useState<TeamResult[]>([])
  const [pickedTeam, setPickedTeam] = useState<TeamResult | null>(null)
  const [pickedLeagues, setPickedLeagues] = useState<Set<number>>(new Set([564]))

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const done = localStorage.getItem(KEY)
      if (!done) {
        // Delay a bit to avoid competing with first paint
        const t = setTimeout(() => setOpen(true), 600)
        return () => clearTimeout(t)
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (teamQuery.trim().length < 2) {
      setTeamResults([])
      return
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(teamQuery.trim())}`)
        if (res.ok) {
          const json = await res.json()
          setTeamResults(json.teams || [])
        }
      } catch {}
    }, 250)
    return () => clearTimeout(timer)
  }, [teamQuery])

  const finish = () => {
    try {
      if (pickedTeam) {
        toggleFavorite({ type: 'team', id: pickedTeam.id, name: pickedTeam.name, image_path: pickedTeam.image_path })
      }
      pickedLeagues.forEach((leagueId) => {
        const l = SUGGESTED_LEAGUES.find((x) => x.id === leagueId)
        if (l) toggleFavorite({ type: 'league', id: l.id, name: l.name, image_path: l.image_path })
      })
      localStorage.setItem(KEY, '1')
    } catch {}
    setOpen(false)
  }

  const skip = () => {
    try { localStorage.setItem(KEY, '1') } catch {}
    setOpen(false)
  }

  const toggleLeague = (id: number) => {
    setPickedLeagues((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] bg-md-black/80 flex items-center justify-center p-4">
      <div className="bg-paper w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
        <div className="md-bar" />
        <button
          onClick={skip}
          aria-label="Omitir"
          className="absolute top-3 right-3 font-mono text-[10px] uppercase tracking-wider text-ink3 hover:text-ink px-2 py-1"
        >
          Omitir
        </button>

        <div className="p-6 md:p-8 space-y-5">
          {step === 0 && (
            <>
              <div className="eyebrow">BIENVENIDO</div>
              <h2 className="font-display font-bold text-3xl md:text-4xl uppercase tracking-tight leading-tight">
                Tu fútbol, <span className="text-md">personalizado</span>.
              </h2>
              <p className="font-sans text-ink2">
                En 20 segundos configuramos tu feed. Elige tu equipo y las competiciones que sigues y verás tu próximo partido, clasificación y goleadores siempre primero.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <button onClick={() => setStep(1)} className="btn-md">Empezar</button>
                <button onClick={skip} className="btn-ghost">Ahora no</button>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="eyebrow">PASO 1 DE 2</div>
              <h2 className="font-display font-bold text-2xl md:text-3xl uppercase tracking-tight">
                ¿Cuál es tu <span className="text-md">equipo</span>?
              </h2>
              <input
                autoFocus
                type="search"
                value={teamQuery}
                onChange={(e) => setTeamQuery(e.target.value)}
                placeholder="Buscar tu equipo (ej. Barcelona)"
                className="w-full bg-surface border border-border px-3 py-2.5 font-sans text-sm focus:outline-none focus:border-md"
              />
              <div className="max-h-64 overflow-y-auto border border-border divide-y divide-border">
                {teamResults.length === 0 && teamQuery.trim().length >= 2 && (
                  <div className="p-3 text-center text-ink3 text-sm font-mono">Sin resultados</div>
                )}
                {teamResults.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setPickedTeam(t)}
                    className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-surface text-left ${
                      pickedTeam?.id === t.id ? 'bg-accent/20' : ''
                    }`}
                  >
                    {t.image_path && <Image src={t.image_path} alt={t.name} width={28} height={28} />}
                    <span className="font-display font-semibold uppercase text-sm">{t.name}</span>
                    {pickedTeam?.id === t.id && <span className="ml-auto text-md font-bold">✓</span>}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between gap-3 pt-2">
                <button onClick={() => setStep(0)} className="btn-ghost">← Atrás</button>
                <button
                  onClick={() => setStep(2)}
                  className="btn-md"
                  disabled={false}
                >
                  {pickedTeam ? 'Siguiente' : 'Saltar'} →
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="eyebrow">PASO 2 DE 2</div>
              <h2 className="font-display font-bold text-2xl md:text-3xl uppercase tracking-tight">
                Tus <span className="text-md">competiciones</span>
              </h2>
              <p className="font-sans text-ink2 text-sm">Selecciona las que quieras seguir. Puedes cambiarlas después.</p>
              <div className="grid grid-cols-1 gap-2">
                {SUGGESTED_LEAGUES.map((l) => {
                  const active = pickedLeagues.has(l.id)
                  return (
                    <button
                      key={l.id}
                      onClick={() => toggleLeague(l.id)}
                      className={`flex items-center gap-3 border px-3 py-2.5 text-left transition-colors ${
                        active ? 'border-md bg-md/5' : 'border-border hover:border-md/60'
                      }`}
                    >
                      <span className={`font-display font-bold text-lg ${active ? 'text-md' : 'text-ink3'}`}>
                        {active ? '★' : '☆'}
                      </span>
                      <span className="font-display font-semibold uppercase text-sm flex-1">{l.name}</span>
                      {l.short_code && <span className="font-mono text-[10px] text-ink3">{l.short_code}</span>}
                    </button>
                  )
                })}
              </div>
              <div className="flex items-center justify-between gap-3 pt-2">
                <button onClick={() => setStep(1)} className="btn-ghost">← Atrás</button>
                <button onClick={finish} className="btn-md">Terminar ✓</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
