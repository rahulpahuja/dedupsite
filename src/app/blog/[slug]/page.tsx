import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { db } from '@/lib/db'
import { parseTags, estimateReadTime } from '@/lib/auth'

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

  return (
    <main className="relative min-h-screen bg-[#0F0608]">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[2] h-32 bg-gradient-to-b from-[#0F0608] to-transparent" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link
            href="/"
            className="font-display text-xl font-bold tracking-tight text-white"
          >
            De<span className="bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">Dup</span>
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
                  className="rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-[11px] font-medium text-rose-300"
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
                  <blockquote className="my-6 border-l-2 border-rose-400 pl-5 text-white/55 italic">
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
                      className="rounded bg-white/[0.08] px-1.5 py-0.5 text-[0.85em] text-rose-200"
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
                    className="text-rose-300 underline underline-offset-4 transition hover:text-rose-200"
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
                    className="my-6 w-full rounded-xl border border-white/10 object-cover"
                  />
                ),
              }}
            >
              {post.content ?? ''}
            </ReactMarkdown>
          </div>

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
      <footer className="relative border-t border-white/[0.06] bg-[#0F0608] px-6 py-10">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" className="font-display text-base font-bold text-white">
            DeDup
          </Link>
          <p className="text-center text-xs text-white/45">© 2025 Mobile1x</p>
          <Link href="/blog" className="text-xs text-white/55 transition hover:text-white">
            More posts →
          </Link>
        </div>
      </footer>
    </main>
  )
}
