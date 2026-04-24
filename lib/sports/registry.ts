/**
 * Multi-sport registry. Each sport maps to its ESPN sport/league path and
 * a render "kind" that tells the page how to build its UI.
 *
 * kinds:
 *  - 'scoreboard' — team-vs-team games (NBA, NFL, MLB, NHL, Euroliga).
 *  - 'tennis'     — individual rankings + upcoming tournaments.
 *  - 'racing'     — race schedule + drivers/constructors standings.
 *  - 'golf'       — leaderboard view.
 *  - 'mma'        — upcoming events with fight cards.
 */

export type SportKind = 'scoreboard' | 'tennis' | 'racing' | 'golf' | 'mma'

export interface SportConfig {
  slug: string
  name: string
  tagline: string
  kind: SportKind
  /** ESPN sport path e.g. 'basketball/nba' */
  espnPath: string
  /** Optional ISR seconds for main scoreboard */
  revalidate?: number
  /** Emoji/icon fallback (used in /deportes hub) */
  icon: string
  /** Heading color accent — defaults to MD red */
  accent?: string
}

export const SPORTS: Record<string, SportConfig> = {
  // ========== Basketball ==========
  nba: {
    slug: 'nba',
    name: 'NBA',
    tagline: 'La mejor liga de baloncesto del mundo',
    kind: 'scoreboard',
    espnPath: 'basketball/nba',
    icon: '🏀',
    revalidate: 30,
  },
  wnba: {
    slug: 'wnba',
    name: 'WNBA',
    tagline: 'Baloncesto femenino profesional USA',
    kind: 'scoreboard',
    espnPath: 'basketball/wnba',
    icon: '🏀',
    revalidate: 30,
  },
  euroliga: {
    slug: 'euroliga',
    name: 'Euroliga',
    tagline: 'La élite del baloncesto europeo',
    kind: 'scoreboard',
    espnPath: 'basketball/euroleague',
    icon: '🏀',
    revalidate: 30,
  },

  // ========== American football ==========
  nfl: {
    slug: 'nfl',
    name: 'NFL',
    tagline: 'Fútbol americano profesional',
    kind: 'scoreboard',
    espnPath: 'football/nfl',
    icon: '🏈',
    revalidate: 30,
  },
  'college-football': {
    slug: 'college-football',
    name: 'College Football',
    tagline: 'NCAA fútbol americano universitario',
    kind: 'scoreboard',
    espnPath: 'football/college-football',
    icon: '🏈',
    revalidate: 60,
  },

  // ========== Baseball ==========
  mlb: {
    slug: 'mlb',
    name: 'MLB',
    tagline: 'Grandes Ligas del béisbol',
    kind: 'scoreboard',
    espnPath: 'baseball/mlb',
    icon: '⚾',
    revalidate: 30,
  },

  // ========== Hockey ==========
  nhl: {
    slug: 'nhl',
    name: 'NHL',
    tagline: 'Liga Nacional de Hockey sobre hielo',
    kind: 'scoreboard',
    espnPath: 'hockey/nhl',
    icon: '🏒',
    revalidate: 30,
  },

  // ========== Tennis ==========
  'atp': {
    slug: 'atp',
    name: 'ATP',
    tagline: 'Ranking masculino del tenis mundial',
    kind: 'tennis',
    espnPath: 'tennis/atp',
    icon: '🎾',
    revalidate: 3600,
  },
  'wta': {
    slug: 'wta',
    name: 'WTA',
    tagline: 'Ranking femenino del tenis mundial',
    kind: 'tennis',
    espnPath: 'tennis/wta',
    icon: '🎾',
    revalidate: 3600,
  },

  // ========== Racing ==========
  f1: {
    slug: 'f1',
    name: 'Fórmula 1',
    tagline: 'Campeonato mundial de automovilismo',
    kind: 'racing',
    espnPath: 'racing/f1',
    icon: '🏎',
    revalidate: 600,
  },
  nascar: {
    slug: 'nascar',
    name: 'NASCAR',
    tagline: 'Stock car racing americano',
    kind: 'racing',
    espnPath: 'racing/nascar-premier',
    icon: '🏁',
    revalidate: 600,
  },

  // ========== Golf ==========
  pga: {
    slug: 'pga',
    name: 'PGA Tour',
    tagline: 'Golf profesional masculino',
    kind: 'golf',
    espnPath: 'golf/pga',
    icon: '⛳',
    revalidate: 600,
  },
  lpga: {
    slug: 'lpga',
    name: 'LPGA',
    tagline: 'Golf profesional femenino',
    kind: 'golf',
    espnPath: 'golf/lpga',
    icon: '⛳',
    revalidate: 600,
  },

  // ========== Combat sports ==========
  ufc: {
    slug: 'ufc',
    name: 'UFC',
    tagline: 'Artes marciales mixtas profesionales',
    kind: 'mma',
    espnPath: 'mma/ufc',
    icon: '🥊',
    revalidate: 600,
  },
}

export const SPORT_SLUGS = Object.keys(SPORTS)

export function getSport(slug: string): SportConfig | null {
  return SPORTS[slug] || null
}

/** Sports grouped by category for the /deportes hub. */
export const SPORT_CATEGORIES: Array<{ label: string; slugs: string[] }> = [
  { label: 'Baloncesto', slugs: ['nba', 'euroliga', 'wnba'] },
  { label: 'Fútbol americano', slugs: ['nfl', 'college-football'] },
  { label: 'Béisbol', slugs: ['mlb'] },
  { label: 'Hockey hielo', slugs: ['nhl'] },
  { label: 'Tenis', slugs: ['atp', 'wta'] },
  { label: 'Motor', slugs: ['f1', 'nascar'] },
  { label: 'Golf', slugs: ['pga', 'lpga'] },
  { label: 'MMA / UFC', slugs: ['ufc'] },
]
