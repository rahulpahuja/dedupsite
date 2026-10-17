import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { filtersFromParams, matchesFilters } from '@/lib/blog-meta'

// Optional filters: ?platform=android|ios&app=android-1.5.3&os=android-15
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const filters = filtersFromParams((name) => searchParams.get(name))

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
      topic: true,
    },
  })
  return NextResponse.json({ posts: posts.filter((p) => matchesFilters(p, filters)) })
}
