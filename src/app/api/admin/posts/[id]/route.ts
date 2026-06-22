import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdminAuthenticated } from '@/lib/auth'

type Params = Promise<{ id: string }>

export async function GET(_req: Request, { params }: { params: Params }) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const post = await db.post.findUnique({ where: { id } })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ post })
}

export async function PUT(req: Request, { params }: { params: Params }) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { title, slug, excerpt, content, coverImage, tags, published } = body

  const existing = await db.post.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const wasPublished = existing.published
  const post = await db.post.update({
    where: { id },
    data: {
      title,
      slug,
      excerpt: excerpt || null,
      content: content || null,
      coverImage: coverImage || null,
      tags: tags || null,
      published: !!published,
      publishedAt: published && !wasPublished ? new Date() : existing.publishedAt,
    },
  })
  return NextResponse.json({ post })
}

export async function DELETE(_req: Request, { params }: { params: Params }) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await db.post.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
