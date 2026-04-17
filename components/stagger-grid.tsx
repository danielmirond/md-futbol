'use client'

import { useEffect, useRef } from 'react'

interface Props {
  children: React.ReactNode
  stepMs?: number        // delay between items
  startDelayMs?: number  // initial delay before first item
  className?: string
}

/**
 * Wraps a grid/list and staggers the entrance of its direct children.
 * Each child fades + slides in with incremental delay.
 */
export function StaggerGrid({ children, stepMs = 60, startDelayMs = 0, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return

    const items = Array.from(container.children) as HTMLElement[]
    items.forEach((item, idx) => {
      item.style.opacity = '0'
      item.style.transform = 'translateY(12px)'
      item.style.transition = 'opacity 500ms ease-out, transform 500ms ease-out'
    })

    const timers: number[] = []
    items.forEach((item, idx) => {
      const t = window.setTimeout(() => {
        item.style.opacity = '1'
        item.style.transform = 'translateY(0)'
      }, startDelayMs + idx * stepMs)
      timers.push(t)
    })

    return () => {
      timers.forEach((t) => clearTimeout(t))
    }
  }, [stepMs, startDelayMs])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
