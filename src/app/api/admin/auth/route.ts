import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  LEGACY_COOKIE,
  SESSION_COOKIE,
  SESSION_MAX_AGE_S,
  createSession,
  passwordMatches,
  sessionSecret,
} from '@/lib/admin-session'

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { password?: unknown } | null
  const secret = sessionSecret()

  if (!secret || !passwordMatches(body?.password, process.env.ADMIN_PASSWORD)) {
    // A short pause makes password guessing slower without affecting real sign-ins.
    await new Promise((resolve) => setTimeout(resolve, 400))
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(SESSION_COOKIE, createSession(secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_S,
  })
  // Drop any cookie from before sessions were signed; it held the raw password.
  res.cookies.delete(LEGACY_COOKIE)
  return res
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  cookieStore.delete(LEGACY_COOKIE)
  return NextResponse.json({ ok: true })
}
