'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  intervalMs?: number
}

export function LiveRefresher({ intervalMs = 20000 }: Props) {
  const router = useRouter()

  useEffect(() => {
    const timer = setInterval(() => {
      router.refresh()
    }, intervalMs)
    return () => clearInterval(timer)
  }, [router, intervalMs])

  return null
}
