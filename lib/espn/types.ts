/** ESPN shared response shapes. Deliberately loose — ESPN doesn't publish a schema. */

export interface EspnImage {
  href: string
  alt?: string
}

export interface EspnLogo {
  href: string
  width?: number
  height?: number
  alt?: string
}

export interface EspnTeam {
  id: string
  abbreviation?: string
  displayName?: string
  shortDisplayName?: string
  name?: string
  location?: string
  color?: string
  alternateColor?: string
  logo?: string
  logos?: EspnLogo[]
}

export interface EspnCompetitor {
  id: string
  homeAway?: 'home' | 'away'
  winner?: boolean
  score?: string
  records?: Array<{ name: string; summary: string; type?: string }>
  team?: EspnTeam
  statistics?: Array<{ name: string; displayValue: string; abbreviation?: string }>
  linescores?: Array<{ value: number }>
  leaders?: Array<any>
}

export interface EspnStatus {
  type: {
    id?: string
    name?: string
    state?: 'pre' | 'in' | 'post'
    completed?: boolean
    description?: string
    detail?: string
    shortDetail?: string
  }
  displayClock?: string
  period?: number
  clock?: number
}

export interface EspnCompetition {
  id: string
  date: string
  attendance?: number
  venue?: { id: string; fullName?: string; address?: { city?: string; country?: string } }
  competitors: EspnCompetitor[]
  status?: EspnStatus
  broadcasts?: Array<{ market: string; names: string[] }>
}

export interface EspnEvent {
  id: string
  date: string
  name: string
  shortName?: string
  status?: EspnStatus
  season?: { year: number; type?: number }
  week?: { number: number }
  competitions: EspnCompetition[]
  leagues?: EspnLeague[]
  links?: Array<{ href: string; text?: string; rel?: string[] }>
}

export interface EspnLeague {
  id: string
  uid?: string
  name: string
  abbreviation?: string
  slug?: string
  logos?: EspnLogo[]
  season?: { year: number; type?: { id: string; type?: number; name?: string; abbreviation?: string } }
}

export interface EspnScoreboardResponse {
  leagues?: EspnLeague[]
  season?: { type?: number; year?: number }
  day?: { date: string }
  events: EspnEvent[]
}

export interface EspnStandingsEntry {
  team: EspnTeam
  stats: Array<{
    id?: string
    name?: string
    displayName?: string
    shortDisplayName?: string
    description?: string
    abbreviation?: string
    type?: string
    value?: number
    displayValue?: string
  }>
  note?: { color?: string; description?: string }
}

export interface EspnStandingsGroup {
  id?: string
  name?: string
  abbreviation?: string
  standings?: {
    entries: EspnStandingsEntry[]
  }
  children?: EspnStandingsGroup[]
}

export interface EspnStandingsResponse {
  name?: string
  abbreviation?: string
  standings?: { entries: EspnStandingsEntry[] }
  children?: EspnStandingsGroup[]
}

export interface EspnAthlete {
  id: string
  firstName?: string
  lastName?: string
  fullName?: string
  displayName?: string
  shortName?: string
  weight?: number
  height?: number
  age?: number
  dateOfBirth?: string
  headshot?: { href: string; alt?: string }
  flag?: { href: string; alt?: string }
  team?: { id: string; displayName?: string; logo?: string }
  position?: { name?: string; displayName?: string; abbreviation?: string }
}
