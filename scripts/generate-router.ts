#!/usr/bin/env tsx
/**
 * tRPC Router 脚手架工具
 *
 * 自动生成标准 tRPC router 模板文件，包含基本 CRUD 操作。
 *
 * 用法:
 *   npx tsx scripts/generate-router.ts <router-name>
 *
 * 示例:
 *   npx tsx scripts/generate-router.ts products
 *   npx tsx scripts/generate-router.ts user-settings
 *
 * 生成文件:
 *   - src/server/routers/<name>.ts        (Router 文件)
 *   - src/server/routers/__tests__/<name>.test.ts (测试文件)
 */

import * as fs from 'node:fs'
import * as path from 'node:path'

// ─── Helpers ────────────────────────────────────────────────

function toPascalCase(str: string): string {
    return str
        .split(/[-_]/)
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join('')
}

function toCamelCase(str: string): string {
    const pascal = toPascalCase(str)
    return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

// ─── Templates ──────────────────────────────────────────────

function routerTemplate(name: string): string {
    const camel = toCamelCase(name)
    const pascal = toPascalCase(name)

    return `import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
} from '../server'

// ─── Input Schemas ──────────────────────────────────────────

const create${pascal}Schema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
})

const update${pascal}Schema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
})

const get${pascal}ByIdSchema = z.object({
  id: z.string().uuid(),
})

const list${pascal}Schema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  search: z.string().optional(),
}).optional()

// ─── Router ─────────────────────────────────────────────────

export const ${camel}Router = createTRPCRouter({
  /**
   * 获取列表（分页）
   */
  list: protectedProcedure
    .input(list${pascal}Schema)
    .query(async ({ ctx, input }) => {
      const { page = 1, limit = 20 } = input ?? {}
      const offset = (page - 1) * limit

      // TODO: Replace with actual table query
      // const items = await ctx.db
      //   .select()
      //   .from(${camel}Table)
      //   .limit(limit)
      //   .offset(offset)
      //   .orderBy(desc(${camel}Table.createdAt))

      return {
        items: [],
        pagination: { page, limit, total: 0 },
      }
    }),

  /**
   * 根据 ID 获取详情
   */
  getById: protectedProcedure
    .input(get${pascal}ByIdSchema)
    .query(async ({ ctx, input }) => {
      // TODO: Replace with actual table query
      // const item = await ctx.db.query.${camel}Table.findFirst({
      //   where: eq(${camel}Table.id, input.id),
      // })

      // if (!item) {
      //   throw new TRPCError({ code: 'NOT_FOUND', message: '${pascal} not found' })
      // }

      // return item
      throw new TRPCError({ code: 'NOT_FOUND', message: '${pascal} not found' })
    }),

  /**
   * 创建
   */
  create: protectedProcedure
    .input(create${pascal}Schema)
    .mutation(async ({ ctx, input }) => {
      // TODO: Replace with actual table insert
      // const [item] = await ctx.db
      //   .insert(${camel}Table)
      //   .values({
      //     ...input,
      //     createdBy: ctx.userId,
      //   })
      //   .returning()

      // return item
      return { id: 'placeholder', ...input }
    }),

  /**
   * 更新
   */
  update: protectedProcedure
    .input(update${pascal}Schema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      // TODO: Replace with actual table update
      // const [updated] = await ctx.db
      //   .update(${camel}Table)
      //   .set({ ...data, updatedAt: new Date() })
      //   .where(eq(${camel}Table.id, id))
      //   .returning()

      // if (!updated) {
      //   throw new TRPCError({ code: 'NOT_FOUND', message: '${pascal} not found' })
      // }

      // return updated
      return { id, ...data }
    }),

  /**
   * 删除
   */
  delete: adminProcedure
    .input(get${pascal}ByIdSchema)
    .mutation(async ({ ctx, input }) => {
      // TODO: Replace with actual table delete
      // const [deleted] = await ctx.db
      //   .delete(${camel}Table)
      //   .where(eq(${camel}Table.id, input.id))
      //   .returning()

      // if (!deleted) {
      //   throw new TRPCError({ code: 'NOT_FOUND', message: '${pascal} not found' })
      // }

      return { success: true }
    }),
})
`
}

function testTemplate(name: string): string {
    const camel = toCamelCase(name)
    const pascal = toPascalCase(name)

    return `import { describe, expect, it } from 'vitest'

describe('${camel}Router', () => {
  describe('list', () => {
    it.todo('returns paginated results')
    it.todo('supports search filtering')
  })

  describe('getById', () => {
    it.todo('returns item when found')
    it.todo('throws NOT_FOUND when item does not exist')
  })

  describe('create', () => {
    it.todo('creates a new ${name} with valid input')
    it.todo('rejects invalid input')
  })

  describe('update', () => {
    it.todo('updates an existing ${name}')
    it.todo('throws NOT_FOUND when ${name} does not exist')
  })

  describe('delete', () => {
    it.todo('deletes an existing ${name}')
    it.todo('requires admin permissions')
  })
})
`
}

// ─── Main ───────────────────────────────────────────────────

function main() {
    const args = process.argv.slice(2)

    if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
        console.log(`
tRPC Router 脚手架工具

用法:
  npx tsx scripts/generate-router.ts <router-name>

示例:
  npx tsx scripts/generate-router.ts products
  npx tsx scripts/generate-router.ts user-settings

生成文件:
  - src/server/routers/<name>.ts
  - src/server/routers/__tests__/<name>.test.ts
`)
        process.exit(0)
    }

    const rawName = args[0]
    if (!rawName) {
        console.error('❌ Please provide a router name.')
        process.exit(1)
    }
    const name = rawName.toLowerCase().replace(/[^a-z0-9-]/g, '-')
    const routersDir = path.resolve('src/server/routers')
    const testsDir = path.resolve('src/server/routers/__tests__')

    // Ensure directories exist
    if (!fs.existsSync(testsDir)) {
        fs.mkdirSync(testsDir, { recursive: true })
    }

    const routerPath = path.join(routersDir, `${name}.ts`)
    const testPath = path.join(testsDir, `${name}.test.ts`)

    // Check for existing files
    if (fs.existsSync(routerPath)) {
        console.error(`❌ Router file already exists: ${routerPath}`)
        process.exit(1)
    }

    // Write files
    fs.writeFileSync(routerPath, routerTemplate(name), 'utf-8')
    console.log(`✅ Created router: ${routerPath}`)

    fs.writeFileSync(testPath, testTemplate(name), 'utf-8')
    console.log(`✅ Created test:   ${testPath}`)

    const camel = toCamelCase(name)
    console.log(`
📋 Next steps:
  1. Create a Drizzle schema in src/drizzle/schemas/${name}.ts
  2. Register the router in src/server/root.ts:
     import { ${camel}Router } from './routers/${name}'
     // Add to createTRPCRouter: ${camel}: ${camel}Router
  3. Run pnpm db:generate to create migration files
  4. Implement the TODO placeholders in the generated router
`)
}

main()
