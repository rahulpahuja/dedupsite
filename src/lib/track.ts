/**
 * Website conversion events, sent through the gtag.js tag already loaded in the root layout
 * (GA4 G-E6B5M8JKHP). No other SDK. No personal data: parameters are page paths, the referrer's
 * host, campaign (utm_*) values and a coarse device category.
 *
 * The pure helpers are exported for tests; `track` is the only function that touches `window`.
 */

export type WebsiteEvent =
  | 'landing_page_view'
  | 'feature_page_view'
  | 'google_play_cta_click'
  | 'internal_page_navigation'
  | 'article_view'
  | 'faq_expand'

export const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const

/** utm_* values from a query string, truncated so a crafted URL can't send long payloads. */
export function campaignParams(search: string): Record<string, string> {
  const params = new URLSearchParams(search)
  const out: Record<string, string> = {}
  for (const key of UTM_KEYS) {
    const v = params.get(key)
    if (v) out[key] = v.slice(0, 100)
  }
  return out
}

/** Width-based device bucket, matching GA's mobile / tablet / desktop wording. */
export function deviceCategory(width: number): 'mobile' | 'tablet' | 'desktop' {
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

/** Only the host of the referrer, never its path or query, and nothing for same-site referrers. */
export function referrerHost(referrer: string, ownHost: string): string | undefined {
  if (!referrer) return undefined
  try {
    const host = new URL(referrer).host
    return host && host !== ownHost ? host : undefined
  } catch {
    return undefined
  }
}

/** Path without query string or hash. */
export function cleanPath(href: string, base: string): string | undefined {
  try {
    return new URL(href, base).pathname
  } catch {
    return undefined
  }
}

type Gtag = (command: 'event', name: string, params: Record<string, unknown>) => void

export function track(name: WebsiteEvent, params: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return
  const gtag = (window as unknown as { gtag?: Gtag }).gtag
  if (typeof gtag !== 'function') return
  gtag('event', name, params)
}
