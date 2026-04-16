import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 30

const OPENAI_VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'] as const

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY no configurada' }, { status: 500 })
    }

    const { text, voice = 'nova', speed = 1.0 } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text requerido' }, { status: 400 })
    }
    if (text.length > 4000) {
      return NextResponse.json({ error: 'Texto demasiado largo (max 4000 chars)' }, { status: 400 })
    }

    const voiceId = (OPENAI_VOICES as readonly string[]).includes(voice) ? voice : 'nova'

    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice: voiceId,
        input: text,
        speed: Math.max(0.25, Math.min(4.0, Number(speed) || 1.0)),
        response_format: 'mp3',
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: `OpenAI TTS: ${err.slice(0, 200)}` }, { status: res.status })
    }

    const audioBuffer = await res.arrayBuffer()
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
