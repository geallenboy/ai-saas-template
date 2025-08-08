import {
  membershipPlans,
  paymentRecords,
  userMemberships,
  userUsageLimits,
} from '@/drizzle/schemas'
import { getServerStripe } from '@/lib/stripe'
import { TRPCError } from '@trpc/server'
import { and, desc, eq, gt } from 'drizzle-orm'
import { z } from 'zod'
import type { Context } from '../server'
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '../server'

/**
 * Auxiliary function for updating user usage limits
 */
async function updateUserUsageLimitsHelper(
  userId: string,
  planId: string,
  ctx: Context
): Promise<void> {
  // Get program information
  const plan = await ctx.db.query.membershipPlans.findFirst({
    where: eq(membershipPlans.id, planId),
  })

  if (!plan) {
    ctx.logger.error(
      'The plan does not exist and the usage limit cannot be updated.',
      new Error(`Plan not found: ${planId}`)
    )
    return
  }

  const now = new Date()
  const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days later reset

  // Check if there are existing usage limit records
  const existingLimits = await ctx.db
    .select()
    .from(userUsageLimits)
    .where(eq(userUsageLimits.userId, userId))
    .limit(1)

  const usageLimitsData = {
    userId,
    monthlyUseCases: plan.maxUseCases || 0,
    monthlyTutorials: plan.maxTutorials || 0,
    monthlyBlogs: plan.maxBlogs || 0,
    monthlyApiCalls: plan.maxApiCalls || 0,
    currentPeriodStart: now,
    currentPeriodEnd: periodEnd,
    updatedAt: now,
  }

  if (existingLimits.length > 0) {
    // Update existing records, keeping current usage
    await ctx.db
      .update(userUsageLimits)
      .set(usageLimitsData)
      .where(eq(userUsageLimits.userId, userId))
  } else {
    // Create new records
    await ctx.db.insert(userUsageLimits).values({
      ...usageLimitsData,
      usedUseCases: 0,
      usedTutorials: 0,
      usedBlogs: 0,
      usedApiCalls: 0,
      createdAt: now,
    })
  }

  ctx.logger.info('User quotas updated', { userId })
}

export const paymentsRouter = createTRPCRouter({
  /**
   * Get all active membership plans
   */
  getMembershipPlans: publicProcedure
    .input(
      z
        .object({
          isActive: z.boolean().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const conditions = []
      if (input?.isActive !== false) {
        conditions.push(eq(membershipPlans.isActive, true))
      }

      const plans = await ctx.db
        .select()
        .from(membershipPlans)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(membershipPlans.sortOrder)

      return plans.map((plan: any) => ({
        ...plan,
        // Ensure all price fields are strings
        priceUSDMonthly: plan.priceUSDMonthly?.toString() || '0',
        priceEURMonthly: plan.priceEURMonthly?.toString() || null,
        priceUSDYearly: plan.priceUSDYearly?.toString() || null,
        priceEURYearly: plan.priceEURYearly?.toString() || null,
        // Ensure feature lists are arrays
        features: Array.isArray(plan.features) ? plan.features : [],
        featuresZh: Array.isArray(plan.featuresZh) ? plan.featuresZh : [],
      }))
    }),

  /**
   * Get membership plan details by ID
   */
  getMembershipPlanById: publicProcedure
    .input(z.object({ planId: z.string() }))
    .query(async ({ ctx, input }) => {
      const plan = await ctx.db.query.membershipPlans.findFirst({
        where: eq(membershipPlans.id, input.planId),
      })

      if (!plan) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'The plan does not exist',
        })
      }

      return plan
    }),

  /**
   * Get user membership status
   */
  getUserMembershipStatus: protectedProcedure
    .input(z.object({ userId: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const targetUserId = input?.userId || ctx.userId

      // Get user's current valid membership records
      const membershipQuery = await ctx.db
        .select({
          membership: userMemberships,
          plan: membershipPlans,
        })
        .from(userMemberships)
        .leftJoin(
          membershipPlans,
          eq(userMemberships.planId, membershipPlans.id)
        )
        .where(
          and(
            eq(userMemberships.userId, targetUserId),
            eq(userMemberships.status, 'active'),
            gt(userMemberships.endDate, new Date()) // Not expired
          )
        )
        .orderBy(desc(userMemberships.endDate))
        .limit(1)

      const membership = membershipQuery[0] || null

      // Get user's usage limits
      const usageQuery = await ctx.db
        .select()
        .from(userUsageLimits)
        .where(eq(userUsageLimits.userId, targetUserId))
        .limit(1)

      const usage = usageQuery[0] || null

      const userMembership = membership?.membership || null
      const currentPlan = membership?.plan || null

      const hasActiveMembership = Boolean(
        userMembership?.endDate && new Date() < new Date(userMembership.endDate)
      )

      // Calculate remaining days
      let remainingDays = 0
      let nextExpiryDate: Date | null = null

      if (hasActiveMembership && userMembership?.endDate) {
        const now = new Date()
        const endDate = new Date(userMembership.endDate)
        remainingDays = Math.ceil(
          (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )
        nextExpiryDate = endDate
      }

      return {
        hasActiveMembership,
        currentPlan,
        membership: userMembership,
        usage: usage || null,
        usageLimits: usage || null,
        canUpgrade: hasActiveMembership,
        remainingDays,
        isExpired: !hasActiveMembership,
        nextExpiryDate,
      }
    }),

  /**
   * Get user payment history
   */
  getPaymentHistory: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(5),
          page: z.number().min(1).default(1),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const { limit = 5, page = 1 } = input || {}
      const offset = (page - 1) * limit

      const payments = await ctx.db
        .select()
        .from(paymentRecords)
        .where(eq(paymentRecords.userId, ctx.userId))
        .orderBy(desc(paymentRecords.createdAt))
        .limit(limit)
        .offset(offset)

      // Get total count
      const totalQuery = await ctx.db
        .select({ count: paymentRecords.id })
        .from(paymentRecords)
        .where(eq(paymentRecords.userId, ctx.userId))

      const total = totalQuery.length

      return {
        payments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: offset + payments.length < total,
        },
      }
    }),

  /**
   * Create Stripe checkout session
   */
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        priceId: z.string(),
        planName: z.string(),
        paymentMethod: z.enum(['card', 'alipay']).default('card'),
        locale: z.enum(['en', 'de']).default('en'),
        durationType: z.enum(['monthly', 'yearly']).default('monthly'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { priceId, planName, paymentMethod, locale, durationType } = input

      const stripe = getServerStripe()

      // Get price information to determine currency and amount
      const price = await stripe.prices.retrieve(priceId)
      const currency = price.currency.toUpperCase() as 'USD' | 'EUR'
      const amount = price.unit_amount || 0

      // Create or retrieve the corresponding Stripe customer based on currency
      const customerSearchQuery = `metadata["userId"]:"${ctx.userId}"`
      const customers = await stripe.customers.search({
        query: customerSearchQuery,
      })

      let customerId: string

      if (customers.data.length > 0 && customers.data[0]) {
        customerId = customers.data[0].id
      } else {
        // Create a new customer
        const customer = await stripe.customers.create({
          metadata: {
            userId: ctx.userId,
            locale: locale || 'en',
          },
        })
        customerId = customer.id
      }

      // Determine payment methods
      let paymentMethods: ('card' | 'alipay')[] = ['card']

      // Alipay supported currencies
      const alipaySupported = ['EUR', 'USD'].includes(currency)

      if (paymentMethod === 'alipay' && alipaySupported) {
        // User explicitly chose Alipay, prioritize Alipay
        paymentMethods = ['alipay', 'card']
      } else {
        // Default to showing only credit card, but add Alipay if currency supports it
        if (alipaySupported) {
          paymentMethods = ['card', 'alipay']
        }
      }

      // Create a one-time payment checkout session
      const sessionConfig: any = {
        customer: customerId,
        payment_method_types: paymentMethods,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'payment', // Use payment mode instead of subscription
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/payment/cancelled`,
        metadata: {
          userId: ctx.userId,
          planName: planName,
          currency: currency.toLowerCase(),
          paymentMethod: paymentMethod || 'card',
          membershipDurationDays: durationType === 'yearly' ? '365' : '30',
        },
        // Added Allow Promo Codes option
        allow_promotion_codes: true,
        // Added customer information collection
        billing_address_collection: 'auto',
        customer_update: {
          address: 'auto',
          name: 'auto',
        },
      }

      // If Alipay is included, set Alipay specific configuration
      if (paymentMethods.includes('alipay')) {
        sessionConfig.payment_method_options = {
          alipay: {
            setup_future_usage: undefined,
          },
        }

        // Set locale to support Chinese Alipay interface
        if (locale === 'de') {
          sessionConfig.locale = 'de'
        }
      }

      const session = await stripe.checkout.sessions.create(sessionConfig)

      if (!session.id || !session.url) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Stripe session creation failed',
        })
      }

      ctx.logger.info('Payment session created successfully:', {
        sessionId: session.id,
        userId: ctx.userId,
        planName,
        amount: amount / 100,
        currency,
      })

      return {
        sessionId: session.id,
        url: session.url,
        amount: amount / 100, // Convert to actual amount
        currency,
        planName,
      }
    }),

  /**
   * Activate membership (for webhook processing)
   */
  activateMembership: protectedProcedure
    .input(
      z.object({
        planId: z.string(),
        paymentIntentId: z.string(),
        amount: z.number(),
        currency: z.string(),
        paymentMethod: z.string(),
        durationDays: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const {
        planId,
        paymentIntentId,
        amount,
        currency,
        paymentMethod,
        durationDays = 30,
      } = input

      const now = new Date()
      const endDate = new Date(
        now.getTime() + durationDays * 24 * 60 * 60 * 1000
      )

      // Check if there is already a member record
      const existingMembership = await ctx.db
        .select()
        .from(userMemberships)
        .where(eq(userMemberships.userId, ctx.userId))
        .limit(1)

      if (existingMembership.length > 0) {
        // Update existing member records
        await ctx.db
          .update(userMemberships)
          .set({
            planId,
            startDate: now,
            endDate,
            status: 'active',
            durationType: durationDays === 365 ? 'yearly' : 'monthly',
            durationDays,
            purchaseAmount: amount.toString(),
            currency: currency.toUpperCase(),
            stripePaymentIntentId: paymentIntentId,
            paymentMethod,
            updatedAt: now,
          })
          .where(eq(userMemberships.userId, ctx.userId))
      } else {
        // Create new member record
        await ctx.db.insert(userMemberships).values({
          userId: ctx.userId,
          planId,
          startDate: now,
          endDate,
          status: 'active',
          durationType: durationDays === 365 ? 'yearly' : 'monthly',
          durationDays,
          purchaseAmount: amount.toString(),
          currency: currency.toUpperCase(),
          stripePaymentIntentId: paymentIntentId,
          paymentMethod,
          createdAt: now,
          updatedAt: now,
        })
      }

      // Update user usage limits
      await updateUserUsageLimitsHelper(ctx.userId, planId, ctx)

      ctx.logger.info('Membership activated successfully:', {
        userId: ctx.userId,
        planId,
        endDate: endDate.toISOString(),
      })

      return { message: 'Member activation successful' }
    }),

  /**
   * Auxiliary function for updating user usage limits
   */
  updateUserUsageLimits: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        planId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, planId } = input

      // Get plan information
      const plan = await ctx.db.query.membershipPlans.findFirst({
        where: eq(membershipPlans.id, planId),
      })

      if (!plan) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message:
            'The plan does not exist and the usage limit cannot be updated.',
        })
      }

      const now = new Date()
      const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // Reset after 30 days

      // Check if there is already a usage limit record
      const existingLimits = await ctx.db
        .select()
        .from(userUsageLimits)
        .where(eq(userUsageLimits.userId, userId))
        .limit(1)

      const usageLimitsData = {
        userId,
        monthlyUseCases: plan.maxUseCases || 0,
        monthlyTutorials: plan.maxTutorials || 0,
        monthlyBlogs: plan.maxBlogs || 0,
        monthlyApiCalls: plan.maxApiCalls || 0,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        updatedAt: now,
      }

      if (existingLimits.length > 0) {
        // Update existing records, keeping current usage
        await ctx.db
          .update(userUsageLimits)
          .set(usageLimitsData)
          .where(eq(userUsageLimits.userId, userId))
      } else {
        // Create new usage limit record
        await ctx.db.insert(userUsageLimits).values({
          ...usageLimitsData,
          usedUseCases: 0,
          usedTutorials: 0,
          usedBlogs: 0,
          usedApiCalls: 0,
          createdAt: now,
        })
      }

      ctx.logger.info('User usage limits updated', { userId })
      return { message: 'Usage limits updated successfully' }
    }),

  /**
   * Get user usage statistics
   */
  getUserUsageStats: protectedProcedure
    .input(
      z
        .object({
          userId: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const targetUserId = input?.userId || ctx.userId

      // Get user usage limits record
      const usageQuery = await ctx.db
        .select()
        .from(userUsageLimits)
        .where(eq(userUsageLimits.userId, targetUserId))
        .limit(1)

      const usage = usageQuery[0]

      if (!usage) {
        // If there is no usage record, return default values
        return {
          usedUseCases: 0,
          usedTutorials: 0,
          usedBlogs: 0,
          usedApiCalls: 0,
          monthlyUseCases: 0,
          monthlyTutorials: 0,
          monthlyBlogs: 0,
          monthlyApiCalls: 0,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(),
          resetDate: new Date(),
        }
      }

      return {
        usedUseCases: usage.usedUseCases || 0,
        usedTutorials: usage.usedTutorials || 0,
        usedBlogs: usage.usedBlogs || 0,
        usedApiCalls: usage.usedApiCalls || 0,
        monthlyUseCases: usage.monthlyUseCases || 0,
        monthlyTutorials: usage.monthlyTutorials || 0,
        monthlyBlogs: usage.monthlyBlogs || 0,
        monthlyApiCalls: usage.monthlyApiCalls || 0,
        currentPeriodStart: usage.currentPeriodStart,
        currentPeriodEnd: usage.currentPeriodEnd,
        resetDate: usage.resetDate,
      }
    }),
})
