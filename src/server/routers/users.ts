import { TRPCError } from '@trpc/server'
import { and, asc, count, desc, eq, ilike } from 'drizzle-orm'
import { z } from 'zod'
import { users } from '@/drizzle/schemas'
import { AdminLevel } from '@/lib/auth/better-auth/roles'
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  superAdminProcedure,
} from '../server'

/**
 * 简化的用户路由
 */
export const usersRouter = createTRPCRouter({
  /**
   * 获取用户列表
   * 需要管理员权限
   */
  getUsers: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        sortBy: z
          .enum(['createdAt', 'email', 'fullName', 'lastLoginAt'])
          .default('createdAt'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
        isActive: z.boolean().optional(),
        isAdmin: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }: { ctx: any; input: any }) => {
      const { page, limit, search, sortBy, sortOrder, isActive, isAdmin } =
        input

      // 构建查询条件
      const conditions = []

      if (search) {
        conditions.push(
          ilike(users.email, `%${search}%`),
          ilike(users.fullName, `%${search}%`)
        )
      }

      if (isActive !== undefined) {
        conditions.push(eq(users.isActive, isActive))
      }

      if (isAdmin !== undefined) {
        conditions.push(eq(users.isAdmin, isAdmin))
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined

      // 获取总数
      const totalResult = await ctx.db
        .select({ total: count() })
        .from(users)
        .where(whereClause)

      const total = totalResult[0]?.total || 0

      // 获取用户列表
      const orderColumn = (users as any)[sortBy]
      const orderDirection =
        sortOrder === 'asc' ? asc(orderColumn) : desc(orderColumn)

      const userList = await ctx.db
        .select()
        .from(users)
        .where(whereClause)
        .orderBy(orderDirection)
        .limit(limit)
        .offset((page - 1) * limit)

      return {
        users: userList,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    }),

  /**
   * 根据ID获取用户详情
   * 需要管理员权限
   */
  getUserById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }: { ctx: any; input: any }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.id),
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '用户不存在',
        })
      }

      return user
    }),

  /**
   * 更新用户信息
   * 需要管理员权限
   */
  updateUser: adminProcedure
    .input(
      z.object({
        id: z.string(),
        fullName: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }: { ctx: any; input: any }) => {
      const { id, ...updateData } = input

      // 检查用户是否存在
      const existingUser = await ctx.db.query.users.findFirst({
        where: eq(users.id, id),
      })

      if (!existingUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '用户不存在',
        })
      }

      // 更新用户信息
      const [updatedUser] = await ctx.db
        .update(users)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning()

      return updatedUser
    }),

  /**
   * 提升用户权限
   * 需要超级管理员权限
   */
  promoteUser: superAdminProcedure
    .input(
      z.object({
        userId: z.string(),
        adminLevel: z.number().min(0).max(2),
      })
    )
    .mutation(async ({ ctx, input }: { ctx: any; input: any }) => {
      const { userId, adminLevel } = input

      // 检查用户是否存在
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, userId),
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '用户不存在',
        })
      }

      // 防止降级自己
      if (userId === ctx.user.id && adminLevel < (user.adminLevel ?? 0)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '不能降级自己的权限',
        })
      }

      // 更新用户权限
      const [updatedUser] = await ctx.db
        .update(users)
        .set({
          adminLevel,
          isAdmin: adminLevel >= AdminLevel.ADMIN,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning()

      return updatedUser
    }),

  /**
   * 更新用户角色
   * 需要超级管理员权限
   */
  updateUserRole: superAdminProcedure
    .input(
      z.object({
        userId: z.string(),
        adminLevel: z.number().min(0).max(2),
        isAdmin: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }: { ctx: any; input: any }) => {
      const { userId, adminLevel, isAdmin } = input

      // 检查用户是否存在
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, userId),
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '用户不存在',
        })
      }

      // 防止修改自己的权限
      if (userId === ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '不能修改自己的权限',
        })
      }

      // 更新用户权限
      const [updatedUser] = await ctx.db
        .update(users)
        .set({
          adminLevel,
          isAdmin,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning()

      return updatedUser
    }),

  /**
   * 激活/禁用用户
   * 需要管理员权限
   */
  toggleUserStatus: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }: { ctx: any; input: any }) => {
      const { userId, isActive } = input

      // 检查用户是否存在
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, userId),
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '用户不存在',
        })
      }

      // 防止禁用自己
      if (userId === ctx.user.id && !isActive) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '不能禁用自己的账户',
        })
      }

      // 防止管理员禁用超级管理员
      if (
        !isActive &&
        user.isAdmin &&
        (user.adminLevel ?? 0) >= 2 &&
        (ctx.user.adminLevel ?? 0) < 2
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '管理员不能禁用超级管理员',
        })
      }

      // 更新用户状态
      const [updatedUser] = await ctx.db
        .update(users)
        .set({
          isActive,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning()

      return updatedUser
    }),

  /**
   * 获取当前用户信息
   * 需要认证
   */
  getCurrentUser: protectedProcedure.query(async ({ ctx }: { ctx: any }) => {
    return ctx.user
  }),

  /**
   * 更新当前用户资料
   * 需要认证
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        fullName: z.string().optional(),
        locale: z.string().optional(),
        preferences: z.string().optional(), // JSON 字符串
      })
    )
    .mutation(async ({ ctx, input }: { ctx: any; input: any }) => {
      const [updatedUser] = await ctx.db
        .update(users)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.user.id))
        .returning()

      return updatedUser
    }),

  /**
   * 获取用户统计信息
   * 需要管理员权限
   */
  getUserStats: adminProcedure.query(async ({ ctx }: { ctx: any }) => {
    const totalUsers = await ctx.db.select({ count: count() }).from(users)

    const activeUsers = await ctx.db
      .select({ count: count() })
      .from(users)
      .where(eq(users.isActive, true))

    const adminUsers = await ctx.db
      .select({ count: count() })
      .from(users)
      .where(eq(users.isAdmin, true))

    return {
      total: totalUsers[0]?.count || 0,
      active: activeUsers[0]?.count || 0,
      admins: adminUsers[0]?.count || 0,
      inactive: (totalUsers[0]?.count || 0) - (activeUsers[0]?.count || 0),
    }
  }),

  /**
   * 创建新用户
   * 需要管理员权限
   */
  createUser: adminProcedure
    .input(
      z.object({
        email: z.string().email(),
        fullName: z.string().min(1),
        password: z.string().min(6),
        isAdmin: z.boolean().default(false),
        adminLevel: z.number().min(0).max(2).default(0),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }: { ctx: any; input: any }) => {
      // 检查邮箱是否已存在
      const existingUser = await ctx.db.query.users.findFirst({
        where: eq(users.email, input.email),
      })

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: '邮箱已存在',
        })
      }

      // 创建用户
      const [newUser] = await ctx.db
        .insert(users)
        .values({
          id: crypto.randomUUID(),
          email: input.email,
          emailVerified: false,
          name: input.fullName,
          fullName: input.fullName,
          isAdmin: input.isAdmin,
          adminLevel: input.adminLevel,
          isActive: input.isActive,
          banned: false,
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
    }),

  /**
   * 删除用户
   * 需要超级管理员权限
   */
  deleteUser: superAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }: { ctx: any; input: any }) => {
      // 检查用户是否存在
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.id),
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '用户不存在',
        })
      }

      // 防止删除自己
      if (input.id === ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '不能删除自己的账户',
        })
      }

      // 删除用户
      await ctx.db.delete(users).where(eq(users.id, input.id))

      return { success: true }
    }),

  /**
   * 批量更新用户
   * 需要管理员权限
   */
  bulkUpdateUsers: adminProcedure
    .input(
      z.object({
        userIds: z.array(z.string()),
        updates: z.object({
          isActive: z.boolean().optional(),
          isAdmin: z.boolean().optional(),
          adminLevel: z.number().min(0).max(2).optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }: { ctx: any; input: any }) => {
      const { userIds, updates } = input

      // 防止修改自己的权限
      if (userIds.includes(ctx.user.id)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '不能批量修改自己的权限',
        })
      }

      // 批量更新用户
      const updatedUsers = []
      for (const userId of userIds) {
        const [updatedUser] = await ctx.db
          .update(users)
          .set({
            ...updates,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId))
          .returning()

        if (updatedUser) {
          updatedUsers.push(updatedUser)
        }
      }

      return updatedUsers
    }),
})
