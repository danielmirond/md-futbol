'use client'

import { useState } from 'react'

interface Props {
  icsPath: string
  label?: string
}

export function CalendarSubscribe({ icsPath, label = 'Suscribir calendario' }: Props) {
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  const webcalUrl = typeof window !== 'undefined'
    ? `webcal://${window.location.host}${icsPath}`
    : icsPath
  const httpUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${icsPath}`
    : icsPath

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(httpUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="font-mono text-[10px] uppercase tracking-wider px-3 py-2 border border-white/30 text-white hover:bg-white/10 transition-colors inline-flex items-center gap-1.5"
      >
        📅 {label}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-20 w-[300px] bg-paper border border-border shadow-lg p-4 space-y-3 text-ink">
            <div className="eyebrow mb-2">SUSCRIBIR EN</div>
            <a
              href={webcalUrl}
              className="block font-display font-semibold uppercase text-xs tracking-wider bg-md text-white px-3 py-2 text-center hover:bg-md-dark"
            >
              Apple Calendar
            </a>
            <a
              href={`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(httpUrl)}`}
              target="_blank"
              rel="noopener"
              className="block font-display font-semibold uppercase text-xs tracking-wider bg-md-black text-white px-3 py-2 text-center hover:bg-md-grey"
            >
              Google Calendar
            </a>
            <a
              href={icsPath}
              download
              className="block font-display font-semibold uppercase text-xs tracking-wider border border-border px-3 py-2 text-center hover:border-md hover:text-md"
            >
              Descargar .ics
            </a>
            <button
              onClick={handleCopy}
              className="block w-full font-mono text-[10px] uppercase tracking-wider text-ink3 hover:text-ink border-t border-border pt-2"
            >
              {copied ? '✓ Copiado' : 'Copiar URL'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
