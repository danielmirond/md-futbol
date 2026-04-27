/**
 * Mundo Deportivo wordmark.
 *
 * Replicates the official identity (red side bars, MUNDO yellow + DEPORTIVO white,
 * black slab background, condensed italic typography) using HTML + CSS so it stays
 * crisp at any size, themable via vars and free of external image dependencies.
 *
 * Variants:
 *  - full:    MUNDO·DEPORTIVO horizontal wordmark with red bars on both sides.
 *  - compact: MD monogram with red bars (used in cramped layouts/favicon).
 *
 * The component renders inline — pass `className` to control width via the parent.
 */

interface Props {
  variant?: 'full' | 'compact'
  /** Tailwind text size classes that drive the wordmark height (e.g. "text-xl md:text-2xl"). */
  sizeClass?: string
  className?: string
}

export function MdLogo({ variant = 'full', sizeClass = 'text-xl md:text-2xl', className = '' }: Props) {
  if (variant === 'compact') {
    return (
      <span
        aria-label="Mundo Deportivo"
        className={`inline-flex items-stretch bg-md-black ${sizeClass} ${className}`}
        style={{ transform: 'skewX(-8deg)' }}
      >
        <span className="block w-[6%] min-w-[3px] bg-md" />
        <span
          className="font-display font-black italic px-1.5 text-accent leading-none flex items-center"
          style={{ transform: 'skewX(8deg)' }}
        >
          MD
        </span>
        <span className="block w-[6%] min-w-[3px] bg-md" />
      </span>
    )
  }

  return (
    <span
      aria-label="Mundo Deportivo"
      className={`inline-flex items-stretch bg-md-black ${sizeClass} ${className}`}
      style={{ transform: 'skewX(-8deg)' }}
    >
      {/* Left red bar */}
      <span className="block w-[3%] min-w-[3px] bg-md" />
      {/* Wordmark — counter-skewed so the letters stand upright while the box stays slanted */}
      <span
        className="flex items-center px-2 leading-none font-display font-black italic tracking-tight"
        style={{ transform: 'skewX(8deg)' }}
      >
        <span className="text-accent">MUNDO</span>
        <span className="text-white">DEPORTIVO</span>
      </span>
      {/* Right red bar */}
      <span className="block w-[3%] min-w-[3px] bg-md" />
    </span>
  )
}
