'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        setError('Wrong password. Try again.')
        return
      }
      router.push('/admin/blog')
      router.refresh()
    } catch {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0F0608] px-6">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 block font-display text-2xl font-bold text-white"
        >
          De<span className="bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">Dup</span>
          <span className="ml-2 text-sm font-normal text-white/40">Admin</span>
        </Link>

        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-8">
          <h1 className="font-display text-xl font-semibold text-white">Sign in</h1>
          <p className="mt-1 text-sm text-white/45">Enter your admin password to continue.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/60">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-rose-500/40 focus:ring-1 focus:ring-rose-500/20"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-xs text-rose-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
