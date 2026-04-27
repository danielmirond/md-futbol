import Image from 'next/image'
import type { SportConfig } from '@/lib/sports/registry'

interface Props {
  sport: SportConfig
  size?: number
  className?: string
  /** Render emoji at this size (rem-ish, used for matching height visually). */
  emojiClass?: string
}

/**
 * Renders the sport's downloaded logo if available, falling back to the
 * registry's emoji icon when no logo file exists.
 */
export function SportLogo({ sport, size = 40, className = '', emojiClass = 'text-3xl' }: Props) {
  if (sport.logo) {
    return (
      <Image
        src={sport.logo}
        alt={sport.name}
        width={size}
        height={size}
        className={`object-contain ${className}`}
      />
    )
  }
  return (
    <span
      role="img"
      aria-label={sport.name}
      className={`inline-flex items-center justify-center ${emojiClass} ${className}`}
      style={{ width: size, height: size }}
    >
      {sport.icon}
    </span>
  )
}
