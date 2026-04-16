'use client'

import { useEffect, useRef, useState } from 'react'
import { OPENAI_VOICES, GOOGLE_VOICES, type TtsProvider } from '@/lib/tts-providers'

interface Props {
  fixtureId: number
}

interface Data {
  headline: string
  body: string
  audio: string
  mvp: string
  mvpReason: string
}

const PROVIDER_KEY = 'md-futbol:tts-provider'
const BROWSER_VOICE_KEY = 'md-futbol:browser-voice'
const OPENAI_VOICE_KEY = 'md-futbol:openai-voice'
const GOOGLE_VOICE_KEY = 'md-futbol:google-voice'
const RATE_KEY = 'md-futbol:tts-rate'

export function Chronicle({ fixtureId }: Props) {
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [audioLoading, setAudioLoading] = useState(false)

  const [provider, setProvider] = useState<TtsProvider>('browser')
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([])
  const [browserVoice, setBrowserVoice] = useState('')
  const [openaiVoice, setOpenaiVoice] = useState<string>('nova')
  const [googleVoice, setGoogleVoice] = useState<string>('es-ES-Neural2-A')
  const [rate, setRate] = useState(1.05)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioUrlRef = useRef<string | null>(null)

  // Load preferences + browser voices
  useEffect(() => {
    if (typeof window === 'undefined') return

    const p = localStorage.getItem(PROVIDER_KEY) as TtsProvider | null
    if (p && ['browser', 'openai', 'google'].includes(p)) setProvider(p)

    const savedOpenai = localStorage.getItem(OPENAI_VOICE_KEY)
    if (savedOpenai) setOpenaiVoice(savedOpenai)

    const savedGoogle = localStorage.getItem(GOOGLE_VOICE_KEY)
    if (savedGoogle) setGoogleVoice(savedGoogle)

    const savedRate = parseFloat(localStorage.getItem(RATE_KEY) || '1.05')
    if (!isNaN(savedRate)) setRate(savedRate)

    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const all = window.speechSynthesis.getVoices()
        const filtered = all
          .filter((v) => /^(es|ca)/i.test(v.lang))
          .sort((a, b) => {
            const aPremium = /neural|premium|enhanced|wavenet|studio/i.test(a.name) ? 1 : 0
            const bPremium = /neural|premium|enhanced|wavenet|studio/i.test(b.name) ? 1 : 0
            if (aPremium !== bPremium) return bPremium - aPremium
            return a.name.localeCompare(b.name)
          })
        setBrowserVoices(filtered.length > 0 ? filtered : all)

        const saved = localStorage.getItem(BROWSER_VOICE_KEY)
        if (saved && all.find((v) => v.name === saved)) setBrowserVoice(saved)
        else if (filtered.length > 0) setBrowserVoice(filtered[0].name)
      }
      loadVoices()
      window.speechSynthesis.onvoiceschanged = loadVoices
      return () => { window.speechSynthesis.onvoiceschanged = null }
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current)
        audioUrlRef.current = null
      }
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

  function stopAudio() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setPlaying(false)
  }

  async function playAudio() {
    if (!data) return
    if (playing) {
      stopAudio()
      return
    }

    setError(null)

    if (provider === 'browser') {
      if (!('speechSynthesis' in window)) {
        setError('Tu navegador no soporta síntesis de voz')
        return
      }
      const utter = new SpeechSynthesisUtterance(data.audio)
      const voice = browserVoices.find((v) => v.name === browserVoice)
      if (voice) {
        utter.voice = voice
        utter.lang = voice.lang
      } else {
        utter.lang = 'es-ES'
      }
      utter.rate = rate
      utter.onend = () => setPlaying(false)
      utter.onerror = () => setPlaying(false)
      window.speechSynthesis.cancel()
      setTimeout(() => {
        window.speechSynthesis.speak(utter)
        setPlaying(true)
      }, 50)
      return
    }

    // OpenAI or Google — fetch MP3
    setAudioLoading(true)
    try {
      const endpoint = provider === 'openai' ? '/api/tts/openai' : '/api/tts/google'
      const voiceId = provider === 'openai' ? openaiVoice : googleVoice

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: data.audio, voice: voiceId, speed: rate }),
      })

      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `Error ${res.status}`)
      }

      const blob = await res.blob()
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current)
      const url = URL.createObjectURL(blob)
      audioUrlRef.current = url

      if (!audioRef.current) audioRef.current = new Audio()
      audioRef.current.src = url
      audioRef.current.onended = () => setPlaying(false)
      audioRef.current.onerror = () => {
        setPlaying(false)
        setError('Error al reproducir audio')
      }
      await audioRef.current.play()
      setPlaying(true)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setAudioLoading(false)
    }
  }

  const onProviderChange = (p: TtsProvider) => {
    stopAudio()
    setProvider(p)
    localStorage.setItem(PROVIDER_KEY, p)
  }

  if (!data) {
    return (
      <section className="bg-paper border border-border p-6 md:p-8 relative">
        <div className="md-bar absolute top-0 left-0 right-0" />
        <div className="eyebrow text-md mb-2">🤖 CRÓNICA IA</div>
        <h2 className="font-display font-bold text-2xl md:text-3xl uppercase mb-3">
          Genera la crónica con IA
        </h2>
        <p className="font-sans text-ink2 mb-5 max-w-xl">
          Claude analiza eventos, marcadores y escribe una crónica editorial con MVP y un resumen locutado de 1 minuto. Luego puedes escucharlo con voces del navegador, OpenAI o Google Cloud.
        </p>
        <button onClick={generate} disabled={loading} className="btn-md disabled:opacity-50">
          {loading ? '⚡ GENERANDO…' : '✨ GENERAR CRÓNICA'}
        </button>
        {error && <p className="font-mono text-xs text-md mt-3 uppercase tracking-wider">{error}</p>}
      </section>
    )
  }

  const ProviderButton = ({ p, label, sub }: { p: TtsProvider; label: string; sub: string }) => (
    <button
      onClick={() => onProviderChange(p)}
      className={`flex-1 p-3 border text-left transition-colors ${
        provider === p
          ? 'bg-md-black text-white border-md-black'
          : 'bg-paper text-ink border-border hover:border-md'
      }`}
    >
      <div className="font-display font-semibold uppercase text-xs">{label}</div>
      <div className={`font-mono text-[9px] mt-0.5 ${provider === p ? 'text-white/60' : 'text-ink3'}`}>
        {sub}
      </div>
    </button>
  )

  return (
    <section className="bg-paper border border-border p-6 md:p-8 relative">
      <div className="md-bar absolute top-0 left-0 right-0" />

      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <span className="eyebrow text-md">🤖 CRÓNICA IA</span>
        <button
          onClick={playAudio}
          disabled={audioLoading}
          className={`font-display font-semibold uppercase tracking-wider text-xs px-3 py-2 border transition-colors ${
            playing
              ? 'bg-md text-white border-md animate-pulse'
              : 'bg-md-black text-white border-md-black hover:bg-md hover:border-md disabled:opacity-50'
          }`}
        >
          {audioLoading ? '⏳ GENERANDO AUDIO…' : playing ? '⏸ PAUSAR' : '▶ ESCUCHAR 1 MIN'}
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

      {/* Audio controls */}
      <div className="mt-6 bg-surface border border-border p-4 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="eyebrow">🎙 RESUMEN AUDIO · ~1 MIN</span>
          <span className="font-mono text-xs text-ink3">
            ~{data.audio.split(/\s+/).length} palabras
          </span>
        </div>

        {/* Provider selector */}
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-wider text-ink3 mb-2">
            Proveedor de voz
          </label>
          <div className="flex gap-2 flex-wrap">
            <ProviderButton p="browser" label="🌐 Navegador" sub={`${browserVoices.length} voces · gratis`} />
            <ProviderButton p="openai" label="⚡ OpenAI" sub="6 voces · ultra-naturales" />
            <ProviderButton p="google" label="🔊 Google" sub={`${GOOGLE_VOICES.length} voces · WaveNet`} />
          </div>
        </div>

        {/* Voice + rate */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-ink3 mb-1">
              Voz
            </label>
            {provider === 'browser' && (
              <select
                value={browserVoice}
                onChange={(e) => {
                  setBrowserVoice(e.target.value)
                  localStorage.setItem(BROWSER_VOICE_KEY, e.target.value)
                  if (playing) stopAudio()
                }}
                className="w-full font-mono text-xs bg-paper border border-border px-2 py-2 focus:outline-none focus:border-md"
              >
                {browserVoices.length === 0 && <option>Sin voces disponibles</option>}
                {browserVoices.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} · {v.lang}
                    {v.localService ? ' · local' : ' · online'}
                  </option>
                ))}
              </select>
            )}
            {provider === 'openai' && (
              <select
                value={openaiVoice}
                onChange={(e) => {
                  setOpenaiVoice(e.target.value)
                  localStorage.setItem(OPENAI_VOICE_KEY, e.target.value)
                  if (playing) stopAudio()
                }}
                className="w-full font-mono text-xs bg-paper border border-border px-2 py-2 focus:outline-none focus:border-md"
              >
                {OPENAI_VOICES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} — {v.description}
                  </option>
                ))}
              </select>
            )}
            {provider === 'google' && (
              <select
                value={googleVoice}
                onChange={(e) => {
                  setGoogleVoice(e.target.value)
                  localStorage.setItem(GOOGLE_VOICE_KEY, e.target.value)
                  if (playing) stopAudio()
                }}
                className="w-full font-mono text-xs bg-paper border border-border px-2 py-2 focus:outline-none focus:border-md"
              >
                {GOOGLE_VOICES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} · {v.gender} · {v.lang} · {v.tier}
                  </option>
                ))}
              </select>
            )}
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
              onChange={(e) => {
                const r = parseFloat(e.target.value)
                setRate(r)
                localStorage.setItem(RATE_KEY, String(r))
              }}
              className="w-full sm:w-40 h-9 accent-md"
            />
          </div>
        </div>

        {provider === 'openai' && (
          <p className="font-mono text-[10px] text-ink3">
            ℹ OpenAI TTS genera el audio en el servidor (~3s, voces muy naturales).
          </p>
        )}
        {provider === 'google' && (
          <p className="font-mono text-[10px] text-ink3">
            ℹ Google WaveNet es gratis hasta 1M caracteres/mes.
          </p>
        )}

        <p className="font-sans text-sm text-ink2 italic pt-2 border-t border-border">
          {data.audio}
        </p>
      </div>
    </section>
  )
}
