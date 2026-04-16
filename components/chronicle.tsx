'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  fixtureId: number
  homeTeam?: string
  awayTeam?: string
  homeScore?: number | null
  awayScore?: number | null
}

interface Data {
  headline: string
  body: string
  audio: string
  mvp: string
  mvpReason: string
}

export function Chronicle({ fixtureId, homeTeam, awayTeam, homeScore, awayScore }: Props) {
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null)

  async function generate() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/chronicle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fixtureId, language: 'es' }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error generando crónica')
      setData(json)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  function playAudio() {
    if (!data) return
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setError('Tu navegador no soporta síntesis de voz')
      return
    }

    if (playing) {
      window.speechSynthesis.cancel()
      setPlaying(false)
      return
    }

    const utter = new SpeechSynthesisUtterance(data.audio)
    utter.lang = 'es-ES'
    utter.rate = 1.05
    utter.pitch = 1
    utter.onend = () => setPlaying(false)
    utter.onerror = () => setPlaying(false)
    utterRef.current = utter
    window.speechSynthesis.speak(utter)
    setPlaying(true)
  }

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  if (!data) {
    return (
      <section className="bg-paper border border-border p-6 md:p-8 relative">
        <div className="md-bar absolute top-0 left-0 right-0" />
        <div className="eyebrow text-md mb-2">🤖 CRÓNICA IA</div>
        <h2 className="font-display font-bold text-2xl md:text-3xl uppercase mb-3">
          Genera la crónica con IA
        </h2>
        <p className="font-sans text-ink2 mb-5 max-w-xl">
          Claude analiza eventos, marcadores y escribe una crónica editorial con MVP y un resumen locutado de 1 minuto que puedes reproducir en audio.
        </p>
        <button
          onClick={generate}
          disabled={loading}
          className="btn-md disabled:opacity-50"
        >
          {loading ? '⚡ GENERANDO…' : '✨ GENERAR CRÓNICA'}
        </button>
        {error && (
          <p className="font-mono text-xs text-md mt-3 uppercase tracking-wider">{error}</p>
        )}
      </section>
    )
  }

  return (
    <section className="bg-paper border border-border p-6 md:p-8 relative">
      <div className="md-bar absolute top-0 left-0 right-0" />

      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="eyebrow text-md">🤖 CRÓNICA IA</span>
        </div>
        <button
          onClick={playAudio}
          className={`font-display font-semibold uppercase tracking-wider text-xs px-3 py-2 border transition-colors ${
            playing
              ? 'bg-md text-white border-md animate-pulse'
              : 'bg-md-black text-white border-md-black hover:bg-md hover:border-md'
          }`}
        >
          {playing ? '⏸ PAUSAR' : '▶ ESCUCHAR 1 MIN'}
        </button>
      </div>

      <h2 className="font-display font-bold text-3xl md:text-5xl uppercase tracking-tight leading-[0.95] mb-6">
        {data.headline}
      </h2>

      <div className="space-y-4 font-sans text-ink2 leading-relaxed">
        {data.body.split('\n\n').map((p, i) => (
          <p key={i} className={i === 0 ? 'first-letter:text-5xl first-letter:font-display first-letter:font-bold first-letter:float-left first-letter:mr-2 first-letter:leading-none first-letter:text-md' : ''}>
            {p}
          </p>
        ))}
      </div>

      <div className="mt-8 bg-md-black text-white p-5 border-l-4 border-md">
        <div className="eyebrow text-md mb-2">🏆 MVP DEL PARTIDO</div>
        <div className="font-display font-bold text-2xl md:text-3xl uppercase">{data.mvp}</div>
        <p className="font-sans text-sm text-white/70 mt-2">{data.mvpReason}</p>
      </div>

      <div className="mt-6 bg-surface border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="eyebrow">🎙 RESUMEN AUDIO · ~1 MIN</span>
          <span className="font-mono text-xs text-ink3">
            ~{data.audio.split(/\s+/).length} palabras
          </span>
        </div>
        <p className="font-sans text-sm text-ink2 italic">{data.audio}</p>
      </div>
    </section>
  )
}
