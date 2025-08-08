import { users } from '@/drizzle/schemas'
import { TRPCError } from '@trpc/server'
import { and, asc, count, desc, eq, ilike, sql } from 'drizzle-orm'
import { z } from 'zod'
import { adminProcedure, createTRPCRouter } from '../server'

export const usersRouter = createTRPCRouter({
  /**
   * Get user list (paging, searching, sorting)
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
    .query(async ({ ctx, input }) => {
      const { page, limit, search, sortBy, sortOrder, isActive, isAdmin } =
        input

      // Build query conditions
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

      // Get total count
      const totalResult = await ctx.db
        .select({ total: count() })
        .from(users)
        .where(whereClause)

      const total = totalResult[0]?.total || 0

      // Get user list
      const orderColumn = users[sortBy]
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
   * Get user details by ID
   */
  getUserById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.id),
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User does not exist',
        })
      }

      return user
    }),

  /**
   * Get user statistics
   */
  getUserStats: adminProcedure.query(async ({ ctx }) => {
    const [stats] = await ctx.db
      .select({
        totalUsers: sql<number>`count(*)`,
        activeUsers: sql<number>`count(*) filter (where is_active = true)`,
        adminUsers: sql<number>`count(*) filter (where is_admin = true)`,
        newUsersThisMonth: sql<number>`count(*) filter (where created_at >= date_trunc('month', current_date))`,
      })
      .from(users)

    return stats
  }),

  /**
   * Update user information
   */
  updateUser: adminProcedure
    .input(
      z.object({
        id: z.string(),
        fullName: z.string().optional(),
        isAdmin: z.boolean().optional(),
        isActive: z.boolean().optional(),
        adminLevel: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      const [updatedUser] = await ctx.db
        .update(users)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning()

      if (!updatedUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User does not exist',
        })
      }

      ctx.logger.info(`Admin updated user: ${updatedUser.email}`, {
        adminId: ctx.userId,
        targetUserId: id,
        changes: updateData,
      })

      return updatedUser
    }),

  /**
   * Toggle user status
   */
  toggleUserStatus: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.id),
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User does not exist',
        })
      }

      const [updatedUser] = await ctx.db
        .update(users)
        .set({
          isActive: !user.isActive,
          updatedAt: new Date(),
        })
        .where(eq(users.id, input.id))
        .returning()

      ctx.logger.info(
        `Admin toggled user status: ${updatedUser?.email} -> ${updatedUser?.isActive ? 'Activated' : 'Deactivated'}`,
        {
          adminId: ctx.userId,
          targetUserId: input.id,
        }
      )

      return updatedUser
    }),

  /**
   * Delete user
   */
  deleteUser: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.id),
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User does not exist',
        })
      }

      // Check if the user is a super admin to prevent accidental deletion
      if (user.adminLevel === 2) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot delete super admin account',
        })
      }

      await ctx.db.delete(users).where(eq(users.id, input.id))

      ctx.logger.info(`Admin deleted user: ${user.email}`, {
        adminId: ctx.userId,
        targetUserId: input.id,
      })

      return { message: 'User deleted successfully' }
    }),

  /**
   * Batch update users
   */
  bulkUpdateUsers: adminProcedure
    .input(
      z.object({
        userIds: z.array(z.string()),
        isActive: z.boolean().optional(),
        isAdmin: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userIds, ...updateData } = input

      await ctx.db
        .update(users)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(sql`id = ANY(${userIds})`)

      ctx.logger.info(`Admin bulk updated users: ${userIds.length} users`, {
        adminId: ctx.userId,
        userIds,
        changes: updateData,
      })

      return { message: `Successfully updated ${userIds.length} users` }
    }),

  /**
   * Create new user
   */
  createUser: adminProcedure
    .input(
      z.object({
        email: z.string().email(),
        fullName: z.string().min(1),
        isAdmin: z.boolean().default(false),
        adminLevel: z.number().default(0),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if email already exists
      const existingUser = await ctx.db.query.users.findFirst({
        where: eq(users.email, input.email),
      })

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Email already exists',
        })
      }

      // Generate temporary user ID (may need to integrate with Clerk in actual application)
      const tempUserId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const [newUser] = await ctx.db
        .insert(users)
        .values({
          id: tempUserId,
          email: input.email,
          fullName: input.fullName,
          isAdmin: input.isAdmin,
          adminLevel: input.adminLevel,
          isActive: input.isActive,
          avatarUrl: null,
          totalUseCases: 0,
          totalTutorials: 0,
          totalBlogs: 0,
          preferences: {
            theme: 'light',
            language: 'de',
            currency: 'EUR',
            timezone: 'Europe/Berlin',
          },
          country: null,
          locale: 'de',
          lastLoginAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()

      if (!newUser) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create user',
        })
      }

      ctx.logger.info(`Admin created user: ${newUser.email}`, {
        adminId: ctx.userId,
        newUserId: newUser.id,
        userEmail: input.email,
      })

      return newUser
    }),
})
