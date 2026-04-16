import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getFixture } from '@/lib/sportmonks/fixtures'

export const runtime = 'nodejs'
export const maxDuration = 60

interface ChronicleOutput {
  headline: string
  body: string
  audio: string     // ~150 words for ~1min audio
  mvp: string
  mvpReason: string
}

export async function POST(request: Request) {
  try {
    const { fixtureId, language = 'es' } = await request.json()
    if (!fixtureId) return NextResponse.json({ error: 'fixtureId required' }, { status: 400 })

    const fixture = await getFixture(parseInt(fixtureId, 10))
    if (!fixture) return NextResponse.json({ error: 'Fixture not found' }, { status: 404 })

    const finished = fixture.state?.developer_name === 'FT' || fixture.state?.developer_name === 'AET'
    if (!finished) {
      return NextResponse.json({ error: 'Match not finished yet' }, { status: 400 })
    }

    const home = fixture.participants?.find((p) => p.meta?.location === 'home')
    const away = fixture.participants?.find((p) => p.meta?.location === 'away')
    const homeScore = fixture.scores?.find((s) => s.score?.participant === 'home' && s.description === 'CURRENT')?.score.goals
    const awayScore = fixture.scores?.find((s) => s.score?.participant === 'away' && s.description === 'CURRENT')?.score.goals
    const events = (fixture as any).events as any[] | undefined

    const eventsDesc = (events || [])
      .sort((a, b) => (a.minute || 0) - (b.minute || 0))
      .map((e) => {
        const team = e.participant_id === home?.id ? (home?.name || 'local') : (away?.name || 'visitante')
        return `${e.minute || '?'}' - ${e.type?.name || e.type_id || '?'}: ${e.player_name || 'Jugador'} (${team})`
      })
      .join('\n')

    const lang = language === 'ca' ? 'ca' : 'es'
    const system = lang === 'ca'
      ? 'Ets un periodista esportiu català de Mundo Deportivo. Escrius cròniques vives, precises i apassionades sense ser sensacionalista. Escriu sempre en català.'
      : 'Eres un periodista deportivo de Mundo Deportivo. Escribes crónicas vivas, precisas y apasionadas sin ser sensacionalista. Escribe siempre en español.'

    const prompt = `Genera una crónica del siguiente partido finalizado:

${home?.name} ${homeScore} - ${awayScore} ${away?.name}
Competición: ${fixture.league?.name} ${fixture.round?.name ? `· Jornada ${fixture.round.name}` : ''}
Estadio: ${fixture.venue?.name || '—'}

Eventos (minuto, tipo, jugador, equipo):
${eventsDesc || 'Sin eventos registrados.'}

Responde ÚNICAMENTE en JSON válido con estos campos exactos (sin markdown, sin texto extra):
{
  "headline": "Titular potente (máx 90 caracteres)",
  "body": "Crónica completa de 500-700 palabras, párrafos separados por doble salto de línea",
  "audio": "Resumen locutado apto para audio de 1 minuto, 140-160 palabras, frases cortas, ritmo narrativo con énfasis en lo importante. SIN emojis.",
  "mvp": "Nombre del jugador MVP",
  "mvpReason": "Justificación en 1-2 frases (máx 150 caracteres)"
}`

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const res = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 3000,
      system,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = res.content[0].type === 'text' ? res.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return NextResponse.json({ error: 'Parse error' }, { status: 500 })

    const data = JSON.parse(jsonMatch[0]) as ChronicleOutput
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
