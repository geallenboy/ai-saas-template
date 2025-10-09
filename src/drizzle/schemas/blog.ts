import { sql } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core'
import { users } from './users'

export const blogPostStatusEnum = pgEnum('blog_post_status', [
  'draft',
  'scheduled',
  'published',
  'archived',
])

export const blogPosts = pgTable(
  'blog_posts',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()`),
    title: varchar('title', { length: 200 }).notNull(), // 博客标题
    slug: varchar('slug', { length: 200 }).notNull(), // 用于 SEO 优化的 URL 片段
    summary: text('summary'), // 博客摘要
    content: text('content').notNull(), // 博客内容，支持 Markdown 格式
    coverImageUrl: text('cover_image_url'), // 博客封面图片 URL
    // 使用 text[] 存储标签，便于简单筛选
    tags: text('tags').array().notNull().default(sql`ARRAY[]::text[]`), // 博客标签
    isFeatured: boolean('is_featured').notNull().default(false), // 是否推荐
    status: blogPostStatusEnum('status').notNull().default('draft'), // 博客状态
    locale: varchar('locale', { length: 10 }).notNull().default('zh'), // 语言和地区，如 'en', 'zh-CN'
    readingMinutes: integer('reading_minutes'), // 预估阅读时间，单位：分钟
    publishedAt: timestamp('published_at', {
      withTimezone: true,
    }),
    authorId: text('author_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  table => ({
    slugLocaleIdx: uniqueIndex('blog_posts_slug_locale_idx').on(
      table.locale,
      table.slug
    ),
    publishedAtIdx: index('blog_posts_published_at_idx').on(table.publishedAt),
    statusIdx: index('blog_posts_status_idx').on(table.status),
  })
)

export type BlogPost = typeof blogPosts.$inferSelect
export type NewBlogPost = typeof blogPosts.$inferInsert
