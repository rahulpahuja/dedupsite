'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'

function toSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function NewPostPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [tags, setTags] = useState('')
  const [preview, setPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function onTitleChange(v: string) {
    setTitle(v)
    if (!slugTouched) setSlug(toSlug(v))
  }

  async function save(publish: boolean) {
    if (!title.trim() || !slug.trim()) {
      setError('Title and slug are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, slug, excerpt, content, coverImage, tags, published: publish }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Failed to save.')
        return
      }
      router.push('/admin/blog')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0F0608] px-6 py-10">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/admin/blog" className="text-sm text-white/40 transition hover:text-white">
              ← Blog posts
            </Link>
            <h1 className="mt-1 font-display text-xl font-bold text-white">New post</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => save(false)}
              disabled={saving}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/70 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
            >
              Save draft
            </button>
            <button
              onClick={() => save(true)}
              disabled={saving}
              className="rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
            >
              {saving ? 'Saving…' : 'Publish'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          {/* Main */}
          <div className="space-y-5">
            <input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Post title"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 font-display text-2xl font-bold text-white placeholder-white/20 outline-none transition focus:border-rose-500/40 focus:ring-1 focus:ring-rose-500/20"
            />

            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short excerpt shown in blog list (optional)"
              rows={2}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3.5 text-sm text-white/80 placeholder-white/20 outline-none transition focus:border-rose-500/40 focus:ring-1 focus:ring-rose-500/20"
            />

            {/* Editor / Preview tabs */}
            <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
              <div className="flex border-b border-white/[0.06]">
                <button
                  onClick={() => setPreview(false)}
                  className={`px-5 py-2.5 text-sm font-medium transition ${
                    !preview ? 'text-white border-b-2 border-rose-400' : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  Write
                </button>
                <button
                  onClick={() => setPreview(true)}
                  className={`px-5 py-2.5 text-sm font-medium transition ${
                    preview ? 'text-white border-b-2 border-rose-400' : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  Preview
                </button>
              </div>

              {!preview ? (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your post in Markdown…"
                  rows={22}
                  className="w-full resize-none bg-transparent px-5 py-4 font-mono text-sm leading-relaxed text-white/80 placeholder-white/20 outline-none"
                />
              ) : (
                <div className="min-h-[400px] px-5 py-4">
                  {content ? (
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => <h1 className="font-display mt-6 mb-3 text-2xl font-bold text-white">{children}</h1>,
                        h2: ({ children }) => <h2 className="font-display mt-5 mb-2 text-xl font-bold text-white">{children}</h2>,
                        h3: ({ children }) => <h3 className="font-display mt-4 mb-2 text-lg font-semibold text-white">{children}</h3>,
                        p: ({ children }) => <p className="my-3 leading-relaxed text-white/70">{children}</p>,
                        ul: ({ children }) => <ul className="my-3 list-disc space-y-1 pl-6 text-white/70">{children}</ul>,
                        ol: ({ children }) => <ol className="my-3 list-decimal space-y-1 pl-6 text-white/70">{children}</ol>,
                        blockquote: ({ children }) => <blockquote className="my-4 border-l-2 border-rose-400 pl-4 text-white/55 italic">{children}</blockquote>,
                        code: ({ className, children }) => {
                          if (className?.startsWith('language-')) {
                            return <pre className="my-4 overflow-x-auto rounded-lg border border-white/10 bg-white/[0.05] p-4 text-sm text-white/80"><code>{children}</code></pre>
                          }
                          return <code className="rounded bg-white/[0.08] px-1.5 py-0.5 text-[0.85em] text-rose-200">{children}</code>
                        },
                        strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                        a: ({ href, children }) => <a href={href} className="text-rose-300 underline underline-offset-4">{children}</a>,
                      }}
                    >
                      {content}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-sm text-white/20">Nothing to preview yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
                Post settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/50">Slug</label>
                  <input
                    value={slug}
                    onChange={(e) => { setSlug(e.target.value); setSlugTouched(true) }}
                    placeholder="my-post-slug"
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 font-mono text-xs text-white/80 placeholder-white/20 outline-none transition focus:border-rose-500/40"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/50">
                    Cover image URL
                  </label>
                  <input
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://…"
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs text-white/80 placeholder-white/20 outline-none transition focus:border-rose-500/40"
                  />
                  {coverImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={coverImage}
                      alt="cover preview"
                      className="mt-2 h-28 w-full rounded-lg object-cover opacity-80"
                    />
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/50">
                    Tags (comma-separated)
                  </label>
                  <input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Android, Tips, Storage"
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs text-white/80 placeholder-white/20 outline-none transition focus:border-rose-500/40"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => save(true)}
                disabled={saving}
                className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
              >
                {saving ? 'Saving…' : 'Publish post'}
              </button>
              <button
                onClick={() => save(false)}
                disabled={saving}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 text-sm text-white/60 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
              >
                Save as draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
