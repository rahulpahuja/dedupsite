import type { DashboardInputs, Filters, RealtimeData } from './analytics-types'

/**
 * Development-only fixtures for the /analytics page, so it can be built and
 * checked without Google credentials. Shape and magnitudes come from a real
 * 90-day snapshot of the DeDup property; daily values are synthetic.
 * The API route only uses this when ANALYTICS_MOCK=1 and NODE_ENV is not production.
 */

const FEATURES: DashboardInputs['features'] = [
  {
    "feature": "Login",
    "opens": 312,
    "users": 108,
    "closes": 288,
    "avgSec": 7.0,
    "androidOpens": 177,
    "iosOpens": 135
  },
  {
    "feature": "Dashboard",
    "opens": 1128,
    "users": 103,
    "closes": 981,
    "avgSec": 43.3,
    "androidOpens": 874,
    "iosOpens": 254
  },
  {
    "feature": "ImageScanner",
    "opens": 249,
    "users": 63,
    "closes": 212,
    "avgSec": 94.5,
    "androidOpens": 150,
    "iosOpens": 99
  },
  {
    "feature": "Optimize",
    "opens": 292,
    "users": 56,
    "closes": 282,
    "avgSec": 18.6,
    "androidOpens": 234,
    "iosOpens": 58
  },
  {
    "feature": "VideoScanner",
    "opens": 317,
    "users": 55,
    "closes": 254,
    "avgSec": 281.0,
    "androidOpens": 275,
    "iosOpens": 42
  },
  {
    "feature": "FileCleanup",
    "opens": 273,
    "users": 51,
    "closes": 258,
    "avgSec": 22.2,
    "androidOpens": 273,
    "iosOpens": 0
  },
  {
    "feature": "StorageInsights",
    "opens": 205,
    "users": 36,
    "closes": 201,
    "avgSec": 23.8,
    "androidOpens": 205,
    "iosOpens": 0
  },
  {
    "feature": "Settings",
    "opens": 99,
    "users": 31,
    "closes": 88,
    "avgSec": 140.2,
    "androidOpens": 52,
    "iosOpens": 47
  },
  {
    "feature": "Trash",
    "opens": 48,
    "users": 27,
    "closes": 42,
    "avgSec": 31.2,
    "androidOpens": 39,
    "iosOpens": 9
  },
  {
    "feature": "FileBrowser",
    "opens": 119,
    "users": 26,
    "closes": 110,
    "avgSec": 13.8,
    "androidOpens": 119,
    "iosOpens": 0
  },
  {
    "feature": "ScanHistory",
    "opens": 54,
    "users": 25,
    "closes": 54,
    "avgSec": 10.9,
    "androidOpens": 38,
    "iosOpens": 16
  },
  {
    "feature": "TalkToMyStorage",
    "opens": 32,
    "users": 18,
    "closes": 27,
    "avgSec": 65.5,
    "androidOpens": 0,
    "iosOpens": 32
  },
  {
    "feature": "FileScanner_APK",
    "opens": 25,
    "users": 17,
    "closes": 23,
    "avgSec": 6.8,
    "androidOpens": 25,
    "iosOpens": 0
  },
  {
    "feature": "VoiceStorage",
    "opens": 33,
    "users": 16,
    "closes": 32,
    "avgSec": 135.7,
    "androidOpens": 33,
    "iosOpens": 0
  },
  {
    "feature": "FileScanner_PDF",
    "opens": 21,
    "users": 15,
    "closes": 21,
    "avgSec": 8.8,
    "androidOpens": 21,
    "iosOpens": 0
  },
  {
    "feature": "CacheCleaner",
    "opens": 17,
    "users": 15,
    "closes": 17,
    "avgSec": 6.8,
    "androidOpens": 17,
    "iosOpens": 0
  },
  {
    "feature": "DeepOptimization",
    "opens": 77,
    "users": 14,
    "closes": 76,
    "avgSec": 9.3,
    "androidOpens": 77,
    "iosOpens": 0
  },
  {
    "feature": "AgentMode",
    "opens": 70,
    "users": 14,
    "closes": 46,
    "avgSec": 250.5,
    "androidOpens": 68,
    "iosOpens": 2
  },
  {
    "feature": "SmartJunkCleanup",
    "opens": 37,
    "users": 14,
    "closes": 31,
    "avgSec": 886.0,
    "androidOpens": 37,
    "iosOpens": 0
  },
  {
    "feature": "ContactDedup",
    "opens": 22,
    "users": 14,
    "closes": 22,
    "avgSec": 11.5,
    "androidOpens": 12,
    "iosOpens": 10
  },
  {
    "feature": "LargeVideos",
    "opens": 31,
    "users": 13,
    "closes": 27,
    "avgSec": 40.6,
    "androidOpens": 0,
    "iosOpens": 31
  },
  {
    "feature": "Screenshots",
    "opens": 23,
    "users": 13,
    "closes": 20,
    "avgSec": 27.8,
    "androidOpens": 0,
    "iosOpens": 23
  },
  {
    "feature": "FilesPhotos",
    "opens": 34,
    "users": 12,
    "closes": 31,
    "avgSec": 5.3,
    "androidOpens": 0,
    "iosOpens": 34
  },
  {
    "feature": "BigFileMap",
    "opens": 33,
    "users": 12,
    "closes": 32,
    "avgSec": 8.4,
    "androidOpens": 33,
    "iosOpens": 0
  },
  {
    "feature": "Memories",
    "opens": 17,
    "users": 12,
    "closes": 17,
    "avgSec": 3.5,
    "androidOpens": 17,
    "iosOpens": 0
  },
  {
    "feature": "WhatsAppCleaner",
    "opens": 17,
    "users": 9,
    "closes": 16,
    "avgSec": 6.5,
    "androidOpens": 17,
    "iosOpens": 0
  },
  {
    "feature": "EmptyFolderRemover",
    "opens": 14,
    "users": 9,
    "closes": 14,
    "avgSec": 18.0,
    "androidOpens": 14,
    "iosOpens": 0
  },
  {
    "feature": "SocialMediaCleaner",
    "opens": 18,
    "users": 8,
    "closes": 18,
    "avgSec": 5.0,
    "androidOpens": 18,
    "iosOpens": 0
  },
  {
    "feature": "SemanticScanner",
    "opens": 10,
    "users": 8,
    "closes": 10,
    "avgSec": 5.0,
    "androidOpens": 10,
    "iosOpens": 0
  },
  {
    "feature": "ActivityLog",
    "opens": 25,
    "users": 7,
    "closes": 24,
    "avgSec": 3.3,
    "androidOpens": 25,
    "iosOpens": 0
  },
  {
    "feature": "FilesVideos",
    "opens": 6,
    "users": 5,
    "closes": 6,
    "avgSec": 3.6,
    "androidOpens": 0,
    "iosOpens": 6
  },
  {
    "feature": "About",
    "opens": 5,
    "users": 4,
    "closes": 5,
    "avgSec": 91.2,
    "androidOpens": 5,
    "iosOpens": 0
  },
  {
    "feature": "ImageCompression",
    "opens": 4,
    "users": 4,
    "closes": 4,
    "avgSec": 19.6,
    "androidOpens": 4,
    "iosOpens": 0
  },
  {
    "feature": "BlurryPhotos",
    "opens": 4,
    "users": 3,
    "closes": 4,
    "avgSec": 9.6,
    "androidOpens": 0,
    "iosOpens": 4
  },
  {
    "feature": "DeepStorageTips",
    "opens": 3,
    "users": 3,
    "closes": 3,
    "avgSec": 79.7,
    "androidOpens": 0,
    "iosOpens": 3
  },
  {
    "feature": "ContactMerge",
    "opens": 4,
    "users": 2,
    "closes": 4,
    "avgSec": 8.2,
    "androidOpens": 0,
    "iosOpens": 4
  },
  {
    "feature": "Files",
    "opens": 3,
    "users": 1,
    "closes": 3,
    "avgSec": 1.4,
    "androidOpens": 0,
    "iosOpens": 3
  },
  {
    "feature": "FeatureRequest",
    "opens": 1,
    "users": 1,
    "closes": 1,
    "avgSec": 1.7,
    "androidOpens": 0,
    "iosOpens": 1
  }
]

const EVENTS: DashboardInputs['events'] = {
  feature_opened: { count: 8781, users: 242 },
  scan_started: { count: 1560, users: 150 },
  scan_completed: { count: 880, users: 127 },
  scan_cancelled: { count: 161, users: 58 },
  scan_failed: { count: 153, users: 10 },
  cleanup_completed: { count: 745, users: 71 },
  cleanup_failed: { count: 17, users: 5 },
  cleanup_cancelled: { count: 17, users: 8 },
}

const FUNNEL: DashboardInputs['funnel'] = [
  { step: 'First open', all: 225, android: 164, ios: 61 },
  { step: 'Login', all: 159, android: 106, ios: 53 },
  { step: 'Scan started', all: 123, android: 86, ios: 37 },
  { step: 'Scan completed', all: 101, android: 68, ios: 33 },
  { step: 'Cleanup completed', all: 52, android: 27, ios: 25 },
]

const wave = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

export function mockInputs(f: Filters): DashboardInputs {
  const days: string[] = []
  for (let t = Date.parse(f.from); t <= Date.parse(f.to); t += 86_400_000) days.push(new Date(t).toISOString().slice(0, 10))
  const daily = days.map((date, i) => {
    const activeUsers = 6 + Math.round(wave(i + 1) * 14)
    return { date, activeUsers, newUsers: Math.round(activeUsers * (0.35 + wave(i + 50) * 0.25)), sessions: Math.round(activeUsers * 1.5) }
  })
  const sum = (k: 'activeUsers' | 'newUsers' | 'sessions') => daily.reduce((s, d) => s + d[k], 0)
  const hourly = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    activeUsers: Math.round(4 + 14 * Math.max(0, Math.sin(((hour - 6) / 24) * Math.PI * 2))),
    events: Math.round(80 + 900 * Math.max(0, Math.sin(((hour - 6) / 24) * Math.PI * 2))),
  }))
  return {
    filters: f,
    totals: {
      activeUsers: Math.round(sum('activeUsers') * 0.6),
      newUsers: sum('newUsers'),
      sessions: sum('sessions'),
      prevActiveUsers: Math.round(sum('activeUsers') * 0.5),
      prevNewUsers: Math.round(sum('newUsers') * 0.9),
      prevSessions: Math.round(sum('sessions') * 0.8),
    },
    daily,
    hourly,
    funnel: FUNNEL,
    events: EVENTS,
    features: FEATURES,
  }
}

export function mockRealtime(): RealtimeData {
  return { total: 7, android: 5, ios: 2, at: new Date().toISOString() }
}
