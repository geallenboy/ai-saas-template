import { initTRPC } from '@trpc/server'
import type { NextRequest } from 'next/server'
import superjson from 'superjson'
import { ZodError } from 'zod'
import { db } from '@/lib/db'

/**
 * 创建tRPC上下文
 * 包含数据库连接等
 */
export async function createTRPCContext({ req }: { req: NextRequest }) {
  return {
    db,
    headers: req.headers,
    logger: console, // 可以替换为更完善的日志系统
  }
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>

/**
 * 初始化tRPC
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

/**
 * 创建tRPC路由器
 */
export const createTRPCRouter = t.router

/**
 * 公开过程 - 所有请求都可访问
 */
export const publicProcedure = t.procedure

/**
 * 中间件：日志记录
 */
export const loggerMiddleware = t.middleware(async ({ path, type, next }) => {
  const start = Date.now()
  const result = await next()
  const durationMs = Date.now() - start

  if (result.ok) {
    console.log(`✅ ${type} ${path} - ${durationMs}ms`)
  } else {
    console.error(`❌ ${type} ${path} - ${durationMs}ms`, result.error)
  }

  return result
})

/**
 * 带日志的公开过程
 */
export const loggedPublicProcedure = publicProcedure.use(loggerMiddleware)
