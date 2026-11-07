/**
 * Site-wide constants and structured-data (JSON-LD) builders shared by the homepage, the feature
 * landing pages and the blog. Pure functions only, so they can be unit tested and used from
 * server components.
 */

export const SITE_URL = 'https://dedup.space'
export const SITE_NAME = 'DeDup'
export const PLAY_PACKAGE = 'com.rp.dedup'
export const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${PLAY_PACKAGE}`
export const APP_STORE_URL = 'https://apps.apple.com/us/app/dedup-ai-photo-cleaner/id6814824281'
export const PUBLISHER = 'Rahul Pahuja'
export const CONTACT_EMAIL = 'therahulpahuja@gmail.com'

/** UTM values every website link to Google Play carries, so installs can be attributed. */
export const PLAY_UTM = {
  utm_source: 'website',
  utm_medium: 'organic',
  utm_campaign: 'dedup_seo',
} as const

/**
 * The Google Play link with consistent UTM parameters. `content` names the placement
 * (for example "home_hero" or "duplicate_photo_cleaner_footer") and becomes `utm_content`.
 */
export function playStoreUrl(content?: string): string {
  const url = new URL(PLAY_STORE_URL)
  for (const [k, v] of Object.entries(PLAY_UTM)) url.searchParams.set(k, v)
  if (content) url.searchParams.set('utm_content', slugifyPlacement(content))
  return url.toString()
}

function slugifyPlacement(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80)
}

/** Default share image (src/app/opengraph-image.png), for pages that set their own openGraph. */
export const DEFAULT_SHARE_IMAGE = {
  url: `${SITE_URL}/opengraph-image.png`,
  width: 1200,
  height: 630,
  alt: 'DeDup: AI storage cleaner for Android',
}

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

/** The feature landing pages, in the order they are linked from the homepage and each other. */
export const FEATURE_PAGES = [
  { path: '/ai-storage-cleaner', label: 'AI Storage Cleaner' },
  { path: '/duplicate-photo-cleaner', label: 'Duplicate Photo Cleaner' },
  { path: '/duplicate-video-cleaner', label: 'Duplicate Video Cleaner' },
  { path: '/whatsapp-cleaner', label: 'WhatsApp Cleaner' },
] as const

export type FeaturePath = (typeof FEATURE_PAGES)[number]['path']

export function isFeaturePath(path: string): path is FeaturePath {
  return FEATURE_PAGES.some((p) => p.path === path)
}

// ---------- JSON-LD ----------

type JsonLd = Record<string, unknown>

export function organizationJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl('/icon1.png'),
    email: CONTACT_EMAIL,
    founder: { '@type': 'Person', name: PUBLISHER },
  }
}

export function websiteJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { '@id': `${SITE_URL}/#organization` },
  }
}

/**
 * The Android app. Deliberately has no aggregateRating, review, offers price or download count:
 * the site does not publish figures it cannot keep in sync with the store.
 */
export function softwareApplicationJsonLd(opts: { description: string; url?: string }): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${SITE_URL}/#android-app`,
    name: SITE_NAME,
    description: opts.description,
    url: opts.url ? absoluteUrl(opts.url) : SITE_URL,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Android',
    installUrl: PLAY_STORE_URL,
    downloadUrl: PLAY_STORE_URL,
    publisher: { '@id': `${SITE_URL}/#organization` },
  }
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

/** Only for pages that show these exact questions and answers on screen. */
export function faqJsonLd(faqs: { q: string; a: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
}

export function articleJsonLd(post: {
  title: string
  description?: string | null
  path: string
  image?: string | null
  authorName: string
  publishedAt?: Date | string | null
  updatedAt?: Date | string | null
}): JsonLd {
  const iso = (d?: Date | string | null) => (d ? new Date(d).toISOString() : undefined)
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description ?? undefined,
    mainEntityOfPage: absoluteUrl(post.path),
    image: post.image ? absoluteUrl(post.image) : absoluteUrl('/opengraph-image.png'),
    author: { '@type': 'Person', name: post.authorName },
    publisher: { '@id': `${SITE_URL}/#organization` },
    datePublished: iso(post.publishedAt),
    dateModified: iso(post.updatedAt ?? post.publishedAt),
  }
}

/**
 * Serialises JSON-LD for a <script type="application/ld+json"> tag. `<` is escaped so text in
 * the data can never close the script element.
 */
export function serializeJsonLd(data: JsonLd | JsonLd[]): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
