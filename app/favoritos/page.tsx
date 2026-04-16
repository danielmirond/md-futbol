'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { getFavorites, removeFavorite, type Favorite } from '@/lib/favorites'

export default function FavoritosPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setFavorites(getFavorites())
    const handler = () => setFavorites(getFavorites())
    window.addEventListener('favorites:changed', handler)
    return () => window.removeEventListener('favorites:changed', handler)
  }, [])

  const teams = favorites.filter((f) => f.type === 'team')
  const leagues = favorites.filter((f) => f.type === 'league')
  const players = favorites.filter((f) => f.type === 'player')

  const Section = ({ title, items, hrefBase }: { title: string; items: Favorite[]; hrefBase: string }) => {
    if (items.length === 0) return null
    return (
      <section>
        <h2 className="md-heading mb-4">{title} · {items.length}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((f) => (
            <div key={`${f.type}-${f.id}`} className="md-card group relative">
              <Link href={`${hrefBase}/${f.id}`} className="flex items-center gap-3 min-w-0">
                {f.image_path ? (
                  <Image src={f.image_path} alt={f.name} width={40} height={40} className="shrink-0 bg-border" />
                ) : (
                  <div className="w-10 h-10 bg-border shrink-0" />
                )}
                <span className="font-display font-semibold uppercase text-sm truncate">{f.name}</span>
              </Link>
              <button
                onClick={(e) => { e.preventDefault(); removeFavorite(f.type, f.id) }}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-md-dark hover:text-md transition-opacity font-display font-bold text-xs uppercase"
                aria-label="Quitar"
                title="Quitar de favoritos"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <section className="bg-md-black text-white p-6 md:p-10 relative">
          <div className="md-bar -mx-6 md:-mx-10 -mt-6 md:-mt-10 mb-6" />
          <div className="eyebrow text-md mb-2">★ TUS FAVORITOS · SOLO EN ESTE DISPOSITIVO</div>
          <h1 className="font-display font-bold text-4xl md:text-6xl uppercase tracking-tight">
            Favoritos
          </h1>
        </section>

        {!mounted ? (
          <div className="md-card text-center py-16 eyebrow">Cargando…</div>
        ) : favorites.length === 0 ? (
          <div className="md-card text-center py-16">
            <div className="eyebrow mb-2">SIN FAVORITOS</div>
            <p className="font-sans text-ink2 max-w-md mx-auto mb-4">
              Marca equipos, jugadores o ligas con la estrella ★ para acceder rápido.
            </p>
            <Link href="/" className="btn-md inline-block">EXPLORAR</Link>
          </div>
        ) : (
          <>
            <Section title="Equipos" items={teams} hrefBase="/equipos" />
            <Section title="Ligas" items={leagues} hrefBase="/ligas" />
            <Section title="Jugadores" items={players} hrefBase="/jugadores" />
          </>
        )}
      </main>
      <Footer />
    </>
  )
}
