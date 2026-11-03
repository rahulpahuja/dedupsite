import { createSign } from 'node:crypto'

/**
 * Minimal Google Analytics Data API client for a service account.
 * Uses node:crypto to sign the OAuth JWT so no extra dependency is needed.
 * Credentials come only from the GA_SERVICE_ACCOUNT_JSON environment variable
 * (raw JSON or base64 of the JSON). Nothing here logs or returns the key.
 */

const SCOPE = 'https://www.googleapis.com/auth/analytics.readonly'
const DEFAULT_TOKEN_URI = 'https://oauth2.googleapis.com/token'

export class GaError extends Error {
  constructor(message: string, public status: number) {
    super(message)
    this.name = 'GaError'
  }
}

interface ServiceAccount {
  client_email: string
  private_key: string
  token_uri?: string
}

let cachedToken: { value: string; expiresAt: number } | null = null

export function gaPropertyId(): string {
  return (process.env.GA_PROPERTY_ID || '530281379').replace(/^properties\//, '')
}

export function gaConfigured(): boolean {
  return Boolean(process.env.GA_SERVICE_ACCOUNT_JSON)
}

function readServiceAccount(): ServiceAccount {
  const raw = process.env.GA_SERVICE_ACCOUNT_JSON
  if (!raw) throw new GaError('Google Analytics is not connected: GA_SERVICE_ACCOUNT_JSON is not set.', 503)
  let parsed: ServiceAccount
  try {
    const text = raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8')
    parsed = JSON.parse(text)
  } catch {
    throw new GaError('GA_SERVICE_ACCOUNT_JSON is not valid JSON.', 500)
  }
  if (!parsed.client_email || !parsed.private_key) {
    throw new GaError('GA_SERVICE_ACCOUNT_JSON is missing client_email or private_key.', 500)
  }
  return parsed
}

const b64url = (input: Buffer | string) =>
  Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

async function accessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  if (cachedToken && cachedToken.expiresAt - 60 > now) return cachedToken.value

  const sa = readServiceAccount()
  const tokenUri = sa.token_uri || DEFAULT_TOKEN_URI
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claims = b64url(
    JSON.stringify({ iss: sa.client_email, scope: SCOPE, aud: tokenUri, iat: now, exp: now + 3600 }),
  )
  const signer = createSign('RSA-SHA256')
  signer.update(`${header}.${claims}`)
  const signature = b64url(signer.sign(sa.private_key))

  const res = await fetch(tokenUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${header}.${claims}.${signature}`,
    }),
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new GaError('Google rejected the service account sign-in. Check the key and that the API is enabled.', 502)
  }
  const json = (await res.json()) as { access_token: string; expires_in: number }
  cachedToken = { value: json.access_token, expiresAt: now + json.expires_in }
  return json.access_token
}

async function call<T>(version: 'v1beta' | 'v1alpha', method: string, body: unknown): Promise<T> {
  const token = await accessToken()
  const res = await fetch(
    `https://analyticsdata.googleapis.com/${version}/properties/${gaPropertyId()}:${method}`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    },
  )
  if (!res.ok) {
    let detail = res.statusText
    try {
      detail = ((await res.json()) as { error?: { message?: string } }).error?.message ?? detail
    } catch {
      /* keep statusText */
    }
    const hint = res.status === 403 ? ' Add the service account as a Viewer on the property.' : ''
    throw new GaError(`Google Analytics: ${detail}${hint}`, res.status === 403 ? 403 : 502)
  }
  return (await res.json()) as T
}

export interface GaRow {
  dimensionValues?: { value: string }[]
  metricValues?: { value: string }[]
}
export interface GaReport {
  rows?: GaRow[]
}

export const runReport = (body: unknown) => call<GaReport>('v1beta', 'runReport', body)
export const runRealtimeReport = (body: unknown) => call<GaReport>('v1beta', 'runRealtimeReport', body)
export const runFunnelReport = (body: unknown) =>
  call<{ funnelTable?: GaReport }>('v1alpha', 'runFunnelReport', body)

/** Flatten a report into plain dimension strings and numeric metrics. */
export function flatRows(report: GaReport | undefined): { dims: string[]; metrics: number[] }[] {
  return (report?.rows ?? []).map((r) => ({
    dims: (r.dimensionValues ?? []).map((d) => d.value),
    metrics: (r.metricValues ?? []).map((m) => Number(m.value) || 0),
  }))
}
