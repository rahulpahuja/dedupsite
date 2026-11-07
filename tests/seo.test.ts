// @ts-ignore -- bun's built-in test runner; its type package is not installed in this project
import { describe, expect, test } from 'bun:test'
// @ts-ignore -- bun's built-in SQLite driver
import { Database } from 'bun:sqlite'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  FEATURE_PAGES,
  PLAY_STORE_URL,
  breadcrumbJsonLd,
  faqJsonLd,
  isFeaturePath,
  playStoreUrl,
  serializeJsonLd,
  softwareApplicationJsonLd,
} from '../src/lib/site'
import { campaignParams, cleanPath, deviceCategory, referrerHost } from '../src/lib/track'
import { LANDING_PAGES } from '../src/content/landing-pages'
import { parseArticle } from '../scripts/seed-seo-articles'

const ROOT = process.cwd()

describe('playStoreUrl', () => {
  test('adds the standard UTM parameters and keeps the package id', () => {
    const url = new URL(playStoreUrl('Home Hero'))
    expect(url.origin + url.pathname).toBe('https://play.google.com/store/apps/details')
    expect(url.searchParams.get('id')).toBe('com.rp.dedup')
    expect(url.searchParams.get('utm_source')).toBe('website')
    expect(url.searchParams.get('utm_medium')).toBe('organic')
    expect(url.searchParams.get('utm_campaign')).toBe('dedup_seo')
    expect(url.searchParams.get('utm_content')).toBe('home_hero')
  })
  test('omits utm_content when no placement is given', () => {
    expect(new URL(playStoreUrl()).searchParams.has('utm_content')).toBe(false)
    expect(playStoreUrl().startsWith(PLAY_STORE_URL)).toBe(true)
  })
})

describe('JSON-LD', () => {
  test('serializeJsonLd escapes < so data cannot close the script tag', () => {
    const out = serializeJsonLd({ name: '</script><script>alert(1)</script>' })
    expect(out.includes('<')).toBe(false)
    expect(JSON.parse(out).name).toBe('</script><script>alert(1)</script>')
  })
  test('SoftwareApplication carries no ratings, reviews, prices or download counts', () => {
    const app = softwareApplicationJsonLd({ description: 'x' })
    for (const k of ['aggregateRating', 'review', 'offers', 'interactionStatistic']) {
      expect(k in app).toBe(false)
    }
  })
  test('breadcrumbs are numbered from 1 with absolute URLs', () => {
    const b = breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'X', path: '/x' }]) as {
      itemListElement: { position: number; item: string }[]
    }
    expect(b.itemListElement.map((i) => i.position)).toEqual([1, 2])
    expect(b.itemListElement[1].item).toBe('https://dedup.space/x')
  })
  test('FAQPage mirrors the questions given', () => {
    const f = faqJsonLd([{ q: 'Q?', a: 'A.' }]) as { mainEntity: { name: string }[] }
    expect(f.mainEntity[0].name).toBe('Q?')
  })
})

describe('tracking helpers', () => {
  test('campaignParams keeps only utm_* keys and truncates values', () => {
    const p = campaignParams(`?utm_source=g&utm_campaign=${'x'.repeat(300)}&email=a@b.c`)
    expect(p).toEqual({ utm_source: 'g', utm_campaign: 'x'.repeat(100) })
  })
  test('deviceCategory buckets by width', () => {
    expect(deviceCategory(390)).toBe('mobile')
    expect(deviceCategory(800)).toBe('tablet')
    expect(deviceCategory(1440)).toBe('desktop')
  })
  test('referrerHost returns only an external host', () => {
    expect(referrerHost('https://www.google.com/search?q=secret', 'dedup.space')).toBe('www.google.com')
    expect(referrerHost('https://dedup.space/blog', 'dedup.space')).toBeUndefined()
    expect(referrerHost('', 'dedup.space')).toBeUndefined()
    expect(referrerHost('not a url', 'dedup.space')).toBeUndefined()
  })
  test('cleanPath drops query and hash', () => {
    expect(cleanPath('/whatsapp-cleaner?x=1#faq', 'https://dedup.space/')).toBe('/whatsapp-cleaner')
  })
})

describe('landing page content', () => {
  const pages = Object.values(LANDING_PAGES)

  test('there is content for exactly the four feature routes', () => {
    expect(pages.map((p) => p.path).sort()).toEqual(FEATURE_PAGES.map((p) => p.path).sort())
    for (const p of pages) expect(isFeaturePath(p.path)).toBe(true)
  })
  test('titles, descriptions and H1s are unique and within search-result lengths', () => {
    for (const key of ['title', 'description', 'h1'] as const) {
      expect(new Set(pages.map((p) => p[key])).size).toBe(pages.length)
    }
    for (const p of pages) {
      expect(p.title.length).toBeLessThanOrEqual(70)
      expect(p.description.length).toBeGreaterThanOrEqual(70)
      expect(p.description.length).toBeLessThanOrEqual(200)
    }
  })
  test('every screenshot exists and has alt text', () => {
    for (const p of pages) {
      const shots = [p.hero, ...p.sections.flatMap((s) => (s.shot ? [s.shot] : []))]
      for (const s of shots) {
        expect(s.alt.length).toBeGreaterThan(20)
        expect(() => readFileSync(join(ROOT, 'public', s.src))).not.toThrow()
      }
    }
  })
  test('every page has FAQs and links only to published guides', () => {
    const db = new Database(join(ROOT, 'db/custom.db'), { readonly: true })
    const published = new Set(
      (db.query('select slug from Post where published = 1').all() as { slug: string }[]).map((r) => r.slug),
    )
    db.close()
    for (const p of pages) {
      expect(p.faqs.length).toBeGreaterThanOrEqual(3)
      for (const g of p.guides) expect(published.has(g.href.replace('/blog/', ''))).toBe(true)
    }
  })
  test('copy avoids claims the app does not support', () => {
    const text = JSON.stringify(LANDING_PAGES).toLowerCase()
    for (const banned of ['no account', 'without an account', '100%', 'guarantee', 'million', 'rated', 'stars']) {
      expect(text.includes(banned)).toBe(false)
    }
  })
})

describe('draft articles', () => {
  const dir = join(ROOT, 'content/articles')
  const files = readdirSync(dir).filter((f: string) => f.endsWith('.md'))
  const routes = new Set(['/', '/privacy', '/terms', '/blog', ...FEATURE_PAGES.map((p) => p.path)])

  test('there are eight, each with complete front matter', () => {
    expect(files.length).toBe(8)
    for (const f of files) parseArticle(f.replace('.md', ''), readFileSync(join(dir, f), 'utf8'))
  })
  test('internal links point at real routes and Play links carry UTM parameters', () => {
    for (const f of files) {
      const a = parseArticle(f.replace('.md', ''), readFileSync(join(dir, f), 'utf8'))
      const links = [...a.content.matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1])
      expect(links.some((l) => isFeaturePath(l))).toBe(true)
      for (const l of links) {
        if (l.startsWith('/')) expect(routes.has(l)).toBe(true)
        else {
          const u = new URL(l)
          expect(u.host).toBe('play.google.com')
          expect(u.searchParams.get('utm_campaign')).toBe('dedup_seo')
        }
      }
    }
  })
})
