import { TRPCError } from '@trpc/server'
import { and, asc, desc, eq, ilike, sql } from 'drizzle-orm'
import { z } from 'zod'
import { blogPosts, type NewBlogPost } from '@/drizzle/schemas'
import { blogStatusSchema, blogWriteSchema } from '@/lib/validators/blog'
import { adminProcedure, createTRPCRouter, publicProcedure } from '../server'

const basePostSelect = {
  id: blogPosts.id,
  title: blogPosts.title,
  slug: blogPosts.slug,
  summary: blogPosts.summary,
  content: blogPosts.content,
  coverImageUrl: blogPosts.coverImageUrl,
  tags: blogPosts.tags,
  isFeatured: blogPosts.isFeatured,
  status: blogPosts.status,
  locale: blogPosts.locale,
  readingMinutes: blogPosts.readingMinutes,
  publishedAt: blogPosts.publishedAt,
  authorId: blogPosts.authorId,
  createdAt: blogPosts.createdAt,
  updatedAt: blogPosts.updatedAt,
}

const parseTags = (tags?: string[]) =>
  Array.from(new Set((tags ?? []).map(tag => tag.trim()).filter(Boolean)))

const computeReadingMinutes = (content: string) => {
  const plainText = content.replace(/<[^>]+>/g, ' ')
  const words = plainText.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) {
    return 1
  }
  return Math.max(1, Math.ceil(words.length / 200))
}

const ensureSlugUnique = async (
  ctx: any,
  {
    id,
    slug,
    locale,
  }: {
    id?: string
    slug: string
    locale: string
  }
) => {
  const existing = await ctx.db.query.blogPosts.findFirst({
    where: and(eq(blogPosts.slug, slug), eq(blogPosts.locale, locale)),
  })

  if (existing && existing.id !== id) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: '同一语言下的 slug 已存在，请更换',
    })
  }
}

const prepareWritePayload = (
  input: z.infer<typeof blogWriteSchema>,
  authorId: string | null
): NewBlogPost => {
  const tags = parseTags(input.tags)
  const status = input.status
  const now = new Date()
  const publishedAt =
    status === 'published'
      ? (input.publishedAt ?? now)
      : (input.publishedAt ?? null)

  return {
    title: input.title,
    slug: input.slug,
    summary: input.summary ?? null,
    content: input.content,
    coverImageUrl: input.coverImageUrl || null,
    tags,
    isFeatured: input.isFeatured,
    status: status as 'draft' | 'scheduled' | 'published' | 'archived',
    locale: input.locale,
    readingMinutes: computeReadingMinutes(input.content),
    publishedAt,
    authorId: authorId ?? null,
    createdAt: now,
    updatedAt: now,
  }
}

export const blogRouter = createTRPCRouter({
  listPublished: publicProcedure
    .input(
      z
        .object({
          locale: z.string().min(2).max(10).default('zh'),
          search: z.string().optional(),
          tag: z.string().optional(),
          limit: z.number().min(1).max(100).default(20),
          page: z.number().min(1).default(1),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const { locale, search, tag, limit, page } = {
        locale: 'zh',
        limit: 20,
        page: 1,
        ...input,
      }

      const conditions = [
        eq(blogPosts.locale, locale),
        eq(blogPosts.status, 'published'),
      ]

      if (search) {
        conditions.push(ilike(blogPosts.title, `%${search}%`))
      }

      if (tag) {
        conditions.push(sql`${blogPosts.tags} @> ARRAY[${tag}]::text[]`)
      }

      const whereClause = and(...conditions)

      const [totalResult, data] = await Promise.all([
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(blogPosts)
          .where(whereClause),
        ctx.db
          .select(basePostSelect)
          .from(blogPosts)
          .where(whereClause)
          .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.createdAt))
          .limit(limit)
          .offset((page - 1) * limit),
      ])

      const total = Number(totalResult[0]?.count ?? 0)

      return {
        posts: data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    }),

  getPublishedBySlug: publicProcedure
    .input(
      z.object({
        slug: z.string().min(1),
        locale: z.string().min(2).max(10).default('zh'),
      })
    )
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.query.blogPosts.findFirst({
        where: and(
          eq(blogPosts.slug, input.slug),
          eq(blogPosts.locale, input.locale),
          eq(blogPosts.status, 'published')
        ),
      })

      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '文章不存在或未发布',
        })
      }

      return post
    }),

  list: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        status: blogStatusSchema.optional(),
        locale: z.string().min(2).max(10).optional(),
        authorId: z.string().optional(),
        sortBy: z
          .enum(['createdAt', 'updatedAt', 'publishedAt', 'title'])
          .default('createdAt'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = []

      if (input.search) {
        conditions.push(ilike(blogPosts.title, `%${input.search}%`))
      }

      if (input.status) {
        conditions.push(
          eq(
            blogPosts.status,
            input.status as 'draft' | 'scheduled' | 'published' | 'archived'
          )
        )
      }

      if (input.locale) {
        conditions.push(eq(blogPosts.locale, input.locale))
      }

      if (input.authorId) {
        conditions.push(eq(blogPosts.authorId, input.authorId))
      }

      const whereClause = conditions.length ? and(...conditions) : undefined

      const totalResult = await ctx.db
        .select({ total: sql<number>`count(*)` })
        .from(blogPosts)
        .where(whereClause)

      const total = Number(totalResult[0]?.total ?? 0)

      const orderColumn = (blogPosts as any)[input.sortBy]
      const orderDirection =
        input.sortOrder === 'asc' ? asc(orderColumn) : desc(orderColumn)

      const posts = await ctx.db
        .select(basePostSelect)
        .from(blogPosts)
        .where(whereClause)
        .orderBy(orderDirection)
        .limit(input.limit)
        .offset((input.page - 1) * input.limit)

      return {
        posts,
        total,
        page: input.page,
        limit: input.limit,
        totalPages: Math.ceil(total / input.limit),
      }
    }),

  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.query.blogPosts.findFirst({
        where: eq(blogPosts.id, input.id),
      })

      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '文章不存在',
        })
      }

      return post
    }),

  create: adminProcedure
    .input(blogWriteSchema)
    .mutation(async ({ ctx, input }) => {
      await ensureSlugUnique(ctx, {
        slug: input.slug,
        locale: input.locale,
      })

      const payload = prepareWritePayload(input, ctx.userId)

      const [post] = await ctx.db.insert(blogPosts).values(payload).returning()

      if (!post) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '创建文章失败',
        })
      }

      ctx.logger.info('管理员创建博客文章', {
        adminId: ctx.userId,
        postId: post.id,
        slug: post.slug,
      })

      return post
    }),

  update: adminProcedure
    .input(blogWriteSchema.extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.blogPosts.findFirst({
        where: eq(blogPosts.id, input.id),
      })

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '文章不存在',
        })
      }

      await ensureSlugUnique(ctx, {
        id: existing.id,
        slug: input.slug,
        locale: input.locale,
      })

      const tags = parseTags(input.tags)
      const status = input.status
      const publishedAt =
        status === 'published'
          ? (input.publishedAt ?? existing.publishedAt ?? new Date())
          : (input.publishedAt ?? null)

      const [post] = await ctx.db
        .update(blogPosts)
        .set({
          title: input.title,
          slug: input.slug,
          summary: input.summary ?? null,
          content: input.content,
          coverImageUrl: input.coverImageUrl || null,
          tags,
          isFeatured: input.isFeatured,
          status: status as 'draft' | 'scheduled' | 'published' | 'archived',
          locale: input.locale,
          readingMinutes: computeReadingMinutes(input.content),
          publishedAt,
          updatedAt: new Date(),
        })
        .where(eq(blogPosts.id, input.id))
        .returning()

      if (!post) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '更新文章失败',
        })
      }

      ctx.logger.info('管理员更新博客文章', {
        adminId: ctx.userId,
        postId: post.id,
      })

      return post
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.blogPosts.findFirst({
        where: eq(blogPosts.id, input.id),
        columns: { id: true },
      })

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '文章不存在',
        })
      }

      await ctx.db.delete(blogPosts).where(eq(blogPosts.id, input.id))

      ctx.logger.info('管理员删除博客文章', {
        adminId: ctx.userId,
        postId: input.id,
      })

      return { success: true }
    }),
})

export type BlogRouter = typeof blogRouter
