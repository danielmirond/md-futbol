import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 30

const GOOGLE_VOICES = [
  { id: 'es-ES-Neural2-A', name: 'Elena (Neural2)', gender: 'female', lang: 'es-ES' },
  { id: 'es-ES-Neural2-B', name: 'Bruno (Neural2)', gender: 'male', lang: 'es-ES' },
  { id: 'es-ES-Neural2-C', name: 'Clara (Neural2)', gender: 'female', lang: 'es-ES' },
  { id: 'es-ES-Neural2-D', name: 'Daniel (Neural2)', gender: 'male', lang: 'es-ES' },
  { id: 'es-ES-Neural2-E', name: 'Elisa (Neural2)', gender: 'female', lang: 'es-ES' },
  { id: 'es-ES-Neural2-F', name: 'Fernando (Neural2)', gender: 'male', lang: 'es-ES' },
  { id: 'es-ES-Wavenet-B', name: 'Bruno (WaveNet)', gender: 'male', lang: 'es-ES' },
  { id: 'es-ES-Wavenet-C', name: 'Clara (WaveNet)', gender: 'female', lang: 'es-ES' },
  { id: 'es-ES-Wavenet-D', name: 'Daniel (WaveNet)', gender: 'male', lang: 'es-ES' },
  { id: 'es-US-Neural2-A', name: 'Ana (Latino)', gender: 'female', lang: 'es-US' },
  { id: 'es-US-Neural2-B', name: 'Beto (Latino)', gender: 'male', lang: 'es-US' },
  { id: 'es-US-Neural2-C', name: 'Camila (Latino)', gender: 'female', lang: 'es-US' },
]

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GOOGLE_TTS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'GOOGLE_TTS_API_KEY no configurada' }, { status: 500 })
    }

    const { text, voice = 'es-ES-Neural2-A', speed = 1.0, pitch = 0 } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text requerido' }, { status: 400 })
    }
    if (text.length > 4000) {
      return NextResponse.json({ error: 'Texto demasiado largo (max 4000 chars)' }, { status: 400 })
    }

    const voiceConfig = GOOGLE_VOICES.find((v) => v.id === voice) || GOOGLE_VOICES[0]

    const body = {
      input: { text },
      voice: {
        languageCode: voiceConfig.lang,
        name: voiceConfig.id,
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: Math.max(0.25, Math.min(4.0, Number(speed) || 1.0)),
        pitch: Math.max(-20, Math.min(20, Number(pitch) || 0)),
      },
    }

    const res = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    )

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: `Google TTS: ${err.slice(0, 200)}` }, { status: res.status })
    }

    const json = await res.json()
    const audioContent = json.audioContent as string
    if (!audioContent) {
      return NextResponse.json({ error: 'Respuesta sin audio' }, { status: 500 })
    }

    // Decode base64 to buffer
    const buffer = Buffer.from(audioContent, 'base64')
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
