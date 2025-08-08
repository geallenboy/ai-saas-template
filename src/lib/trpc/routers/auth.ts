import { users } from '@/drizzle/schemas'
import { clerkClient } from '@clerk/nextjs/server'
import { TRPCError } from '@trpc/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '../server'

export const authRouter = createTRPCRouter({
  /**
   * Get current user information
   */
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.userId),
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
   * Check certification status
   */
  checkAuthStatus: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.userId) {
      return { isAuthenticated: false, user: null }
    }

    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.userId),
    })

    return {
      isAuthenticated: true,
      user,
      isAdmin: Boolean(user?.isAdmin),
    }
  }),

  /**
   * Update user profile
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        fullName: z.string().optional(),
        preferences: z
          .object({
            theme: z.enum(['light', 'dark']).optional(),
            language: z.enum(['en', 'de']).optional(),
            currency: z.enum(['USD', 'EUR']).optional(),
            timezone: z.string().optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updateData: any = {
        updatedAt: new Date(),
      }

      if (input.fullName !== undefined) {
        updateData.fullName = input.fullName
      }

      if (input.preferences) {
        // Get current preferences
        const currentUser = await ctx.db.query.users.findFirst({
          where: eq(users.id, ctx.userId),
        })

        const currentPrefs = currentUser?.preferences || {
          theme: 'light' as const,
          language: 'en' as const,
          currency: 'USD' as const,
          timezone: 'UTC',
        }

        updateData.preferences = {
          ...currentPrefs,
          ...Object.fromEntries(
            Object.entries(input.preferences).filter(
              ([_, value]) => value !== undefined
            )
          ),
        }
      }

      const [updatedUser] = await ctx.db
        .update(users)
        .set(updateData)
        .where(eq(users.id, ctx.userId))
        .returning()

      ctx.logger.info('User profile updated successfully', {
        userId: ctx.userId,
        changes: input,
      })

      return updatedUser
    }),

  /**
   * Sync user data from Clerk
   */
  syncUserFromClerk: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const client = await clerkClient()
      const clerkUser = await client.users.getUser(ctx.userId)

      const userData = {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        fullName:
          `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() ||
          null,
        avatarUrl: clerkUser.imageUrl || null,
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      }

      // Using upsert logic
      const existingUser = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.userId),
      })

      let user
      if (existingUser) {
        const updatedUsers = await ctx.db
          .update(users)
          .set({
            email: userData.email,
            fullName: userData.fullName,
            avatarUrl: userData.avatarUrl,
            lastLoginAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(users.id, ctx.userId))
          .returning()

        user = updatedUsers[0]
      } else {
        const newUsers = await ctx.db
          .insert(users)
          .values({
            ...userData,
            isActive: true,
            isAdmin: false,
            totalUseCases: 0,
            totalTutorials: 0,
            totalBlogs: 0,
            createdAt: new Date(),
          })
          .returning()
        user = newUsers[0]
      }

      ctx.logger.info(`User synced successfully: ${user?.email}`)
      return user
    } catch (error) {
      ctx.logger.error('Failed to sync user:', error as Error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to sync user',
      })
    }
  }),
})
