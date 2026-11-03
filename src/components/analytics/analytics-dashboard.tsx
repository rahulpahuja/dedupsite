'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BrandLogo } from '@/components/brand/brand-logo'
import { cn } from '@/lib/utils'
import {
  type DashboardData,
  type Filters,
  type PlatformFilter,
  type RealtimeData,
  PROPERTY_TIME_ZONE,
} from '@/lib/analytics-types'
import {
  Card,
  DailyChart,
  FeaturePanels,
  FunnelPanel,
  HourlyChart,
  InsightsPanel,
  PlatformTable,
  ScanOutcomes,
  StatTile,
} from './analytics-panels'

const DAY_MS = 86_400_000
const utcToday = () => new Date().toISOString().slice(0, 10)
const addDays = (iso: string, n: number) => new Date(Date.parse(iso) + n * DAY_MS).toISOString().slice(0, 10)
const hh = (h: number) => String(h).padStart(2, '0')

const PRESETS = [
  { id: '7', label: 'Last 7 days', days: 7 },
  { id: '28', label: 'Last 28 days', days: 28 },
  { id: '90', label: 'Last 90 days', days: 90 },
] as const

const field =
  'rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white outline-none transition focus:border-sky/40 [color-scheme:dark]'

function presetFilters(days: number): Pick<Filters, 'from' | 'to'> {
  const to = utcToday()
  return { from: addDays(to, -(days - 1)), to }
}

export function AnalyticsDashboard({ today }: { today: string }) {
  const router = useRouter()
  const [filters, setFilters] = useState<Filters>(() => ({ from: addDays(today, -27), to: today, hourFrom: 0, hourTo: 23, platform: 'all' }))
  const [tick, setTick] = useState(0)
  const [result, setResult] = useState<{ key: string | null; data: DashboardData | null; error: string | null }>({ key: null, data: null, error: null })
  const [auto, setAuto] = useState(true)
  const [live, setLive] = useState<RealtimeData | null>(null)

  const rangeError = filters.from > filters.to ? 'The start date must be on or before the end date.' : null
  // Changing a filter, or pressing Refresh, changes the key; loading lasts until a response arrives for that key.
  const requestKey = rangeError ? null : `${JSON.stringify(filters)}#${tick}`
  const loading = requestKey !== null && result.key !== requestKey
  const { data, error } = result

  const fetchInto = useCallback(
    async (f: Filters, key: string, signal: AbortSignal) => {
      try {
        const qs = new URLSearchParams({
          from: f.from,
          to: f.to,
          hourFrom: String(f.hourFrom),
          hourTo: String(f.hourTo),
          platform: f.platform,
        })
        const res = await fetch(`/api/analytics?${qs}`, { cache: 'no-store', signal })
        if (res.status === 401) {
          router.push('/admin/login?next=/analytics')
          return
        }
        const body = await res.json()
        if (!res.ok) throw new Error(body.error ?? 'Could not load analytics.')
        setResult({ key, data: body as DashboardData, error: null })
      } catch (e) {
        if ((e as Error).name === 'AbortError') return
        setResult((prev) => ({ key, data: prev.data, error: (e as Error).message || 'Could not load analytics.' }))
      }
    },
    [router],
  )

  // Load on first render, on every filter change and on Refresh.
  useEffect(() => {
    if (!requestKey) return
    const ctrl = new AbortController()
    void fetchInto(filters, requestKey, ctrl.signal)
    return () => ctrl.abort()
  }, [requestKey, filters, fetchInto])

  // Refresh quietly every minute while the range includes today.
  useEffect(() => {
    if (!auto || !requestKey || filters.to < utcToday()) return
    const ctrl = new AbortController()
    const t = setInterval(() => void fetchInto(filters, requestKey, ctrl.signal), 60_000)
    return () => {
      clearInterval(t)
      ctrl.abort()
    }
  }, [auto, requestKey, filters, fetchInto])

  // Users active in the last 30 minutes.
  useEffect(() => {
    let stop = false
    const poll = async () => {
      try {
        const res = await fetch('/api/analytics/realtime', { cache: 'no-store' })
        if (!res.ok) throw new Error('unavailable')
        const body = (await res.json()) as RealtimeData
        if (!stop) setLive(body)
      } catch {
        if (!stop) setLive(null)
      }
    }
    void poll()
    const t = setInterval(poll, 30_000)
    return () => {
      stop = true
      clearInterval(t)
    }
  }, [])

  async function logout() {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  const update = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }))
  const activePreset = PRESETS.find((p) => { const r = presetFilters(p.days); return r.from === filters.from && r.to === filters.to })
  const platform: PlatformFilter = filters.platform
  const base = data?.events.feature_opened?.users ?? 0

  return (
    <main className="min-h-screen bg-[#060D1F] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link href="/" className="inline-flex items-center">
              <BrandLogo />
              <span className="ml-2 font-display text-sm font-normal text-white/40">Analytics</span>
            </Link>
            <h1 className="mt-4 font-display text-2xl font-semibold sm:text-3xl">Feature usage and user journeys</h1>
            <p className="mt-1 text-xs text-white/45">
              Google Analytics, Android and iOS. Times are {PROPERTY_TIME_ZONE}.{' '}
              {data && <>Updated {new Date(data.generatedAt).toLocaleTimeString()}.</>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setTick((n) => n + 1)} disabled={loading || !!rangeError} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/80 transition hover:bg-white/[0.06] disabled:opacity-40">
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
            <button type="button" onClick={logout} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/80 transition hover:bg-white/[0.06]">
              Sign out
            </button>
          </div>
        </header>

        {/* Filters */}
        <section aria-label="Filters" className="flex flex-wrap items-end gap-x-4 gap-y-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Date presets">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => update(presetFilters(p.days))}
                aria-pressed={activePreset?.id === p.id}
                className={cn('rounded-lg border px-3 py-2 text-xs transition', activePreset?.id === p.id ? 'border-sky/50 bg-sky/10 text-white' : 'border-white/10 text-white/65 hover:bg-white/[0.06]')}
              >
                {p.label}
              </button>
            ))}
          </div>
          <label className="text-xs text-white/55">
            <span className="mb-1 block">From</span>
            <input type="date" value={filters.from} max={utcToday()} onChange={(e) => e.target.value && update({ from: e.target.value })} className={field} />
          </label>
          <label className="text-xs text-white/55">
            <span className="mb-1 block">To</span>
            <input type="date" value={filters.to} max={utcToday()} onChange={(e) => e.target.value && update({ to: e.target.value })} className={field} />
          </label>
          <label className="text-xs text-white/55">
            <span className="mb-1 block">From hour</span>
            <select value={filters.hourFrom} onChange={(e) => update({ hourFrom: Number(e.target.value) })} className={field}>
              {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{hh(h)}:00</option>)}
            </select>
          </label>
          <label className="text-xs text-white/55">
            <span className="mb-1 block">To hour</span>
            <select value={filters.hourTo} onChange={(e) => update({ hourTo: Number(e.target.value) })} className={field}>
              {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{hh(h)}:59</option>)}
            </select>
          </label>
          <label className="text-xs text-white/55">
            <span className="mb-1 block">Platform</span>
            <select value={platform} onChange={(e) => update({ platform: e.target.value as PlatformFilter })} className={field}>
              <option value="all">All platforms</option>
              <option value="Android">Android</option>
              <option value="iOS">iOS</option>
            </select>
          </label>
          <label className="flex items-center gap-2 pb-2 text-xs text-white/65">
            <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} className="accent-[#5FA3FF]" />
            Refresh every minute
          </label>
          {rangeError && <p role="alert" className="basis-full text-xs text-remove">{rangeError}</p>}
        </section>

        {error && (
          <div role="alert" className="rounded-xl border border-remove/30 bg-remove/10 p-4 text-sm text-white">
            <p className="font-medium">Could not load analytics</p>
            <p className="mt-1 text-white/70">{error}</p>
          </div>
        )}

        {!data && loading && <p className="text-sm text-white/55">Loading from Google Analytics…</p>}

        {data && (
          <div className={cn('space-y-6 transition-opacity', loading && 'opacity-60')}>
            <section className="grid grid-cols-2 gap-3 lg:grid-cols-5" aria-label="Headline figures">
              <StatTile label="Active users" value={data.totals.activeUsers} previous={data.totals.prevActiveUsers} />
              <StatTile label="New users" value={data.totals.newUsers} previous={data.totals.prevNewUsers} />
              <StatTile label="Sessions" value={data.totals.sessions} previous={data.totals.prevSessions} />
              <StatTile
                label="Finished a cleanup"
                value={data.funnel[4] ? (platform === 'Android' ? data.funnel[4].android : platform === 'iOS' ? data.funnel[4].ios : data.funnel[4].all) : 0}
                note="Users, from the funnel"
              />
              <StatTile
                label="Active now"
                value={live ? live.total : '—'}
                note={live ? `${live.android} Android · ${live.ios} iOS, last 30 min` : 'Live count unavailable'}
              />
            </section>

            <section aria-labelledby="next">
              <h2 id="next" className="mb-3 font-display text-lg font-semibold">What to do next</h2>
              <InsightsPanel insights={data.insights} />
            </section>

            <section aria-labelledby="journey" className="space-y-4">
              <h2 id="journey" className="font-display text-lg font-semibold">User journey</h2>
              <div className="grid gap-4 lg:grid-cols-2">
                <Card title="Where people drop off" note="Distinct users who reached each step in order. Uses the date range only; the hour window does not apply. The biggest loss is in red.">
                  <FunnelPanel steps={data.funnel} platform={platform} />
                </Card>
                <Card title="Android compared with iOS" note="Share of each platform's first-time openers who reached the step.">
                  <PlatformTable steps={data.funnel} />
                </Card>
                <Card title="How scans end" note="Scan events, not people.">
                  <ScanOutcomes events={data.events} />
                </Card>
                <Card title="Users by day" note="Active users, with new users among them.">
                  <DailyChart daily={data.daily} />
                </Card>
              </div>
              <Card title="When people use the app" note={`Events by hour of day (${PROPERTY_TIME_ZONE}), across the date range. Highlighted bars are inside your hour window.`}>
                <HourlyChart hourly={data.hourly} hourFrom={data.filters.hourFrom} hourTo={data.filters.hourTo} />
              </Card>
            </section>

            <section aria-labelledby="features" className="space-y-4">
              <h2 id="features" className="font-display text-lg font-semibold">Most and least used features</h2>
              <FeaturePanels features={data.features} base={base} />
            </section>

            <p className="text-xs leading-relaxed text-white/35">
              Feature counts only include opens that carry a feature name, so use them to rank features rather than as totals. Rates on small samples are directional.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
