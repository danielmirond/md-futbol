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

const VOICE_STORAGE_KEY = 'md-futbol:voice'
const RATE_STORAGE_KEY = 'md-futbol:voice-rate'

export function Chronicle({ fixtureId }: Props) {
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('')
  const [rate, setRate] = useState(1.05)
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Load available voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    const loadVoices = () => {
      const all = window.speechSynthesis.getVoices()
      // Filter Spanish and Catalan voices, sort by quality indicators
      const filtered = all
        .filter((v) => /^(es|ca)/i.test(v.lang))
        .sort((a, b) => {
          // Prioritize neural/premium voices
          const aPremium = /neural|premium|enhanced|wavenet|studio/i.test(a.name) ? 1 : 0
          const bPremium = /neural|premium|enhanced|wavenet|studio/i.test(b.name) ? 1 : 0
          if (aPremium !== bPremium) return bPremium - aPremium
          return a.name.localeCompare(b.name)
        })

      setVoices(filtered.length > 0 ? filtered : all)

      const saved = localStorage.getItem(VOICE_STORAGE_KEY)
      if (saved && (filtered.find((v) => v.name === saved) || all.find((v) => v.name === saved))) {
        setSelectedVoiceName(saved)
      } else if (filtered.length > 0) {
        setSelectedVoiceName(filtered[0].name)
      }

      const savedRate = parseFloat(localStorage.getItem(RATE_STORAGE_KEY) || '1.05')
      if (!isNaN(savedRate)) setRate(savedRate)
    }

    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [])

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
    const voice = voices.find((v) => v.name === selectedVoiceName)
    if (voice) {
      utter.voice = voice
      utter.lang = voice.lang
    } else {
      utter.lang = 'es-ES'
    }
    utter.rate = rate
    utter.pitch = 1
    utter.onend = () => setPlaying(false)
    utter.onerror = () => setPlaying(false)
    utterRef.current = utter

    // Chrome bug fix: force re-initialization
    window.speechSynthesis.cancel()
    setTimeout(() => {
      window.speechSynthesis.speak(utter)
      setPlaying(true)
    }, 50)
  }

  function onVoiceChange(name: string) {
    setSelectedVoiceName(name)
    localStorage.setItem(VOICE_STORAGE_KEY, name)
    if (playing) {
      window.speechSynthesis.cancel()
      setPlaying(false)
    }
  }

  function onRateChange(newRate: number) {
    setRate(newRate)
    localStorage.setItem(RATE_STORAGE_KEY, String(newRate))
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
          Claude analiza eventos, marcadores y escribe una crónica editorial con MVP y un resumen locutado de 1 minuto que puedes reproducir en audio con la voz que prefieras.
        </p>
        <button onClick={generate} disabled={loading} className="btn-md disabled:opacity-50">
          {loading ? '⚡ GENERANDO…' : '✨ GENERAR CRÓNICA'}
        </button>
        {error && <p className="font-mono text-xs text-md mt-3 uppercase tracking-wider">{error}</p>}
      </section>
    )
  }

  const currentVoice = voices.find((v) => v.name === selectedVoiceName)

  return (
    <section className="bg-paper border border-border p-6 md:p-8 relative">
      <div className="md-bar absolute top-0 left-0 right-0" />

      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <span className="eyebrow text-md">🤖 CRÓNICA IA</span>
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
          <p
            key={i}
            className={
              i === 0
                ? 'first-letter:text-5xl first-letter:font-display first-letter:font-bold first-letter:float-left first-letter:mr-2 first-letter:leading-none first-letter:text-md'
                : ''
            }
          >
            {p}
          </p>
        ))}
      </div>

      <div className="mt-8 bg-md-black text-white p-5 border-l-4 border-md">
        <div className="eyebrow text-md mb-2">🏆 MVP DEL PARTIDO</div>
        <div className="font-display font-bold text-2xl md:text-3xl uppercase">{data.mvp}</div>
        <p className="font-sans text-sm text-white/70 mt-2">{data.mvpReason}</p>
      </div>

      {/* Voice controls */}
      <div className="mt-6 bg-surface border border-border p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="eyebrow">🎙 RESUMEN AUDIO · ~1 MIN</span>
          <span className="font-mono text-xs text-ink3">
            ~{data.audio.split(/\s+/).length} palabras
          </span>
        </div>

        {voices.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-ink3 mb-1">
                Voz · {voices.length} disponibles
              </label>
              <select
                value={selectedVoiceName}
                onChange={(e) => onVoiceChange(e.target.value)}
                className="w-full font-mono text-xs bg-paper border border-border px-2 py-2 focus:outline-none focus:border-md"
              >
                {voices.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} · {v.lang}
                    {v.localService ? ' · local' : ' · online'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-ink3 mb-1">
                Velocidad · {rate.toFixed(2)}x
              </label>
              <input
                type="range"
                min="0.7"
                max="1.5"
                step="0.05"
                value={rate}
                onChange={(e) => onRateChange(parseFloat(e.target.value))}
                className="w-full sm:w-32 h-9 accent-md"
              />
            </div>
          </div>
        )}

        {voices.length === 0 && (
          <p className="font-mono text-[11px] text-ink3">
            No se detectaron voces en español. El audio usará la voz por defecto del sistema.
          </p>
        )}

        <p className="font-sans text-sm text-ink2 italic pt-2 border-t border-border">
          {data.audio}
        </p>

        {currentVoice && !currentVoice.localService && (
          <p className="font-mono text-[10px] text-ink3">
            ℹ La voz &ldquo;{currentVoice.name}&rdquo; es online: requiere conexión al reproducir.
          </p>
        )}
      </div>
    </section>
  )
}
