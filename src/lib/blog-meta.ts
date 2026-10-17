/**
 * Platform / version metadata for blog posts, and the filter rules shared by
 * the blog list, the post page and the public API.
 *
 * A post field that is null means "not specific": the post matches every
 * filter value for that field (e.g. a general guide shows under any version).
 */

export type Platform = 'android' | 'ios'

export const PLATFORM_LABEL: Record<Platform, string> = {
  android: 'Android',
  ios: 'iPhone',
}

/** The OS name used in front of an OS version ("Android 15", "iOS 26.5"). */
export const OS_LABEL: Record<Platform, string> = {
  android: 'Android',
  ios: 'iOS',
}

export type PostMeta = {
  platform: string | null
  appVersion: string | null
  osVersion: string | null
}

export type BlogFilters = {
  platform: Platform | null
  /** "<platform>-<version>", e.g. "android-1.5.3" */
  app: string | null
  /** "<platform>-<version>", e.g. "ios-26.5" */
  os: string | null
}

export const NO_FILTERS: BlogFilters = { platform: null, app: null, os: null }

export function isPlatform(value: string | null | undefined): value is Platform {
  return value === 'android' || value === 'ios'
}

/** Filter keys pair a version with its platform, since "15" alone is ambiguous. */
export function versionKey(platform: string | null, version: string | null): string | null {
  return isPlatform(platform) && version ? `${platform}-${version}` : null
}

export function parseVersionKey(key: string | null): { platform: Platform; version: string } | null {
  if (!key) return null
  const i = key.indexOf('-')
  const platform = key.slice(0, i)
  const version = key.slice(i + 1)
  return isPlatform(platform) && version ? { platform, version } : null
}

export function appVersionLabel(platform: string | null, version: string | null): string | null {
  return version ? `${isPlatform(platform) ? PLATFORM_LABEL[platform] + ' · ' : ''}DeDup ${version}` : null
}

export function osVersionLabel(platform: string | null, version: string | null): string | null {
  return version && isPlatform(platform) ? `${OS_LABEL[platform]} ${version}` : null
}

export function matchesFilters(post: PostMeta, f: BlogFilters): boolean {
  if (f.platform && post.platform && post.platform !== f.platform) return false
  const app = parseVersionKey(f.app)
  if (app && post.appVersion && (post.platform !== app.platform || post.appVersion !== app.version)) return false
  const os = parseVersionKey(f.os)
  if (os && post.osVersion && (post.platform !== os.platform || post.osVersion !== os.version)) return false
  return true
}

export function filtersFromParams(get: (name: string) => string | null): BlogFilters {
  const platform = get('platform')
  return {
    platform: isPlatform(platform) ? platform : null,
    app: parseVersionKey(get('app')) ? get('app') : null,
    os: parseVersionKey(get('os')) ? get('os') : null,
  }
}

/** Dotted-number comparison, newest first ("1.10.0" > "1.9.2"). */
export function compareVersionsDesc(a: string, b: string): number {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pb[i] ?? 0) - (pa[i] ?? 0)
    if (d !== 0 && !Number.isNaN(d)) return d
  }
  return 0
}

/** Query string for a link to the blog list filtered to a post's own platform/versions. */
export function filterQueryFor(post: PostMeta): string {
  const q = new URLSearchParams()
  if (isPlatform(post.platform)) q.set('platform', post.platform)
  const app = versionKey(post.platform, post.appVersion)
  if (app) q.set('app', app)
  const os = versionKey(post.platform, post.osVersion)
  if (os) q.set('os', os)
  const s = q.toString()
  return s ? `?${s}` : ''
}

const VERSION_RE = /^\d+(\.\d+){0,3}$/
const TOPIC_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/

/** Validate and normalise the platform/version fields from an admin request body. */
export function parsePostMeta(
  body: Record<string, unknown>,
): { ok: true; value: PostMeta & { topic: string | null } } | { ok: false; error: string } {
  const clean = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null)
  const platform = clean(body.platform)?.toLowerCase() ?? null
  const appVersion = clean(body.appVersion)
  const osVersion = clean(body.osVersion)
  const topic = clean(body.topic)?.toLowerCase() ?? null

  if (platform && !isPlatform(platform)) return { ok: false, error: 'Platform must be "android" or "ios"' }
  if (osVersion && !platform) return { ok: false, error: 'OS version needs a platform' }
  if (appVersion && !VERSION_RE.test(appVersion)) return { ok: false, error: 'DeDup version must look like 1.5.3' }
  if (osVersion && !VERSION_RE.test(osVersion)) return { ok: false, error: 'OS version must look like 15 or 26.5' }
  if (topic && !TOPIC_RE.test(topic)) return { ok: false, error: 'Topic must be a lowercase slug like move-to-trash' }
  return { ok: true, value: { platform, appVersion, osVersion, topic } }
}
