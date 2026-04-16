export type TtsProvider = 'browser' | 'openai' | 'google'

export interface OpenAiVoice {
  id: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'
  name: string
  description: string
}

export const OPENAI_VOICES: OpenAiVoice[] = [
  { id: 'nova', name: 'Nova', description: 'Femenina · cálida y natural' },
  { id: 'shimmer', name: 'Shimmer', description: 'Femenina · suave y moderna' },
  { id: 'alloy', name: 'Alloy', description: 'Neutra · versátil' },
  { id: 'echo', name: 'Echo', description: 'Masculina · clara y serena' },
  { id: 'fable', name: 'Fable', description: 'Masculina · británica' },
  { id: 'onyx', name: 'Onyx', description: 'Masculina · profunda y autoritaria' },
]

export interface GoogleVoice {
  id: string
  name: string
  gender: 'male' | 'female'
  lang: string
  tier: 'Neural2' | 'WaveNet'
}

export const GOOGLE_VOICES: GoogleVoice[] = [
  { id: 'es-ES-Neural2-A', name: 'Elena', gender: 'female', lang: 'es-ES', tier: 'Neural2' },
  { id: 'es-ES-Neural2-B', name: 'Bruno', gender: 'male', lang: 'es-ES', tier: 'Neural2' },
  { id: 'es-ES-Neural2-C', name: 'Clara', gender: 'female', lang: 'es-ES', tier: 'Neural2' },
  { id: 'es-ES-Neural2-D', name: 'Daniel', gender: 'male', lang: 'es-ES', tier: 'Neural2' },
  { id: 'es-ES-Neural2-E', name: 'Elisa', gender: 'female', lang: 'es-ES', tier: 'Neural2' },
  { id: 'es-ES-Neural2-F', name: 'Fernando', gender: 'male', lang: 'es-ES', tier: 'Neural2' },
  { id: 'es-ES-Wavenet-B', name: 'Bruno (WaveNet)', gender: 'male', lang: 'es-ES', tier: 'WaveNet' },
  { id: 'es-ES-Wavenet-C', name: 'Clara (WaveNet)', gender: 'female', lang: 'es-ES', tier: 'WaveNet' },
  { id: 'es-US-Neural2-A', name: 'Ana (Latino)', gender: 'female', lang: 'es-US', tier: 'Neural2' },
  { id: 'es-US-Neural2-B', name: 'Beto (Latino)', gender: 'male', lang: 'es-US', tier: 'Neural2' },
  { id: 'es-US-Neural2-C', name: 'Camila (Latino)', gender: 'female', lang: 'es-US', tier: 'Neural2' },
]
