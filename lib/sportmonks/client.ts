/**
 * SportMonks v3 Football API client.
 * https://docs.sportmonks.com/football/welcome
 */

const BASE_URL = 'https://api.sportmonks.com/v3/football'

function getToken(): string {
  const token = process.env.SPORTMONKS_API_TOKEN
  if (!token) throw new Error('SPORTMONKS_API_TOKEN not configured')
  return token
}

interface FetchOpts {
  include?: string
  filters?: string
  per_page?: number
  page?: number
  revalidate?: number
}

export async function smFetch<T = any>(
  path: string,
  opts: FetchOpts = {},
): Promise<T> {
  const params = new URLSearchParams({ api_token: getToken() })
  if (opts.include) params.set('include', opts.include)
  if (opts.filters) params.set('filters', opts.filters)
  if (opts.per_page) params.set('per_page', String(opts.per_page))
  if (opts.page) params.set('page', String(opts.page))

  const url = `${BASE_URL}${path}?${params.toString()}`

  const res = await fetch(url, {
    next: { revalidate: opts.revalidate ?? 60 },
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`SportMonks ${res.status}: ${text.slice(0, 200)}`)
  }

  return res.json()
}
