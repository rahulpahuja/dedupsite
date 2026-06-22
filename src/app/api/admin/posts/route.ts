import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdminAuthenticated } from '@/lib/auth'

export async function GET() {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const posts = await db.post.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      published: true,
      publishedAt: true,
      createdAt: true,
      tags: true,
      excerpt: true,
    },
  })
  return NextResponse.json({ posts })
}

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, slug, excerpt, content, coverImage, tags, published } = body

  if (!title || !slug) {
    return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 })
  }

  const post = await db.post.create({
    data: {
      title,
      slug,
      excerpt: excerpt || null,
      content: content || null,
      coverImage: coverImage || null,
      tags: tags || null,
      published: !!published,
      publishedAt: published ? new Date() : null,
    },
  })
  return NextResponse.json({ post }, { status: 201 })
}
