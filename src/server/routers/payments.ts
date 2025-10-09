import { TRPCError } from '@trpc/server'
import { and, desc, eq, gt } from 'drizzle-orm'
import { z } from 'zod'
import {
  membershipPlans,
  paymentRecords,
  userMemberships,
  userUsageLimits,
} from '@/drizzle/schemas'
import { env } from '@/env'
import { getServerStripe } from '@/lib/stripe'
import type { Context } from '../server'
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '../server'

/**
 * 更新用户使用限额的辅助函数
 */
async function updateUserUsageLimitsHelper(
  userId: string,
  planId: string,
  ctx: Context
): Promise<void> {
  // 获取计划信息
  const plan = await ctx.db.query.membershipPlans.findFirst({
    where: eq(membershipPlans.id, planId),
  })

  if (!plan) {
    ctx.logger.error(
      '计划不存在，无法更新使用限额',
      new Error(`Plan not found: ${planId}`)
    )
    return
  }

  const now = new Date()
  const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30天后重置

  // 检查是否已存在使用限额记录
  const existingLimits = await ctx.db
    .select()
    .from(userUsageLimits)
    .where(eq(userUsageLimits.userId, userId))
    .limit(1)

  const usageLimitsData = {
    userId,
    monthlyApiCalls: plan.maxApiCalls || 0,
    currentPeriodStart: now,
    currentPeriodEnd: periodEnd,
    updatedAt: now,
  }

  if (existingLimits.length > 0) {
    // 更新现有记录，保留当前使用量
    await ctx.db
      .update(userUsageLimits)
      .set(usageLimitsData)
      .where(eq(userUsageLimits.userId, userId))
  } else {
    // 创建新记录
    await ctx.db.insert(userUsageLimits).values({
      ...usageLimitsData,
      usedUseCases: 0,
      usedTutorials: 0,
      usedBlogs: 0,
      usedApiCalls: 0,
      createdAt: now,
    })
  }

  ctx.logger.info('用户使用限额已更新', { userId })
}

/**
 * 支付路由
 */
export const paymentsRouter = createTRPCRouter({
  /**
   * 获取所有活跃的会员计划
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
        // 确保所有价格字段都是字符串
        priceUSDMonthly: plan.priceUSDMonthly?.toString() || '0',
        priceCNYMonthly: plan.priceCNYMonthly?.toString() || null,
        priceUSDYearly: plan.priceUSDYearly?.toString() || null,
        priceCNYYearly: plan.priceCNYYearly?.toString() || null,
        // 添加Stripe价格ID映射
        stripePriceIdUSDMonthly: plan.stripePriceIdUSDMonthly,
        stripePriceIdUSDYearly: plan.stripePriceIdUSDYearly,
        stripePriceIdCNYMonthly: plan.stripePriceIdCNYMonthly,
        stripePriceIdCNYYearly: plan.stripePriceIdCNYYearly,
        // 确保功能列表是数组
        features: Array.isArray(plan.features) ? plan.features : [],
        featuresZh: Array.isArray(plan.featuresZh) ? plan.featuresZh : [],
      }))
    }),

  /**
   * 根据ID获取会员计划详情
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
          message: '计划不存在',
        })
      }

      return plan
    }),

  /**
   * 获取用户当前会员状态
   */
  getUserMembershipStatus: protectedProcedure
    .input(z.object({ userId: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const targetUserId = input?.userId || ctx.userId

      // 获取用户当前有效的会员记录
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
            gt(userMemberships.endDate, new Date()) // 未过期
          )
        )
        .orderBy(desc(userMemberships.endDate))
        .limit(1)

      const membership = membershipQuery[0] || null

      // 获取使用限额
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

      // 计算剩余天数
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
   * 创建 Stripe 管理门户会话
   */
  createBillingPortalSession: protectedProcedure
    .input(z.object({ returnUrl: z.string().url().optional() }).optional())
    .mutation(async ({ ctx, input }) => {
      const activeMembership = await ctx.db
        .select()
        .from(userMemberships)
        .where(
          and(
            eq(userMemberships.userId, ctx.userId),
            eq(userMemberships.status, 'active')
          )
        )
        .orderBy(desc(userMemberships.endDate))
        .limit(1)

      const membership = activeMembership[0]

      if (!membership?.stripeCustomerId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '未找到可用的 Stripe 订阅信息。',
        })
      }

      const stripe = getServerStripe()

      const defaultReturnUrl = `${
        env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      }/membership`

      const session = await stripe.billingPortal.sessions.create({
        customer: membership.stripeCustomerId,
        return_url: input?.returnUrl || defaultReturnUrl,
      })

      return { url: session.url }
    }),

  /**
   * 获取用户支付历史记录
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

      // 获取总数 - 修复计数查询
      const totalQuery = await ctx.db
        .select()
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
   * 创建Stripe结账会话
   */
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        priceId: z.string(),
        planName: z.string(),
        paymentMethod: z.enum(['card', 'alipay']).default('card'),
        locale: z.enum(['en', 'zh']).default('en'),
        durationType: z.enum(['monthly', 'yearly']).default('monthly'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { priceId, planName, paymentMethod, locale, durationType } = input

      const stripe = getServerStripe()

      // 获取价格信息以确定货币和金额
      const price = await stripe.prices.retrieve(priceId)
      const currency = price.currency.toUpperCase() as 'USD' | 'CNY'
      const amount = price.unit_amount || 0

      // 根据货币创建或获取对应的 Stripe 客户
      const customerSearchQuery = `metadata["userId"]:"${ctx.userId}"`
      const customers = await stripe.customers.search({
        query: customerSearchQuery,
      })

      let customerId: string

      if (customers.data.length > 0 && customers.data[0]) {
        customerId = customers.data[0].id
      } else {
        // 创建新客户
        const customer = await stripe.customers.create({
          metadata: {
            userId: ctx.userId,
            locale: locale || 'en',
          },
        })
        customerId = customer.id
      }

      // 确定支付方式
      let paymentMethods: ('card' | 'alipay')[] = ['card']

      // 支付宝支持的货币配置
      const alipaySupported = ['CNY', 'USD'].includes(currency)

      if (paymentMethod === 'alipay' && alipaySupported) {
        // 用户明确选择支付宝，优先显示支付宝
        paymentMethods = ['alipay', 'card']
      } else {
        // 默认只显示信用卡，但如果货币支持支付宝，也可以添加
        if (alipaySupported) {
          paymentMethods = ['card', 'alipay']
        }
      }

      // 创建一次性付款的checkout session
      const sessionConfig: any = {
        customer: customerId,
        payment_method_types: paymentMethods,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'payment', // 使用payment模式而不是subscription
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/payment/cancelled`,
        metadata: {
          userId: ctx.userId,
          planName: planName,
          currency: currency.toLowerCase(),
          paymentMethod: paymentMethod || 'card',
          membershipDurationDays: durationType === 'yearly' ? '365' : '30',
        },
        // 添加允许促销代码选项
        allow_promotion_codes: true,
        // 添加客户信息收集
        billing_address_collection: 'auto',
        customer_update: {
          address: 'auto',
          name: 'auto',
        },
      }

      // 如果包含支付宝，设置支付宝的特定配置
      if (paymentMethods.includes('alipay')) {
        sessionConfig.payment_method_options = {
          alipay: {
            setup_future_usage: undefined,
          },
        }

        // 设置locale以支持中文支付宝界面
        if (locale === 'zh') {
          sessionConfig.locale = 'zh'
        }
      }

      const session = await stripe.checkout.sessions.create(sessionConfig)

      if (!(session.id && session.url)) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Stripe会话创建失败',
        })
      }

      ctx.logger.info('支付会话创建成功:', {
        sessionId: session.id,
        userId: ctx.userId,
        planName,
        amount: amount / 100,
        currency,
      })

      return {
        sessionId: session.id,
        url: session.url,
        amount: amount / 100, // 转换为实际金额
        currency,
        planName,
      }
    }),

  /**
   * 激活会员（用于webhook处理）
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

      // 检查是否已有会员记录
      const existingMembership = await ctx.db
        .select()
        .from(userMemberships)
        .where(eq(userMemberships.userId, ctx.userId))
        .limit(1)

      if (existingMembership.length > 0) {
        // 更新现有会员记录
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
        // 创建新会员记录
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

      // 更新用户使用限额
      await updateUserUsageLimitsHelper(ctx.userId, planId, ctx)

      ctx.logger.info('会员激活成功:', {
        userId: ctx.userId,
        planId,
        endDate: endDate.toISOString(),
      })

      return { message: '会员激活成功' }
    }),

  /**
   * 更新用户使用限额的辅助函数
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

      // 获取计划信息
      const plan = await ctx.db.query.membershipPlans.findFirst({
        where: eq(membershipPlans.id, planId),
      })

      if (!plan) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '计划不存在，无法更新使用限额',
        })
      }

      const now = new Date()
      const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30天后重置

      // 检查是否已存在使用限额记录
      const existingLimits = await ctx.db
        .select()
        .from(userUsageLimits)
        .where(eq(userUsageLimits.userId, userId))
        .limit(1)

      const usageLimitsData = {
        userId,
        monthlyApiCalls: plan.maxApiCalls || 0,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        updatedAt: now,
      }

      if (existingLimits.length > 0) {
        // 更新现有记录，保留当前使用量
        await ctx.db
          .update(userUsageLimits)
          .set(usageLimitsData)
          .where(eq(userUsageLimits.userId, userId))
      } else {
        // 创建新记录
        await ctx.db.insert(userUsageLimits).values({
          ...usageLimitsData,
          usedUseCases: 0,
          usedTutorials: 0,
          usedBlogs: 0,
          usedApiCalls: 0,
          createdAt: now,
        })
      }

      ctx.logger.info('用户使用限额已更新', { userId })
      return { message: '使用限额更新成功' }
    }),

  /**
   * 获取用户使用统计数据
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

      // 获取用户使用限额记录
      const usageQuery = await ctx.db
        .select()
        .from(userUsageLimits)
        .where(eq(userUsageLimits.userId, targetUserId))
        .limit(1)

      const usage = usageQuery[0]

      if (!usage) {
        // 如果没有使用记录，返回默认值
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
