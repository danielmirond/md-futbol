export interface SmLeague {
  id: number
  name: string
  short_code: string | null
  image_path: string | null
  country_id: number
  sub_type: string
  last_played_at: string | null
  active: boolean
}

export interface SmTeam {
  id: number
  name: string
  short_code: string | null
  image_path: string | null
  country_id: number
  founded: number | null
  meta?: {
    location?: 'home' | 'away'
    winner?: boolean | null
    position?: number
  }
}

export interface SmScore {
  id: number
  fixture_id: number
  type_id: number
  participant_id: number
  score: { goals: number; participant: 'home' | 'away' }
  description: string
}

export interface SmFixture {
  id: number
  league_id: number
  season_id: number
  name: string
  starting_at: string
  state_id: number
  result_info: string | null
  length: number
  venue_id: number | null
  leg?: string | null              // e.g. "1/2", "2/2"
  aggregate_id?: number | null     // Set when match is part of a 2-leg tie
  participants?: SmTeam[]
  scores?: SmScore[]
  league?: SmLeague
  round?: { id: number; name: string }
  state?: { id: number; name: string; short_name: string; developer_name: string }
  venue?: { id: number; name: string; city_name?: string }
}

export interface SmStandingRow {
  id: number
  participant_id: number
  position: number
  points: number
  group_id: number | null
  round_id: number | null
  standing_rule_id: number
  participant?: SmTeam
  details?: SmStandingDetail[]
  form?: SmStandingForm[]
}

export interface SmStandingDetail {
  id: number
  type_id: number
  value: number
  type?: { id: number; name: string; developer_name: string }
}

export interface SmStandingForm {
  form: 'W' | 'D' | 'L'
  sort_order: number
  fixture_id: number
}
