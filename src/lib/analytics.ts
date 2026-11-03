import { z } from 'zod'
import { flatRows, runFunnelReport, runRealtimeReport, runReport } from './ga'
import {
  type DailyPoint,
  type DashboardInputs,
  type EventStats,
  type FeatureRow,
  type Filters,
  type FunnelStep,
  type HourPoint,
  type RealtimeData,
  FUNNEL_DEFINITION,
  TRACKED_EVENTS,
} from './analytics-types'

const DAY_MS = 86_400_000
const MAX_RANGE_DAYS = 366

// ---------- filters ----------

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

export const filtersSchema = z
  .object({
    from: dateString,
    to: dateString,
    hourFrom: z.coerce.number().int().min(0).max(23).default(0),
    hourTo: z.coerce.number().int().min(0).max(23).default(23),
    platform: z.enum(['all', 'Android', 'iOS']).default('all'),
  })
  .refine((f) => !Number.isNaN(Date.parse(f.from)) && !Number.isNaN(Date.parse(f.to)), 'Invalid date')
  .refine((f) => f.from <= f.to, 'The start date must be on or before the end date')
  .refine((f) => daysBetween(f.from, f.to) <= MAX_RANGE_DAYS, 'Choose a range of a year or less')

function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to) - Date.parse(from)) / DAY_MS) + 1
}

const isoDay = (ms: number) => new Date(ms).toISOString().slice(0, 10)

/** The equal-length period immediately before the selected one. */
export function previousRange(f: Pick<Filters, 'from' | 'to'>): { from: string; to: string } {
  const len = daysBetween(f.from, f.to)
  const prevTo = Date.parse(f.from) - DAY_MS
  return { from: isoDay(prevTo - (len - 1) * DAY_MS), to: isoDay(prevTo) }
}

/** GA's `hour` dimension values for the selected window, or null when it covers the whole day. */
export function hourList(hourFrom: number, hourTo: number): string[] | null {
  const hours: string[] = []
  for (let h = hourFrom; ; h = (h + 1) % 24) {
    hours.push(String(h).padStart(2, '0'))
    if (h === hourTo) break
  }
  return hours.length === 24 ? null : hours
}

// ---------- GA request building ----------

type Expr = Record<string, unknown>

const stringFilter = (field: string, value: string): Expr => ({
  filter: { fieldName: field, stringFilter: { matchType: 'EXACT', value } },
})
const inList = (field: string, values: string[]): Expr => ({
  filter: { fieldName: field, inListFilter: { values } },
})
const and = (...exprs: (Expr | null)[]): Expr | undefined => {
  const parts = exprs.filter((e): e is Expr => e !== null)
  if (parts.length === 0) return undefined
  return parts.length === 1 ? parts[0] : { andGroup: { expressions: parts } }
}

function scopeFilters(f: Filters, opts: { hours: boolean }) {
  const platform = f.platform === 'all' ? null : stringFilter('platform', f.platform)
  const hours = opts.hours ? hourList(f.hourFrom, f.hourTo) : null
  return { platform, hour: hours ? inList('hour', hours) : null }
}

const RENAMES: Record<string, string> = { AGENT_MODE: 'AgentMode' }

// ---------- loaders ----------

export async function loadDashboardInputs(f: Filters): Promise<DashboardInputs> {
  const range = [{ startDate: f.from, endDate: f.to }]
  const prev = previousRange(f)
  const s = scopeFilters(f, { hours: true })
  const sNoHour = scopeFilters(f, { hours: false })

  const [totalsR, dailyR, hourlyR, eventsR, openedR, closedR, funnelR] = await Promise.all([
    runReport({
      dateRanges: [...range, { startDate: prev.from, endDate: prev.to }],
      metrics: [{ name: 'activeUsers' }, { name: 'newUsers' }, { name: 'sessions' }],
      dimensionFilter: and(s.platform, s.hour),
    }),
    runReport({
      dateRanges: range,
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'activeUsers' }, { name: 'newUsers' }, { name: 'sessions' }],
      dimensionFilter: and(s.platform, s.hour),
      orderBys: [{ dimension: { dimensionName: 'date' } }],
      limit: 400,
    }),
    runReport({
      dateRanges: range,
      dimensions: [{ name: 'hour' }],
      metrics: [{ name: 'activeUsers' }, { name: 'eventCount' }],
      dimensionFilter: and(sNoHour.platform),
      limit: 24,
    }),
    runReport({
      dateRanges: range,
      dimensions: [{ name: 'eventName' }],
      metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
      dimensionFilter: and(s.platform, s.hour, inList('eventName', [...TRACKED_EVENTS])),
      limit: 50,
    }),
    runReport({
      dateRanges: range,
      dimensions: [{ name: 'customEvent:feature_name' }, { name: 'platform' }],
      metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
      dimensionFilter: and(s.platform, s.hour, stringFilter('eventName', 'feature_opened')),
      limit: 500,
    }),
    runReport({
      dateRanges: range,
      dimensions: [{ name: 'customEvent:feature_name' }],
      metrics: [{ name: 'eventCount' }, { name: 'averageCustomEvent:duration_ms' }],
      dimensionFilter: and(s.platform, s.hour, stringFilter('eventName', 'feature_closed')),
      limit: 500,
    }),
    runFunnelReport({
      dateRanges: range,
      funnel: {
        steps: FUNNEL_DEFINITION.map((d) => ({
          name: d.step,
          filterExpression: { funnelEventFilter: { eventName: d.event } },
        })),
      },
      funnelBreakdown: { breakdownDimension: { name: 'platform' } },
    }),
  ])

  // totals: with two date ranges and no dimension GA adds a date_range_N dimension
  const totals = { activeUsers: 0, newUsers: 0, sessions: 0, prevActiveUsers: 0, prevNewUsers: 0, prevSessions: 0 }
  for (const r of flatRows(totalsR)) {
    const isPrev = r.dims[0] === 'date_range_1'
    const [a, n, se] = r.metrics
    if (isPrev) Object.assign(totals, { prevActiveUsers: a, prevNewUsers: n, prevSessions: se })
    else Object.assign(totals, { activeUsers: a, newUsers: n, sessions: se })
  }

  const daily: DailyPoint[] = flatRows(dailyR).map((r) => ({
    date: `${r.dims[0].slice(0, 4)}-${r.dims[0].slice(4, 6)}-${r.dims[0].slice(6, 8)}`,
    activeUsers: r.metrics[0],
    newUsers: r.metrics[1],
    sessions: r.metrics[2],
  }))

  const hourly: HourPoint[] = flatRows(hourlyR)
    .map((r) => ({ hour: Number(r.dims[0]), activeUsers: r.metrics[0], events: r.metrics[1] }))
    .sort((a, b) => a.hour - b.hour)

  const events: EventStats = {}
  for (const r of flatRows(eventsR)) events[r.dims[0]] = { count: r.metrics[0], users: r.metrics[1] }

  const byFeature = new Map<string, FeatureRow>()
  for (const r of flatRows(openedR)) {
    const raw = r.dims[0]
    if (!raw || raw === '(not set)') continue
    const name = RENAMES[raw] ?? raw
    const row =
      byFeature.get(name) ??
      { feature: name, opens: 0, users: 0, closes: 0, avgSec: null, androidOpens: 0, iosOpens: 0 }
    row.opens += r.metrics[0]
    row.users += r.metrics[1] // users on both platforms are counted once per platform
    if (r.dims[1] === 'Android') row.androidOpens += r.metrics[0]
    if (r.dims[1] === 'iOS') row.iosOpens += r.metrics[0]
    byFeature.set(name, row)
  }
  const weighted = new Map<string, { closes: number; ms: number }>()
  for (const r of flatRows(closedR)) {
    const raw = r.dims[0]
    if (!raw || raw === '(not set)') continue
    const name = RENAMES[raw] ?? raw
    const w = weighted.get(name) ?? { closes: 0, ms: 0 }
    w.closes += r.metrics[0]
    w.ms += r.metrics[0] * r.metrics[1]
    weighted.set(name, w)
  }
  for (const [name, w] of weighted) {
    const row = byFeature.get(name)
    if (row && w.closes > 0) {
      row.closes = w.closes
      row.avgSec = Math.round((w.ms / w.closes / 1000) * 10) / 10
    }
  }
  const features = [...byFeature.values()].sort((a, b) => b.users - a.users || b.opens - a.opens)

  // funnel rows: [stepName, platform | RESERVED_TOTAL] -> activeUsers
  const funnel: FunnelStep[] = FUNNEL_DEFINITION.map((d) => ({ step: d.step, all: 0, android: 0, ios: 0 }))
  for (const r of flatRows(funnelR.funnelTable)) {
    const idx = Number(r.dims[0].split('.')[0]) - 1
    const step = funnel[idx]
    if (!step) continue
    if (r.dims[1] === 'RESERVED_TOTAL') step.all = r.metrics[0]
    else if (r.dims[1] === 'Android') step.android = r.metrics[0]
    else if (r.dims[1] === 'iOS') step.ios = r.metrics[0]
  }

  return { filters: f, totals, daily, hourly, funnel, events, features }
}

export async function loadRealtime(): Promise<RealtimeData> {
  const report = await runRealtimeReport({
    dimensions: [{ name: 'platform' }],
    metrics: [{ name: 'activeUsers' }],
  })
  const out: RealtimeData = { total: 0, android: 0, ios: 0, at: new Date().toISOString() }
  for (const r of flatRows(report)) {
    out.total += r.metrics[0]
    if (r.dims[0] === 'Android') out.android += r.metrics[0]
    if (r.dims[0] === 'iOS') out.ios += r.metrics[0]
  }
  return out
}
