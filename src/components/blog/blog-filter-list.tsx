'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import {
  NO_FILTERS,
  PLATFORM_LABEL,
  appVersionLabel,
  compareVersionsDesc,
  filtersFromParams,
  isPlatform,
  matchesFilters,
  osVersionLabel,
  parseVersionKey,
  versionKey,
  type BlogFilters,
  type Platform,
} from '@/lib/blog-meta'
import { PostMetaBadges } from '@/components/blog/post-meta-badges'

export type BlogListPost = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  tags: string[]
  authorName: string
  dateLabel: string
  readTime: number
  platform: string | null
  appVersion: string | null
  osVersion: string | null
}

type Option = { value: string; label: string }

/** Distinct "<platform>-<version>" options from the posts, newest version first. */
function versionOptions(
  posts: BlogListPost[],
  field: 'appVersion' | 'osVersion',
  platform: Platform | null,
  label: (platform: string | null, version: string | null) => string | null,
): Option[] {
  const seen = new Map<string, Option & { platform: Platform; version: string }>()
  for (const p of posts) {
    const key = versionKey(p.platform, p[field])
    const parsed = parseVersionKey(key)
    if (!key || !parsed || (platform && parsed.platform !== platform) || seen.has(key)) continue
    seen.set(key, { value: key, label: label(parsed.platform, parsed.version) ?? key, ...parsed })
  }
  return [...seen.values()]
    .sort((a, b) => a.platform.localeCompare(b.platform) || compareVersionsDesc(a.version, b.version))
    .map(({ value, label }) => ({ value, label }))
}

const chip = (active: boolean) =>
  `rounded-full border px-3.5 py-1.5 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky ${
    active
      ? 'border-sky bg-sky/15 text-white'
      : 'border-white/10 bg-white/[0.03] text-white/60 hover:border-white/25 hover:text-white'
  }`

const select =
  'rounded-lg border border-white/10 bg-night-2 px-3 py-2 text-xs text-white/80 outline-none transition focus:border-sky/60'

export function BlogFilterList({ posts }: { posts: BlogListPost[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const filters = filtersFromParams((name) => params.get(name))

  const platforms = useMemo(
    () => (['android', 'ios'] as const).filter((pl) => posts.some((p) => p.platform === pl)),
    [posts],
  )
  const appOptions = useMemo(
    () => versionOptions(posts, 'appVersion', filters.platform, appVersionLabel),
    [posts, filters.platform],
  )
  const osOptions = useMemo(
    () => versionOptions(posts, 'osVersion', filters.platform, osVersionLabel),
    [posts, filters.platform],
  )
  const visible = useMemo(() => posts.filter((p) => matchesFilters(p, filters)), [posts, filters])

  function update(next: BlogFilters) {
    const q = new URLSearchParams()
    if (next.platform) q.set('platform', next.platform)
    if (next.app) q.set('app', next.app)
    if (next.os) q.set('os', next.os)
    const qs = q.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  function setPlatform(platform: Platform | null) {
    // Keep a version filter only if it belongs to the newly chosen platform.
    const keep = (key: string | null) => (key && (!platform || parseVersionKey(key)?.platform === platform) ? key : null)
    update({ platform, app: keep(filters.app), os: keep(filters.os) })
  }

  const active = filters.platform || filters.app || filters.os
  const showFilters = platforms.length > 0 || appOptions.length > 0 || osOptions.length > 0

  return (
    <>
      {showFilters && (
        <section aria-label="Filter posts" className="mb-10 flex flex-col gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-6 sm:p-5">
          <div>
            <div id="filter-platform" className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
              Platform
            </div>
            <div role="group" aria-labelledby="filter-platform" className="flex flex-wrap gap-2">
              <button type="button" aria-pressed={!filters.platform} className={chip(!filters.platform)} onClick={() => setPlatform(null)}>
                All
              </button>
              {platforms.map((pl) => (
                <button key={pl} type="button" aria-pressed={filters.platform === pl} className={chip(filters.platform === pl)} onClick={() => setPlatform(pl)}>
                  {PLATFORM_LABEL[pl]}
                </button>
              ))}
            </div>
          </div>

          {appOptions.length > 0 && (
            <label className="flex flex-col gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
              DeDup version
              <select className={select} value={filters.app ?? ''} onChange={(e) => update({ ...filters, app: e.target.value || null })}>
                <option value="">Any version</option>
                {appOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
          )}

          {osOptions.length > 0 && (
            <label className="flex flex-col gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
              OS version
              <select className={select} value={filters.os ?? ''} onChange={(e) => update({ ...filters, os: e.target.value || null })}>
                <option value="">Any version</option>
                {osOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
          )}

          <div className="flex items-center gap-3 text-xs text-white/50 sm:ml-auto" aria-live="polite">
            <span>
              {visible.length} {visible.length === 1 ? 'post' : 'posts'}
            </span>
            {active && (
              <button type="button" className="text-sky underline underline-offset-4 hover:text-white" onClick={() => update(NO_FILTERS)}>
                Clear filters
              </button>
            )}
          </div>
        </section>
      )}

      {visible.length === 0 ? (
        <div className="py-24 text-center text-white/40">
          {posts.length === 0 ? 'No posts published yet. Check back soon.' : 'No posts match these filters yet.'}
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] transition duration-300 hover:border-sky/30 hover:bg-white/[0.04] hover:shadow-[0_0_50px_-12px_rgba(95,163,255,0.3)]"
            >
              {post.coverImage && (
                <div className="relative h-44 overflow-hidden">
                  <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-night/80 to-transparent" />
                </div>
              )}
              <div className="flex flex-1 flex-col p-6">
                {isPlatform(post.platform) || post.appVersion || post.osVersion ? (
                  <div className="mb-3">
                    <PostMetaBadges post={post} />
                  </div>
                ) : null}
                {post.tags.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-sky/20 bg-sky/10 px-2.5 py-0.5 text-[11px] font-medium text-sky">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <h2 className="font-display text-lg font-semibold leading-snug text-white">{post.title}</h2>
                {post.excerpt && <p className="mt-2 flex-1 text-sm leading-relaxed text-white/50 line-clamp-3">{post.excerpt}</p>}
                <div className="mt-5 flex items-center gap-2 text-[11px] text-white/35">
                  <span>{post.authorName}</span>
                  <span>·</span>
                  <span>{post.dateLabel}</span>
                  <span>·</span>
                  <span>{post.readTime} min read</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
