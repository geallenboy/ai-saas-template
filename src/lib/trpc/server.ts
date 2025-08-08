import { db } from '@/lib/db'
import { logger } from '@/lib/logger'
import { auth } from '@clerk/nextjs/server'
import { TRPCError, initTRPC } from '@trpc/server'
import superjson from 'superjson'
import { ZodError } from 'zod'

/**
 * tRPC context creation function
 * Contains authentication user information and database connection
 */
export async function createTRPCContext() {
  const { userId } = await auth()

  return {
    db,
    userId,
    logger,
  }
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>

/**
 * Initialize tRPC instance
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
 * Export tRPC router and procedure creators
 */
export const createTRPCRouter = t.router
export const publicProcedure = t.procedure

/**
 * Authentication middleware
 * Ensures the user is logged in
 */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
    },
  })
})

/**
 * Admin middleware
 * Ensure the user is an administrator
 */
const enforceUserIsAdmin = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  // Check if the user is an administrator
  const user = await ctx.db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, ctx.userId!),
  })

  if (!user?.isAdmin) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Requires administrator rights',
    })
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
      user,
    },
  })
})

/**
 * Protected procedure (requires authentication)
 */
export const protectedProcedure = publicProcedure.use(enforceUserIsAuthed)

/**
 * Admin procedure (requires administrator rights)
 */
export const adminProcedure = publicProcedure.use(enforceUserIsAdmin)
