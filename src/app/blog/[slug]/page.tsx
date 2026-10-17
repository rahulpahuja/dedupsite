import Link from 'next/link'
import { BrandLogo } from '@/components/brand/brand-logo'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { db } from '@/lib/db'
import { parseTags, estimateReadTime } from '@/lib/auth'
import { PostMetaBadges } from '@/components/blog/post-meta-badges'
import { PLATFORM_LABEL, appVersionLabel, filterQueryFor, isPlatform, osVersionLabel } from '@/lib/blog-meta'

export const dynamicParams = false

export async function generateStaticParams() {
  const posts = await db.post.findMany({
    where: { published: true },
    select: { slug: true },
  })
  return posts.map((post) => ({ slug: post.slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const post = await db.post.findFirst({ where: { slug, published: true } })
  if (!post) return {}
  return {
    title: `${post.title} — DeDup Blog`,
    description: post.excerpt ?? undefined,
  }
}

function formatDate(date: Date | string | null) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await db.post.findFirst({ where: { slug, published: true } })
  if (!post) notFound()

  const tags = parseTags(post.tags)
  const readTime = estimateReadTime(post.content ?? '')

  // The same action documented for other platforms / versions.
  const related = post.topic
    ? await db.post.findMany({
        where: { published: true, topic: post.topic, NOT: { id: post.id } },
        orderBy: [{ platform: 'asc' }, { appVersion: 'desc' }],
        select: { id: true, title: true, slug: true, platform: true, appVersion: true, osVersion: true },
      })
    : []
  const hasMeta = isPlatform(post.platform) || !!post.appVersion || !!post.osVersion

  return (
    <main className="relative min-h-screen bg-[#060D1F]">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[2] h-32 bg-gradient-to-b from-[#060D1F] to-transparent" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" aria-label="DeDup home">
            <BrandLogo />
          </Link>
          <Link
            href="/blog"
            className="text-sm text-white/60 transition hover:text-white"
          >
            ← All posts
          </Link>
        </div>
      </nav>

      <article className="relative z-10 px-6 pb-24 pt-32">
        <div className="mx-auto max-w-3xl">
          {/* Cover image */}
          {post.coverImage && (
            <div className="mb-10 overflow-hidden rounded-2xl border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.coverImage}
                alt={post.title}
                className="h-64 w-full object-cover sm:h-80"
              />
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-sky/20 bg-sky/10 px-3 py-1 text-[11px] font-medium text-sky"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="mt-5 flex flex-wrap items-center gap-3 border-b border-white/[0.07] pb-8 text-sm text-white/45">
            <span className="font-medium text-white/70">{post.authorName}</span>
            <span>·</span>
            <span>{formatDate(post.publishedAt)}</span>
            <span>·</span>
            <span>{readTime} min read</span>
          </div>

          {/* Platform / version this post applies to */}
          {hasMeta && (
            <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
                Applies to
              </div>
              <PostMetaBadges post={post} size="md" />
              <Link
                href={`/blog${filterQueryFor(post)}`}
                className="mt-3 inline-block text-xs text-sky underline underline-offset-4 hover:text-white"
              >
                See all posts for this platform and version →
              </Link>
            </div>
          )}

          {/* Markdown content */}
          <div className="prose-blog mt-10">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="font-display mt-10 mb-4 text-2xl font-bold text-white sm:text-3xl">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="font-display mt-8 mb-3 text-xl font-bold text-white sm:text-2xl">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="font-display mt-6 mb-2 text-lg font-semibold text-white">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="my-4 leading-relaxed text-white/70">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="my-4 list-disc space-y-1.5 pl-6 text-white/70">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="my-4 list-decimal space-y-1.5 pl-6 text-white/70">{children}</ol>
                ),
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="my-6 border-l-2 border-sky pl-5 text-white/55 italic">
                    {children}
                  </blockquote>
                ),
                code: ({ className, children, ...props }) => {
                  const isBlock = className?.startsWith('language-')
                  if (isBlock) {
                    return (
                      <pre className="my-5 overflow-x-auto rounded-xl border border-white/10 bg-white/[0.04] p-5 text-sm text-white/80">
                        <code>{children}</code>
                      </pre>
                    )
                  }
                  return (
                    <code
                      className="rounded bg-white/[0.08] px-1.5 py-0.5 text-[0.85em] text-sky"
                      {...props}
                    >
                      {children}
                    </code>
                  )
                },
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky underline underline-offset-4 transition hover:text-white"
                  >
                    {children}
                  </a>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-white">{children}</strong>
                ),
                hr: () => <hr className="my-8 border-white/10" />,
                img: ({ src, alt }) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={src}
                    alt={alt ?? ''}
                    className="mx-auto my-6 h-auto max-h-[560px] w-auto max-w-full rounded-xl border border-white/10"
                  />
                ),
              }}
            >
              {post.content ?? ''}
            </ReactMarkdown>
          </div>

          {/* Same action on other platforms / versions */}
          {related.length > 0 && (
            <section className="mt-16 border-t border-white/[0.07] pt-8" aria-labelledby="related-heading">
              <h2 id="related-heading" className="font-display text-lg font-semibold text-white">
                Same action on other platforms and versions
              </h2>
              <ul className="mt-4 space-y-3">
                {related.map((r) => {
                  const label = [
                    isPlatform(r.platform) ? PLATFORM_LABEL[r.platform] : null,
                    appVersionLabel(null, r.appVersion),
                    osVersionLabel(r.platform, r.osVersion),
                  ]
                    .filter(Boolean)
                    .join(' · ')
                  return (
                    <li key={r.id}>
                      <Link
                        href={`/blog/${r.slug}`}
                        className="block rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-sky/30 hover:bg-white/[0.04]"
                      >
                        <span className="block text-xs text-white/45">{label}</span>
                        <span className="mt-1 block text-sm font-medium text-white">{r.title}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          {/* Back link */}
          <div className="mt-16 border-t border-white/[0.07] pt-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
            >
              ← Back to all posts
            </Link>
          </div>
        </div>
      </article>

      {/* Footer */}
      <footer className="relative border-t border-white/[0.06] bg-[#060D1F] px-6 py-10">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" className="font-display text-base font-bold text-white">
            DeDup
          </Link>
          <p className="text-center text-xs text-white/45">© 2006 Mobile1x</p>
          <Link href="/blog" className="text-xs text-white/55 transition hover:text-white">
            More posts →
          </Link>
        </div>
      </footer>
    </main>
  )
}
