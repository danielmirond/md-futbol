import { SportLogo } from './sport-logo'
import type { SportConfig } from '@/lib/sports/registry'

interface Props {
  eyebrow: string
  sport: SportConfig
  subtitle?: string
  title?: string
}

export function SportHero({ eyebrow, sport, subtitle, title }: Props) {
  const heading = title ?? sport.name
  return (
    <section className="bg-md-black text-white p-6 md:p-10 relative overflow-hidden">
      <div className="md-bar -mx-6 md:-mx-10 -mt-6 md:-mt-10 mb-6" />
      <div className="flex items-start gap-4 md:gap-6">
        <div className="bg-white p-2 shrink-0 self-start">
          <SportLogo sport={sport} size={72} emojiClass="text-5xl" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="eyebrow text-md mb-2">{eyebrow}</div>
          <h1 className="font-display font-bold text-4xl md:text-6xl uppercase tracking-tight leading-[0.95]">
            {heading.split(' ').map((word, i) =>
              i === 0 ? word : (
                <span key={i}>
                  {' '}
                  <span className={i === 1 ? 'text-md' : ''}>{word}</span>
                </span>
              ),
            )}
          </h1>
          {subtitle && <p className="font-sans text-white/60 mt-3 max-w-2xl">{subtitle}</p>}
        </div>
      </div>
    </section>
  )
}
