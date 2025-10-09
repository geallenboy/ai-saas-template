import { TRPCError } from '@trpc/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { users } from '@/drizzle/schemas'
import { auth } from '@/lib/auth/better-auth/server'
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '../server'

/**
 * 认证路由 - 整合 Better-Auth
 */
export const authRouter = createTRPCRouter({
  /**
   * 获取当前用户信息
   * 使用 Better-Auth 的会话验证
   */
  getCurrentUser: publicProcedure.query(async ({ ctx }) => {
    try {
      // 直接使用 Better-Auth API 获取会话，传入正确的headers
      const session = await auth.api.getSession({
        headers: ctx.headers,
      })

      if (!session?.user) {
        return null
      }

      const user = session.user

      // 从数据库获取完整的用户信息
      const dbUser = await ctx.db.query.users.findFirst({
        where: eq(users.id, user.id),
      })

      if (!dbUser) {
        // 如果数据库中没有用户记录，创建一个
        const [newUser] = await ctx.db
          .insert(users)
          .values({
            id: user.id,
            email: user.email,
            emailVerified: user.emailVerified,
            name: user.name || null,
            image: user.image || null,
            fullName: user.name || null,
            isAdmin: false,
            adminLevel: 0,
            isActive: true,
            locale: 'zh',
            preferences: {
              theme: 'light',
              language: 'zh',
              currency: 'CNY',
              timezone: 'Asia/Shanghai',
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning()

        return newUser
      }

      return dbUser
    } catch (error) {
      console.error('获取当前用户失败:', error)
      return null
    }
  }),

  /**
   * 检查认证状态
   */
  checkAuthStatus: publicProcedure.query(async ({ ctx }) => {
    try {
      // 直接使用 Better-Auth API 获取会话
      const session = await auth.api.getSession({
        headers: ctx.headers,
      })

      const user = session?.user

      return {
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin,
        userId: user?.id || null,
        email: user?.email || null,
      }
    } catch (error) {
      console.error('检查认证状态失败:', error)
      return {
        isAuthenticated: false,
        isAdmin: false,
        userId: null,
        email: null,
      }
    }
  }),

  /**
   * 更新用户资料
   * 需要认证
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        fullName: z.string().optional(),
        locale: z.string().optional(),
        preferences: z
          .object({
            theme: z.enum(['light', 'dark']).optional(),
            language: z.enum(['en', 'zh']).optional(),
            currency: z.enum(['USD', 'CNY']).optional(),
            timezone: z.string().optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: '请先登录',
        })
      }

      const updateData: any = {
        ...input,
        updatedAt: new Date(),
      }

      // 确保preferences字段有所有必需的属性
      if (input.preferences) {
        updateData.preferences = {
          theme: input.preferences.theme || 'light',
          language: input.preferences.language || 'zh',
          currency: input.preferences.currency || 'CNY',
          timezone: input.preferences.timezone || 'Asia/Shanghai',
        }
      }

      const [updatedUser] = await ctx.db
        .update(users)
        .set(updateData)
        .where(eq(users.id, ctx.userId))
        .returning()

      if (!updatedUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '用户不存在',
        })
      }

      ctx.logger.info(`用户更新资料: ${updatedUser.email}`, {
        userId: ctx.userId,
        changes: input,
      })

      return updatedUser
    }),

  /**
   * 获取用户会话信息
   */
  getSession: publicProcedure.query(async ({ ctx }) => {
    try {
      // 使用 Better-Auth API 获取会话
      const session = await auth.api.getSession({
        headers: ctx.headers,
      })

      return session
    } catch (error) {
      console.error('获取会话失败:', error)
      return null
    }
  }),

  /**
   * 刷新用户会话
   */
  refreshSession: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      // Better-Auth 会自动处理会话刷新
      const session = await auth.api.getSession({
        headers: ctx.headers,
      })

      if (!session) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: '会话已过期',
        })
      }

      return session
    } catch (error) {
      console.error('刷新会话失败:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: '刷新会话失败',
      })
    }
  }),

  /**
   * 更新最后登录时间
   */
  updateLastLogin: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: '请先登录',
      })
    }

    await ctx.db
      .update(users)
      .set({
        updatedAt: new Date(),
      })
      .where(eq(users.id, ctx.userId))

    return { success: true }
  }),

  /**
   * 获取用户权限信息
   */
  getUserPermissions: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: '请先登录',
      })
    }

    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.userId),
    })

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: '用户不存在',
      })
    }

    return {
      isAdmin: user.isAdmin,
      adminLevel: user.adminLevel,
      permissions: user.isAdmin ? ['*'] : [], // 管理员拥有所有权限
    }
  }),

  /**
   * 获取用户会话列表
   */
  getUserSessions: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: '请先登录',
      })
    }

    try {
      // Better-Auth 会话管理 - 这里返回模拟数据，实际应该从 Better-Auth 获取
      return [
        {
          id: 1,
          sessionToken: 'current-session',
          deviceName: 'Current Device',
          location: 'Unknown',
          ipAddress: '127.0.0.1',
          userAgent: 'Browser',
          createdAt: new Date(),
          lastActiveAt: new Date(),
        },
      ]
    } catch (error) {
      console.error('获取用户会话失败:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: '获取用户会话失败',
      })
    }
  }),

  /**
   * 终止指定会话
   */
  terminateSession: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: '请先登录',
        })
      }

      try {
        // Better-Auth 会话终止逻辑
        // 这里应该调用 Better-Auth 的会话终止 API
        console.log('终止会话:', input.sessionId)

        return { success: true }
      } catch (error) {
        console.error('终止会话失败:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '终止会话失败',
        })
      }
    }),

  /**
   * 终止其他所有会话
   */
  terminateOtherSessions: protectedProcedure
    .input(z.object({ currentSessionToken: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: '请先登录',
        })
      }

      try {
        // Better-Auth 批量会话终止逻辑
        console.log('终止其他会话，保留:', input.currentSessionToken)

        return { success: true }
      } catch (error) {
        console.error('终止其他会话失败:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '终止其他会话失败',
        })
      }
    }),
})
