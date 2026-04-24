import Link from 'next/link'
import { SearchBar } from './search-bar'
import { LivescoreTicker } from './livescore-ticker'
import { ThemeToggle } from './theme-toggle'
import { SportsMenu } from './sports-menu'

export function Header() {
  return (
    <header className="sticky top-0 z-50">
      <div className="md-bar" />
      <div className="bg-md-black text-white">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4 justify-between">
          <Link href="/" className="flex items-baseline gap-2 shrink-0">
            <span className="font-display font-bold text-xl md:text-2xl uppercase tracking-tight">
              MD <span className="text-md">Fútbol</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 shrink-0">
            {[
              { href: '/', label: 'Inicio' },
              { href: '/ligas', label: 'Ligas' },
              { href: '/partidos', label: 'Partidos' },
              { href: '/en-directo', label: 'En directo' },
              { href: '/goleadores', label: 'Goleadores' },
              { href: '/favoritos', label: '★ Favoritos' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="font-display uppercase text-sm tracking-wider text-white/80 hover:text-md transition-colors whitespace-nowrap"
              >
                {label}
              </Link>
            ))}
            <SportsMenu />
          </nav>

          <div className="flex-1 flex justify-end items-center gap-2 min-w-0">
            <SearchBar />
            <ThemeToggle />
          </div>
        </div>
      </div>
      <LivescoreTicker />
    </header>
  )
}
