'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { SPORT_CATEGORIES, getSport } from '@/lib/sports/registry'
import { SportLogo } from './espn/sport-logo'

export function SportsMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function esc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('click', handler)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('click', handler)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="font-display uppercase text-sm tracking-wider text-white/80 hover:text-md transition-colors whitespace-nowrap inline-flex items-center gap-1"
      >
        Más deportes
        <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-[560px] max-w-[90vw] bg-paper border border-border shadow-xl z-50">
          <div className="md-bar" />
          <div className="p-4 grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
            {SPORT_CATEGORIES.map((cat) => (
              <div key={cat.label}>
                <div className="eyebrow mb-2">{cat.label}</div>
                <div className="space-y-1">
                  {cat.slugs.map((slug) => {
                    const s = getSport(slug)
                    if (!s) return null
                    return (
                      <Link
                        key={slug}
                        href={`/deportes/${slug}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-2 py-1.5 hover:bg-surface"
                      >
                        <SportLogo sport={s} size={20} emojiClass="text-base" className="shrink-0" />
                        <span className="font-display font-semibold uppercase text-xs truncate">{s.name}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-border px-4 py-3 bg-surface">
            <Link
              href="/deportes"
              onClick={() => setOpen(false)}
              className="font-display font-semibold uppercase text-xs tracking-wider text-md hover:underline"
            >
              Ver todos los deportes →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
