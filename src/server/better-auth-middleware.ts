import { initTRPC, TRPCError } from '@trpc/server'
import {
  getCurrentUser,
  isAdmin,
  isSuperAdmin,
} from '@/lib/auth/better-auth/permissions'
import type { Context } from './server'

const t = initTRPC.context<Context>().create()

// ===============================
// 基础认证中间件
// ===============================

/**
 * 确保用户已认证
 */
export const enforceUserIsAuthed = t.middleware(
  async ({ next }: { next: any }) => {
    const user = await getCurrentUser()

    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: '请先登录',
      })
    }

    return next({
      ctx: {
        user,
      },
    })
  }
)

// ===============================
// 角色检查中间件
// ===============================

/**
 * 确保用户是管理员
 */
export const enforceUserIsAdmin = t.middleware(
  async ({ next }: { next: any }) => {
    const user = await getCurrentUser()

    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: '请先登录',
      })
    }

    const hasAdminAccess = await isAdmin()
    if (!hasAdminAccess) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: '需要管理员权限',
      })
    }

    return next({
      ctx: {
        user,
      },
    })
  }
)

/**
 * 确保用户是超级管理员
 */
export const enforceUserIsSuperAdmin = t.middleware(
  async ({ next }: { next: any }) => {
    const user = await getCurrentUser()

    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: '请先登录',
      })
    }

    const hasSuperAdminAccess = await isSuperAdmin()
    if (!hasSuperAdminAccess) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: '需要超级管理员权限',
      })
    }

    return next({
      ctx: {
        user,
      },
    })
  }
)

// ===============================
// 便捷的 Procedure 创建器
// ===============================

/**
 * 需要认证的 Procedure
 */
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed)

/**
 * 需要管理员权限的 Procedure
 */
export const adminProcedure = t.procedure.use(enforceUserIsAdmin)

/**
 * 需要超级管理员权限的 Procedure
 */
export const superAdminProcedure = t.procedure.use(enforceUserIsSuperAdmin)
