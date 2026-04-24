import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { FavoriteButton } from '@/components/favorite-button'
import { getPlayer, statValue, PLAYER_STAT_KEYS } from '@/lib/sportmonks/players'

export const revalidate = 3600

interface PageProps { params: { playerId: string } }

function calculateAge(dob: string | null): number | null {
  if (!dob) return null
  const birth = new Date(dob)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
  return age
}

export default async function PlayerPage({ params: { playerId } }: PageProps) {
  const id = parseInt(playerId, 10)
  const player = !isNaN(id) ? await getPlayer(id) : null

  if (!player) {
    return (
      <>
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="eyebrow mb-2">404</p>
          <h1 className="font-display text-3xl uppercase mb-4">Jugador no encontrado</h1>
          <Link href="/" className="btn-ghost inline-block">← Volver al inicio</Link>
        </main>
        <Footer />
      </>
    )
  }

  const age = calculateAge(player.date_of_birth)
  const currentTeam = player.teams?.[0]?.team

  // Pick the most relevant stat block: prefer current season, else most recent with values
  const stats = (player.statistics || []).filter((s) => s.has_values)
  const primaryStat =
    stats.find((s) => s.season?.is_current) ||
    [...stats].sort((a, b) => b.season_id - a.season_id)[0] ||
    null

  const posDev = player.position?.developer_name || ''
  const isGoalkeeper = posDev.toUpperCase().includes('GOALKEEPER') || posDev === 'GK'

  const statRows: Array<{ key: string; label: string }> = isGoalkeeper
    ? [
        { key: PLAYER_STAT_KEYS.APPEARANCES, label: 'Partidos' },
        { key: PLAYER_STAT_KEYS.MINUTES_PLAYED, label: 'Minutos' },
        { key: PLAYER_STAT_KEYS.CLEANSHEETS, label: 'Porterías a 0' },
        { key: PLAYER_STAT_KEYS.SAVES, label: 'Paradas' },
        { key: PLAYER_STAT_KEYS.YELLOWCARDS, label: 'Amarillas' },
        { key: PLAYER_STAT_KEYS.REDCARDS, label: 'Rojas' },
      ]
    : [
        { key: PLAYER_STAT_KEYS.GOALS, label: 'Goles' },
        { key: PLAYER_STAT_KEYS.ASSISTS, label: 'Asistencias' },
        { key: PLAYER_STAT_KEYS.APPEARANCES, label: 'Partidos' },
        { key: PLAYER_STAT_KEYS.MINUTES_PLAYED, label: 'Minutos' },
        { key: PLAYER_STAT_KEYS.SHOTS_ON_TARGET, label: 'Tiros a puerta' },
        { key: PLAYER_STAT_KEYS.KEY_PASSES, label: 'Pases clave' },
        { key: PLAYER_STAT_KEYS.TACKLES, label: 'Entradas' },
        { key: PLAYER_STAT_KEYS.YELLOWCARDS, label: 'Amarillas' },
        { key: PLAYER_STAT_KEYS.REDCARDS, label: 'Rojas' },
      ]

  const renderedStats = primaryStat
    ? statRows
        .map((r) => ({ ...r, value: statValue(primaryStat, r.key) }))
        .filter((r) => r.value !== null && r.value !== 0)
    : []

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Hero */}
        <section className="bg-md-black text-white relative">
          <div className="md-bar" />
          <div className="p-6 md:p-10 grid grid-cols-[auto_1fr] gap-6 items-center">
            <div className="bg-white p-2">
              {player.image_path ? (
                <Image
                  src={player.image_path}
                  alt={player.display_name}
                  width={140}
                  height={140}
                />
              ) : (
                <div className="w-[140px] h-[140px] bg-border" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="eyebrow text-md">
                  {player.position?.name?.toUpperCase() || 'JUGADOR'}
                </div>
                <FavoriteButton type="player" id={player.id} name={player.display_name} imagePath={player.image_path} size="lg" />
              </div>
              <h1 className="font-display font-bold text-3xl md:text-5xl uppercase tracking-tight leading-tight">
                {player.display_name}
              </h1>
              <p className="font-sans text-white/60 mt-2 text-sm">{player.name}</p>
              {currentTeam && (
                <Link
                  href={`/equipos/${currentTeam.id}`}
                  className="inline-flex items-center gap-2 mt-4 bg-md-grey-light px-3 py-1.5 hover:bg-md transition-colors"
                >
                  {currentTeam.image_path && (
                    <Image
                      src={currentTeam.image_path}
                      alt={currentTeam.name}
                      width={20}
                      height={20}
                    />
                  )}
                  <span className="font-display uppercase text-xs tracking-wider">
                    {currentTeam.name}
                  </span>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Bio stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {age !== null && (
            <div className="md-card">
              <div className="eyebrow mb-1">Edad</div>
              <div className="font-display font-bold text-3xl">{age}</div>
            </div>
          )}
          {player.height && (
            <div className="md-card">
              <div className="eyebrow mb-1">Altura</div>
              <div className="font-display font-bold text-3xl">{player.height} <span className="text-sm text-ink3">cm</span></div>
            </div>
          )}
          {player.weight && (
            <div className="md-card">
              <div className="eyebrow mb-1">Peso</div>
              <div className="font-display font-bold text-3xl">{player.weight} <span className="text-sm text-ink3">kg</span></div>
            </div>
          )}
          {player.country && (
            <div className="md-card">
              <div className="eyebrow mb-1">Nacionalidad</div>
              <div className="flex items-center gap-2">
                {player.country.image_path && (
                  <Image
                    src={player.country.image_path}
                    alt={player.country.name}
                    width={24}
                    height={16}
                  />
                )}
                <span className="font-display font-semibold uppercase text-sm">{player.country.name}</span>
              </div>
            </div>
          )}
        </section>

        {/* Season statistics */}
        {renderedStats.length > 0 && (
          <section>
            <div className="flex items-baseline justify-between gap-2 mb-4 flex-wrap">
              <h2 className="md-heading">Estadísticas de temporada</h2>
              {primaryStat?.season?.name && (
                <span className="eyebrow">
                  {primaryStat.season.name}
                  {primaryStat.season.is_current ? ' · EN CURSO' : ''}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {renderedStats.map((s) => (
                <div key={s.key} className="md-card">
                  <div className="eyebrow mb-1">{s.label}</div>
                  <div className="font-display font-bold text-3xl tabular-nums">{s.value}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Teams history */}
        {player.teams && player.teams.length > 0 && (
          <section>
            <h2 className="md-heading mb-4">Trayectoria</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {player.teams.map((t) => (
                t.team && (
                  <Link
                    key={t.team_id}
                    href={`/equipos/${t.team_id}`}
                    className="md-card flex items-center gap-3 hover:border-md transition-colors"
                  >
                    {t.team.image_path && (
                      <Image src={t.team.image_path} alt={t.team.name} width={32} height={32} className="shrink-0" />
                    )}
                    <span className="font-display font-semibold uppercase text-xs truncate">
                      {t.team.name}
                    </span>
                  </Link>
                )
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}
