export type FavoriteType = 'team' | 'league' | 'player'

export interface Favorite {
  type: FavoriteType
  id: number
  name: string
  image_path?: string | null
  addedAt: number
}

const KEY = 'md-futbol:favorites'

export function getFavorites(): Favorite[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function isFavorite(type: FavoriteType, id: number): boolean {
  return getFavorites().some((f) => f.type === type && f.id === id)
}

export function toggleFavorite(fav: Omit<Favorite, 'addedAt'>): boolean {
  const current = getFavorites()
  const existing = current.findIndex((f) => f.type === fav.type && f.id === fav.id)
  let next: Favorite[]
  let added: boolean
  if (existing >= 0) {
    next = current.filter((_, i) => i !== existing)
    added = false
  } else {
    next = [...current, { ...fav, addedAt: Date.now() }]
    added = true
  }
  localStorage.setItem(KEY, JSON.stringify(next))
  // Dispatch event so other components can react
  window.dispatchEvent(new CustomEvent('favorites:changed'))
  return added
}

export function removeFavorite(type: FavoriteType, id: number) {
  const current = getFavorites()
  const next = current.filter((f) => !(f.type === type && f.id === id))
  localStorage.setItem(KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('favorites:changed'))
}
