import Link from 'next/link'

export function Header() {
  return (
    <header className="sticky top-0 z-50">
      <div className="md-bar" />
      <div className="bg-md-black text-white">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="font-display font-bold text-2xl uppercase tracking-tight">
              MD <span className="text-md">Fútbol</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {[
              { href: '/', label: 'Inicio' },
              { href: '/ligas', label: 'Ligas' },
              { href: '/partidos', label: 'Partidos' },
              { href: '/en-directo', label: 'En directo' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="font-display uppercase text-sm tracking-wider text-white/80 hover:text-md transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <span className="eyebrow text-white/60">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
