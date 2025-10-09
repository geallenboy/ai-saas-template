import { and, desc, eq } from 'drizzle-orm'
import { cache } from 'react'
import { blogPosts } from '@/drizzle/schemas'
import { db } from '@/lib/db'

export type BlogPostSummary = {
  id: string
  title: string
  slug: string
  summary: string | null
  content: string
  coverImageUrl: string | null
  tags: string[]
  isFeatured: boolean
  status: (typeof blogPosts.$inferSelect)['status']
  locale: string
  readingMinutes: number | null
  publishedAt: Date | null
  authorId: string | null
  createdAt: Date
  updatedAt: Date
}

const normalizePost = (
  post: typeof blogPosts.$inferSelect
): BlogPostSummary => ({
  ...post,
  summary: post.summary ?? null,
  coverImageUrl: post.coverImageUrl ?? null,
  tags: post.tags ?? [],
  authorId: post.authorId ?? null,
  publishedAt: post.publishedAt ?? null,
  readingMinutes: post.readingMinutes ?? null,
})

export const getBlogPosts = cache(async (locale = 'zh') => {
  const posts = await db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.locale, locale), eq(blogPosts.status, 'published')))
    .orderBy(
      desc(blogPosts.publishedAt),
      desc(blogPosts.createdAt),
      desc(blogPosts.updatedAt)
    )

  return posts.map(normalizePost)
})

export const getBlogPost = cache(async (slug: string, locale = 'zh') => {
  const post = await db.query.blogPosts.findFirst({
    where: and(
      eq(blogPosts.slug, slug),
      eq(blogPosts.locale, locale),
      eq(blogPosts.status, 'published')
    ),
  })

  return post ? normalizePost(post) : null
})

export async function listTags(locale = 'zh') {
  const result = await db
    .select({ tags: blogPosts.tags })
    .from(blogPosts)
    .where(and(eq(blogPosts.locale, locale), eq(blogPosts.status, 'published')))

  const tagSet = new Set<string>()
  for (const row of result) {
    ;(row.tags ?? []).forEach(tag => {
      tagSet.add(tag)
    })
  }

  return Array.from(tagSet).sort((a, b) => a.localeCompare(b))
}

export function formatDate(date: string | Date, locale = 'en'): string {
  const d = new Date(date)
  const localeMap = {
    zh: 'zh-CN',
    en: 'en-US',
  }

  return d.toLocaleDateString(
    localeMap[locale as keyof typeof localeMap] || 'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  )
}

export function getReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}
