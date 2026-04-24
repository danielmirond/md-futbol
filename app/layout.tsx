import type { Metadata } from 'next'
import { oswald, inter, jetbrainsMono } from '@/lib/fonts'
import { OnboardingModal } from '@/components/onboarding-modal'
import { ThemeScript } from '@/components/theme-script'
import './globals.css'

export const metadata: Metadata = {
  title: 'MD Fútbol',
  description: 'Todas las competiciones. En directo. En serio.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        className={`${oswald.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      >
        {children}
        <OnboardingModal />
      </body>
    </html>
  )
}
