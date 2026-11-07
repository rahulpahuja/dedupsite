'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { isFeaturePath } from '@/lib/site'
import { campaignParams, cleanPath, deviceCategory, referrerHost, track } from '@/lib/track'

const SESSION_KEY = 'dd_entry'
const IGNORED = /^\/(admin|analytics|api)(\/|$)/

type Entry = { landing_page: string; referrer_host?: string } & Record<string, string | undefined>

function readEntry(): Entry | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as Entry) : null
  } catch {
    return null
  }
}

function writeEntry(entry: Entry) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(entry))
  } catch {
    // Storage blocked (private mode etc.): events still send, just without session context.
  }
}

/** Context attached to every event: where the visit started and how it arrived. */
function sessionContext(): Record<string, unknown> {
  const entry = readEntry()
  return { ...(entry ?? {}), device_category: deviceCategory(window.innerWidth) }
}

/**
 * Sends the website's custom GA4 events. Mounted once in the root layout; GA's own page_view is
 * left to the gtag config, so nothing here duplicates it.
 */
export function SiteEvents() {
  const pathname = usePathname()
  const lastPath = useRef<string | null>(null)

  // Page-level events, once per path.
  useEffect(() => {
    if (!pathname || IGNORED.test(pathname) || lastPath.current === pathname) return
    lastPath.current = pathname

    if (!readEntry()) {
      const entry: Entry = {
        landing_page: pathname,
        referrer_host: referrerHost(document.referrer, window.location.host),
        ...campaignParams(window.location.search),
      }
      writeEntry(entry)
      track('landing_page_view', { page_path: pathname, ...sessionContext() })
    }

    if (isFeaturePath(pathname)) {
      track('feature_page_view', { page_path: pathname, feature: pathname.slice(1), ...sessionContext() })
    } else if (pathname.startsWith('/blog/')) {
      track('article_view', { page_path: pathname, article_slug: pathname.slice('/blog/'.length), ...sessionContext() })
    }
  }, [pathname])

  // Clicks and FAQ toggles, delegated so pages need no per-element handlers.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const path = window.location.pathname
      if (IGNORED.test(path)) return
      const a = (e.target as Element | null)?.closest?.('a')
      if (!a || !a.href) return
      let url: URL
      try {
        url = new URL(a.href, window.location.href)
      } catch {
        return
      }
      const placement = a.getAttribute('data-cta') ?? undefined
      if (url.host === 'play.google.com') {
        track('google_play_cta_click', {
          page_path: path,
          placement: placement ?? url.searchParams.get('utm_content') ?? undefined,
          ...sessionContext(),
        })
      } else if (url.host === window.location.host) {
        const to = cleanPath(a.href, window.location.href)
        if (to && to !== path && !IGNORED.test(to)) {
          track('internal_page_navigation', { page_path: path, to_path: to, placement, ...sessionContext() })
        }
      }
    }

    const onToggle = (e: Event) => {
      const el = e.target as HTMLElement | null
      if (!(el instanceof HTMLDetailsElement) || !el.open) return
      const question = el.getAttribute('data-faq')
      if (!question) return
      track('faq_expand', { page_path: window.location.pathname, question: question.slice(0, 100), ...sessionContext() })
    }

    document.addEventListener('click', onClick, true)
    // `toggle` does not bubble, so listen in the capture phase.
    document.addEventListener('toggle', onToggle, true)
    return () => {
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('toggle', onToggle, true)
    }
  }, [])

  return null
}
