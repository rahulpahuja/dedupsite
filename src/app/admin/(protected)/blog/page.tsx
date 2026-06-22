'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Post = {
  id: string
  title: string
  slug: string
  published: boolean
  publishedAt: string | null
  createdAt: string
  tags: string | null
  excerpt: string | null
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AdminBlogPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function load() {
    const res = await fetch('/api/admin/posts')
    if (res.status === 401) { router.push('/admin/login'); return }
    const data = await res.json()
    setPosts(data.posts ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    setDeleting(id)
    await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' })
    setPosts((prev) => prev.filter((p) => p.id !== id))
    setDeleting(null)
  }

  async function handleLogout() {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  return (
    <main className="min-h-screen bg-[#0F0608] px-6 py-10">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/" className="font-display text-xl font-bold text-white">
              De<span className="bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">Dup</span>
              <span className="ml-2 text-sm font-normal text-white/40">Admin</span>
            </Link>
            <p className="mt-1 text-sm text-white/40">Manage blog posts</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/blog/new"
              className="rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              + New post
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/60 transition hover:bg-white/[0.06] hover:text-white"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Posts table */}
        <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02]">
          {loading ? (
            <div className="py-20 text-center text-sm text-white/30">Loading…</div>
          ) : posts.length === 0 ? (
            <div className="py-20 text-center text-sm text-white/30">
              No posts yet.{' '}
              <Link href="/admin/blog/new" className="text-rose-400 underline underline-offset-4">
                Create your first post
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-left text-xs font-medium uppercase tracking-wider text-white/30">
                  <th className="px-6 py-4">Title</th>
                  <th className="hidden px-6 py-4 sm:table-cell">Status</th>
                  <th className="hidden px-6 py-4 md:table-cell">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {posts.map((post) => (
                  <tr key={post.id} className="group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white/90 line-clamp-1">{post.title}</div>
                      <div className="mt-0.5 text-xs text-white/35">/{post.slug}</div>
                    </td>
                    <td className="hidden px-6 py-4 sm:table-cell">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          post.published
                            ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                            : 'border border-white/10 bg-white/[0.04] text-white/40'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${post.published ? 'bg-emerald-400' : 'bg-white/30'}`}
                        />
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="hidden px-6 py-4 text-white/40 md:table-cell">
                      {formatDate(post.publishedAt ?? post.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {post.published && (
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/50 transition hover:bg-white/[0.07] hover:text-white"
                          >
                            View
                          </Link>
                        )}
                        <Link
                          href={`/admin/blog/${post.id}/edit`}
                          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/50 transition hover:bg-white/[0.07] hover:text-white"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          disabled={deleting === post.id}
                          className="rounded-lg border border-rose-500/20 bg-rose-500/[0.05] px-3 py-1.5 text-xs text-rose-400 transition hover:bg-rose-500/10 disabled:opacity-40"
                        >
                          {deleting === post.id ? '…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Public blog link */}
        <div className="mt-6 text-center">
          <Link href="/blog" target="_blank" className="text-xs text-white/30 transition hover:text-white/60">
            View public blog →
          </Link>
        </div>
      </div>
    </main>
  )
}
