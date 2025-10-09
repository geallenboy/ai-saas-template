import { z } from 'zod'
import { blogPostStatusEnum } from '@/drizzle/schemas'

export const blogStatusSchema = z.enum(
  blogPostStatusEnum.enumValues as [string, ...string[]]
)

export const blogWriteSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-zA-Z0-9-]+$/, {
      message: 'Slug 只能包含字母、数字和连字符',
    }),
  summary: z.string().max(500).optional().nullable(),
  content: z.string().min(1),
  coverImageUrl: z
    .string()
    .url({ message: '请输入合法的封面地址' })
    .optional()
    .or(z.literal(''))
    .nullable(),
  tags: z.array(z.string().min(1)).default([]),
  isFeatured: z.boolean().default(false),
  status: blogStatusSchema.default('draft'),
  locale: z.string().min(2).max(10).default('zh'),
  publishedAt: z.coerce.date().optional().nullable(),
})

export type BlogWriteInput = z.infer<typeof blogWriteSchema>
export type BlogStatus = z.infer<typeof blogStatusSchema>
