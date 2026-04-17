'use client'

import { useEffect, useRef } from 'react'

interface Props {
  children: React.ReactNode
  delayMs?: number
  className?: string
}

/**
 * Fades/slides in its children on mount. Stagger multiple by passing
 * different delayMs. Lightweight — no external libs.
 */
export function StaggerIn({ children, delayMs = 0, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Start invisible, then fade in after delay
    const timer = setTimeout(() => {
      el.classList.remove('opacity-0', 'translate-y-3')
      el.classList.add('opacity-100', 'translate-y-0')
    }, delayMs)
    return () => clearTimeout(timer)
  }, [delayMs])

  return (
    <div
      ref={ref}
      className={`opacity-0 translate-y-3 transition-all duration-500 ease-out ${className}`}
    >
      {children}
    </div>
  )
}
