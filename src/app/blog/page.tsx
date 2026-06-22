import Link from 'next/link'
import { db } from '@/lib/db'
import { parseTags, estimateReadTime } from '@/lib/auth'

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
    },
  })

  return (
    <main className="relative min-h-screen bg-[#0F0608]">
      {/* Top fade */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[2] h-32 bg-gradient-to-b from-[#0F0608] to-transparent" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link
            href="/"
            className="font-display text-xl font-bold tracking-tight text-white"
          >
            De<span className="bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">Dup</span>
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
            <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-300">
              From the Team
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              The DeDup{' '}
              <span className="bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">
                Blog
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/55 sm:text-base">
              Tips, updates, and insights on keeping your phone clean and fast.
            </p>
          </div>

          {/* Posts grid */}
          {posts.length === 0 ? (
            <div className="py-24 text-center text-white/40">
              No posts published yet. Check back soon.
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => {
                const tags = parseTags(post.tags)
                const readTime = estimateReadTime(post.content ?? '')
                return (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] transition duration-300 hover:border-rose-500/30 hover:bg-white/[0.04] hover:shadow-[0_0_50px_-12px_rgba(251,113,133,0.3)]"
                  >
                    {post.coverImage && (
                      <div className="relative h-44 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0608]/80 to-transparent" />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-6">
                      {tags.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-1.5">
                          {tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-medium text-rose-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <h2 className="font-display text-lg font-semibold leading-snug text-white transition group-hover:text-rose-100">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="mt-2 flex-1 text-sm leading-relaxed text-white/50 line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="mt-5 flex items-center gap-2 text-[11px] text-white/35">
                        <span>{post.authorName}</span>
                        <span>·</span>
                        <span>{formatDate(post.publishedAt)}</span>
                        <span>·</span>
                        <span>{readTime} min read</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative border-t border-white/[0.06] bg-[#0F0608] px-6 py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" className="font-display text-base font-bold text-white">
            DeDup
          </Link>
          <p className="text-center text-xs text-white/45">© 2025 Mobile1x</p>
          <Link href="/" className="text-xs text-white/55 transition hover:text-white">
            ← Back to home
          </Link>
        </div>
      </footer>
    </main>
  )
}
