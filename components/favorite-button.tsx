'use client'

import { useEffect, useState } from 'react'
import type { FavoriteType } from '@/lib/favorites'
import { isFavorite, toggleFavorite } from '@/lib/favorites'

interface Props {
  type: FavoriteType
  id: number
  name: string
  imagePath?: string | null
  size?: 'sm' | 'md' | 'lg'
  variant?: 'light' | 'dark'
}

export function FavoriteButton({ type, id, name, imagePath, size = 'md', variant = 'dark' }: Props) {
  const [favorited, setFavorited] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setFavorited(isFavorite(type, id))

    const handler = () => setFavorited(isFavorite(type, id))
    window.addEventListener('favorites:changed', handler)
    return () => window.removeEventListener('favorites:changed', handler)
  }, [type, id])

  const handle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite({ type, id, name, image_path: imagePath })
  }

  if (!mounted) {
    return <div className={size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8'} />
  }

  const sizeClass = size === 'sm' ? 'w-6 h-6 text-sm' : size === 'lg' ? 'w-11 h-11 text-xl' : 'w-9 h-9 text-base'

  return (
    <button
      onClick={handle}
      aria-label={favorited ? 'Quitar de favoritos' : 'Añadir a favoritos'}
      title={favorited ? 'En favoritos' : 'Añadir a favoritos'}
      className={`${sizeClass} inline-flex items-center justify-center transition-colors border ${
        favorited
          ? 'bg-accent border-accent text-md-black'
          : variant === 'light'
          ? 'bg-paper border-border text-ink3 hover:text-accent hover:border-accent'
          : 'bg-md-grey border-md-border text-white/60 hover:text-accent hover:border-accent'
      }`}
    >
      {favorited ? '★' : '☆'}
    </button>
  )
}
