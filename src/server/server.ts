import { initTRPC, TRPCError } from '@trpc/server'
import { eq } from 'drizzle-orm'
import type { NextRequest } from 'next/server'
import superjson from 'superjson'
import { ZodError } from 'zod'
import { users } from '@/drizzle/schemas'
import { auth } from '@/lib/auth/better-auth/server'
import { db } from '@/lib/db'

/**
 * 创建tRPC上下文
 * 包含数据库连接、用户信息等
 */
export async function createTRPCContext({ req }: { req: NextRequest }) {
  // 使用Better Auth API直接验证会话
  let user = null
  let userId = null

  try {
    // 从请求中获取会话信息
    const session = await auth.api.getSession({
      headers: req.headers as any,
    })

    if (session?.user) {
      // 从数据库获取完整用户信息（包括角色等扩展字段）
      const dbUser = await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
      })

      user = dbUser
        ? {
            ...session.user,
            ...dbUser,
            // 解析 preferences JSON 字符串
            preferences: dbUser.preferences
              ? typeof dbUser.preferences === 'string'
                ? JSON.parse(dbUser.preferences)
                : dbUser.preferences
              : null,
          }
        : session.user

      userId = session.user.id
    }
  } catch (error) {
    console.error('tRPC context - 获取用户会话失败:', error)
    // 继续执行，user 和 userId 保持 null
  }

  return {
    db,
    userId,
    user,
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
 * 公开过程 - 不需要认证
 */
export const publicProcedure = t.procedure

/**
 * 受保护的过程 - 需要用户认证
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!(ctx.userId && ctx.user)) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: '请先登录',
    })
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
      user: ctx.user,
    },
  })
})

/**
 * 管理员过程 - 需要管理员权限
 */
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!ctx.user?.isAdmin || (ctx.user?.adminLevel ?? 0) < 1) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: '需要管理员权限',
    })
  }

  return next({
    ctx,
  })
})

/**
 * 超级管理员过程 - 需要超级管理员权限
 */
export const superAdminProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    if (!ctx.user?.isAdmin || (ctx.user?.adminLevel ?? 0) < 2) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: '需要超级管理员权限',
      })
    }

    return next({
      ctx,
    })
  }
)

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

/**
 * 带日志的受保护过程
 */
export const loggedProtectedProcedure = protectedProcedure.use(loggerMiddleware)
