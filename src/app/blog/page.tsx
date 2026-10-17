import Link from 'next/link'
import { BrandLogo } from '@/components/brand/brand-logo'
import { db } from '@/lib/db'
import { parseTags, estimateReadTime } from '@/lib/auth'
import { Suspense } from 'react'
import { BlogFilterList, type BlogListPost } from '@/components/blog/blog-filter-list'

export const dynamic = 'force-static'

export const metadata = {
  title: 'Blog — DeDup',
  description: 'Tips, updates, and insights from the DeDup team.',
}

function formatDate(date: Date | string | null) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function BlogListPage() {
  const posts = await db.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      tags: true,
      publishedAt: true,
      authorName: true,
      content: true,
      platform: true,
      appVersion: true,
      osVersion: true,
    },
  })

  const listPosts: BlogListPost[] = posts.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    tags: parseTags(post.tags),
    authorName: post.authorName,
    dateLabel: formatDate(post.publishedAt),
    readTime: estimateReadTime(post.content ?? ''),
    platform: post.platform,
    appVersion: post.appVersion,
    osVersion: post.osVersion,
  }))

  return (
    <main className="relative min-h-screen bg-[#060D1F]">
      {/* Top fade */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[2] h-32 bg-gradient-to-b from-[#060D1F] to-transparent" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" aria-label="DeDup home">
            <BrandLogo />
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/blog"
              className="font-medium text-white"
            >
              Blog
            </Link>
            <Link
              href="/"
              className="text-white/60 transition hover:text-white"
            >
              Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10 px-6 pb-24 pt-32">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-16 text-center">
            <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-sky">
              From the Team
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              The DeDup{' '}
              <span className="text-gradient">
                Blog
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/55 sm:text-base">
              What each DeDup action does on your phone, by platform, app version and OS version.
            </p>
          </div>

          {/* Filters + posts grid (filters live in the URL, so the page stays static) */}
          <Suspense fallback={null}>
            <BlogFilterList posts={listPosts} />
          </Suspense>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative border-t border-white/[0.06] bg-[#060D1F] px-6 py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" className="font-display text-base font-bold text-white">
            DeDup
          </Link>
          <p className="text-center text-xs text-white/45">© 2006 Mobile1x</p>
          <Link href="/" className="text-xs text-white/55 transition hover:text-white">
            ← Back to home
          </Link>
        </div>
      </footer>
    </main>
  )
}
