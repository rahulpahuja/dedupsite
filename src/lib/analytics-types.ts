/** Shared shapes for the /analytics dashboard. Safe to import from client code. */

export type PlatformFilter = 'all' | 'Android' | 'iOS'

export interface Filters {
  /** Inclusive start date, YYYY-MM-DD. */
  from: string
  /** Inclusive end date, YYYY-MM-DD. */
  to: string
  /** Hour-of-day window, 0-23, in the property's time zone. A start after the end wraps past midnight. */
  hourFrom: number
  hourTo: number
  platform: PlatformFilter
}

export interface Totals {
  activeUsers: number
  newUsers: number
  sessions: number
  prevActiveUsers: number
  prevNewUsers: number
  prevSessions: number
}

export interface DailyPoint {
  date: string
  activeUsers: number
  newUsers: number
  sessions: number
}

export interface HourPoint {
  hour: number
  activeUsers: number
  events: number
}

export interface FunnelStep {
  step: string
  all: number
  android: number
  ios: number
}

export interface FeatureRow {
  feature: string
  opens: number
  users: number
  closes: number
  avgSec: number | null
  androidOpens: number
  iosOpens: number
}

export type EventStats = Record<string, { count: number; users: number }>

export interface Insight {
  id: string
  severity: 'high' | 'medium' | 'low'
  title: string
  evidence: string
  action: string
}

export interface DashboardInputs {
  filters: Filters
  totals: Totals
  daily: DailyPoint[]
  hourly: HourPoint[]
  funnel: FunnelStep[]
  events: EventStats
  features: FeatureRow[]
}

export interface DashboardData extends DashboardInputs {
  generatedAt: string
  insights: Insight[]
}

export interface RealtimeData {
  total: number
  android: number
  ios: number
  at: string
}

/** The journey, in order, with the GA event that marks each step. */
export const FUNNEL_DEFINITION = [
  { step: 'First open', event: 'first_open' },
  { step: 'Login', event: 'login_success' },
  { step: 'Scan started', event: 'scan_started' },
  { step: 'Scan completed', event: 'scan_completed' },
  { step: 'Cleanup completed', event: 'cleanup_completed' },
] as const

/** Events the dashboard reads totals for. */
export const TRACKED_EVENTS = [
  'feature_opened',
  'scan_started',
  'scan_completed',
  'scan_cancelled',
  'scan_failed',
  'cleanup_completed',
  'cleanup_failed',
  'cleanup_cancelled',
] as const

/** Reach cut-offs used for the Core / Occasional / Rare tiers. */
export const CORE_REACH = 0.2
export const OCCASIONAL_REACH = 0.05

/** GA reports in the property's time zone, which is UTC for dedup-7dd7b. */
export const PROPERTY_TIME_ZONE = 'UTC'

export function tierOf(reach: number): 'Core' | 'Occasional' | 'Rare' {
  return reach >= CORE_REACH ? 'Core' : reach >= OCCASIONAL_REACH ? 'Occasional' : 'Rare'
}
