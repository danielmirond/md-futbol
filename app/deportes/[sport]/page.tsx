import { notFound } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { getSport, SPORT_SLUGS } from '@/lib/sports/registry'
import { ScoreboardView } from './views/scoreboard-view'
import { TennisView } from './views/tennis-view'
import { RacingView } from './views/racing-view'
import { GolfView } from './views/golf-view'
import { MmaView } from './views/mma-view'

export const revalidate = 60

interface PageProps {
  params: { sport: string }
  searchParams: { d?: string }
}

export function generateStaticParams() {
  return SPORT_SLUGS.map((sport) => ({ sport }))
}

export function generateMetadata({ params }: PageProps) {
  const sport = getSport(params.sport)
  if (!sport) return { title: 'Deporte · MD Fútbol' }
  return {
    title: `${sport.name} · MD Fútbol`,
    description: sport.tagline,
  }
}

export default async function SportPage({ params, searchParams }: PageProps) {
  const sport = getSport(params.sport)
  if (!sport) return notFound()

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {sport.kind === 'scoreboard' && <ScoreboardView sport={sport} date={searchParams.d} />}
        {sport.kind === 'tennis' && <TennisView sport={sport} />}
        {sport.kind === 'racing' && <RacingView sport={sport} />}
        {sport.kind === 'golf' && <GolfView sport={sport} />}
        {sport.kind === 'mma' && <MmaView sport={sport} />}
      </main>
      <Footer />
    </>
  )
}
