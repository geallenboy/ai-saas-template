import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { DEFAULT_USAGE_LIMITS } from '@/constants/payment'
import {
  membershipPlans,
  paymentRecords,
  userMemberships,
  userUsageLimits,
} from '@/drizzle/schemas'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'
import { verifyStripeWebhook } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      logger.error('缺少Stripe签名')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // 使用真实的Stripe webhook签名验证
    const event = verifyStripeWebhook(body, signature)
    logger.info(`收到Stripe webhook: ${event.type}`)

    // 处理不同类型的事件
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        )
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        )
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        )
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription)
        break

      case 'invoice.upcoming':
        await handleUpcomingInvoice(event.data.object as Stripe.Invoice)
        break

      default:
        logger.info(`未处理的Stripe事件类型: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    logger.error('处理Stripe webhook失败:', error as Error)
    return NextResponse.json({ error: 'Webhook处理失败' }, { status: 500 })
  }
}

// 处理支付完成
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  try {
    const userId = session.client_reference_id
    const planId = session.metadata?.planId
    const durationType = session.metadata?.durationType || 'monthly'

    if (!(userId && planId)) {
      logger.error(`Checkout session缺少必要信息: ${session.id}`)
      return
    }

    // 获取计划信息
    const plan = await db.query.membershipPlans.findFirst({
      where: eq(membershipPlans.id, planId),
    })

    if (!plan) {
      logger.error(`计划不存在: ${planId}`)
      return
    }

    // 创建支付记录
    await db.insert(paymentRecords).values({
      userId,
      amount: session.amount_total
        ? (session.amount_total / 100).toString()
        : '0',
      currency: session.currency?.toUpperCase() || 'USD',
      status: 'completed',
      paymentMethod: 'stripe',
      stripePaymentIntentId: session.payment_intent as string,
      planName: plan.name,
      durationType: durationType as 'monthly' | 'yearly',
      membershipDurationDays: durationType === 'yearly' ? 365 : 30,
      metadata: {
        sessionId: session.id,
        durationType,
        customerId: session.customer,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // 计算会员期限
    const now = new Date()
    const durationDays = durationType === 'yearly' ? 365 : 30
    const endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000)

    // 创建或更新会员记录
    const existingMembership = await db.query.userMemberships.findFirst({
      where: eq(userMemberships.userId, userId),
    })

    if (existingMembership) {
      // 更新现有会员
      await db
        .update(userMemberships)
        .set({
          planId,
          startDate: now,
          endDate,
          status: 'active',
          durationType,
          durationDays,
          purchaseAmount: session.amount_total
            ? (session.amount_total / 100).toString()
            : '0',
          currency: session.currency?.toUpperCase() || 'USD',
          stripeCustomerId: session.customer as string,
          autoRenew: durationType === 'monthly',
          updatedAt: now,
        })
        .where(eq(userMemberships.id, existingMembership.id))
    } else {
      // 创建新会员记录
      await db.insert(userMemberships).values({
        userId,
        planId,
        startDate: now,
        endDate,
        status: 'active',
        durationType,
        durationDays,
        purchaseAmount: session.amount_total
          ? (session.amount_total / 100).toString()
          : '0',
        currency: session.currency?.toUpperCase() || 'USD',
        stripeCustomerId: session.customer as string,
        autoRenew: durationType === 'monthly',
        createdAt: now,
        updatedAt: now,
      })
    }

    // 更新用户使用限额
    const planType = plan.name.toLowerCase().includes('pro')
      ? 'pro'
      : plan.name.toLowerCase().includes('enterprise')
        ? 'enterprise'
        : plan.name.toLowerCase().includes('basic')
          ? 'basic'
          : 'free'
    await updateUserUsageLimits(userId, planType)

    logger.info(`支付完成处理成功: 用户${userId}, 计划${planId}`)
  } catch (error) {
    logger.error('处理checkout.session.completed失败:', error as Error)
    throw error
  }
}

// 处理订阅更新
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string

    // 根据Stripe customer ID查找用户会员
    const membership = await db.query.userMemberships.findFirst({
      where: eq(userMemberships.stripeCustomerId, customerId),
    })

    if (!membership) {
      logger.error(`找不到订阅对应的会员: ${customerId}`)
      return
    }

    // 更新会员状态
    const statusMap: Record<string, string> = {
      active: 'active',
      past_due: 'past_due',
      canceled: 'cancelled',
      unpaid: 'suspended',
      incomplete: 'pending',
      incomplete_expired: 'expired',
      trialing: 'active',
    }
    const status = statusMap[subscription.status] || 'active'

    await db
      .update(userMemberships)
      .set({
        status,
        endDate: new Date((subscription as any).current_period_end * 1000),
        nextRenewalDate: (subscription as any).cancel_at_period_end
          ? null
          : new Date((subscription as any).current_period_end * 1000),
        autoRenew: !subscription.cancel_at_period_end,
        updatedAt: new Date(),
      })
      .where(eq(userMemberships.id, membership.id))

    logger.info(`订阅更新成功: ${subscription.id}`)
  } catch (error) {
    logger.error('处理subscription.updated失败:', error as Error)
    throw error
  }
}

// 处理订阅取消
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string

    await db
      .update(userMemberships)
      .set({
        status: 'cancelled',
        autoRenew: false,
        cancelledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(userMemberships.stripeCustomerId, customerId))

    logger.info(`订阅取消成功: ${subscription.id}`)
  } catch (error) {
    logger.error('处理subscription.deleted失败:', error as Error)
    throw error
  }
}

// 处理支付成功
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string
    const subscriptionId = (invoice as any).subscription as string

    // 获取用户ID
    const membership = await db.query.userMemberships.findFirst({
      where: eq(userMemberships.stripeCustomerId, customerId),
    })

    if (!membership) {
      logger.warn(`找不到customer对应的会员: ${customerId}`)
      return
    }

    // 创建支付记录
    await db.insert(paymentRecords).values({
      userId: membership.userId,
      amount: invoice.amount_paid
        ? (invoice.amount_paid / 100).toString()
        : '0',
      currency: invoice.currency?.toUpperCase() || 'USD',
      status: 'completed',
      paymentMethod: 'stripe',
      stripePaymentIntentId: (invoice as any).payment_intent as string,
      planName: invoice.lines?.data?.[0]?.description || '订阅续费',
      durationType: 'monthly',
      membershipDurationDays: 30,
      metadata: {
        invoiceId: invoice.id,
        subscriptionId,
        customerId,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    logger.info(`支付记录创建成功: ${invoice.id}`)
  } catch (error) {
    logger.error('处理payment_succeeded失败:', error as Error)
    throw error
  }
}

// 处理支付失败
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string
    const subscriptionId = (invoice as any).subscription as string

    // 获取用户ID
    const membership = await db.query.userMemberships.findFirst({
      where: eq(userMemberships.stripeCustomerId, customerId),
    })

    if (!membership) {
      logger.warn(`找不到customer对应的会员: ${customerId}`)
      return
    }

    // 创建失败的支付记录
    await db.insert(paymentRecords).values({
      userId: membership.userId,
      amount: invoice.amount_due ? (invoice.amount_due / 100).toString() : '0',
      currency: invoice.currency?.toUpperCase() || 'USD',
      status: 'failed',
      paymentMethod: 'stripe',
      planName: invoice.lines?.data?.[0]?.description || '订阅续费',
      durationType: 'monthly',
      membershipDurationDays: 30,
      metadata: {
        invoiceId: invoice.id,
        subscriptionId,
        customerId,
        failureReason: 'payment_failed',
        attemptCount: (invoice as any).attempt_count,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // 如果连续失败多次，暂停会员
    if ((invoice as any).attempt_count && (invoice as any).attempt_count >= 3) {
      await db
        .update(userMemberships)
        .set({
          status: 'suspended',
          updatedAt: new Date(),
        })
        .where(eq(userMemberships.id, membership.id))
    }

    logger.info(`支付失败记录创建: ${invoice.id}`)
  } catch (error) {
    logger.error('处理payment_failed失败:', error as Error)
    throw error
  }
}

// 处理试用期即将结束
async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string

    const membership = await db.query.userMemberships.findFirst({
      where: eq(userMemberships.stripeCustomerId, customerId),
      with: { user: true },
    })

    if (!membership) {
      logger.warn(`找不到订阅对应的会员: ${customerId}`)
      return
    }

    // TODO: 发送试用期即将结束的邮件通知
    logger.info(
      `试用期即将结束: 用户${membership.userId}, 订阅${subscription.id}`
    )
  } catch (error) {
    logger.error('处理trial_will_end失败:', error as Error)
    throw error
  }
}

// 处理即将到期的账单
async function handleUpcomingInvoice(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string

    const membership = await db.query.userMemberships.findFirst({
      where: eq(userMemberships.stripeCustomerId, customerId),
      with: { user: true },
    })

    if (!membership) {
      logger.warn(`找不到customer对应的会员: ${customerId}`)
      return
    }

    // TODO: 发送即将扣费的邮件通知
    logger.info(`即将扣费: 用户${membership.userId}, 金额${invoice.amount_due}`)
  } catch (error) {
    logger.error('处理upcoming_invoice失败:', error as Error)
    throw error
  }
}

// 更新用户使用限额
async function updateUserUsageLimits(userId: string, planType: string) {
  try {
    const limits =
      DEFAULT_USAGE_LIMITS[planType as keyof typeof DEFAULT_USAGE_LIMITS] ||
      DEFAULT_USAGE_LIMITS.free

    const now = new Date()
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    // 检查是否已存在使用限额记录
    const existingLimits = await db.query.userUsageLimits.findFirst({
      where: eq(userUsageLimits.userId, userId),
    })

    if (existingLimits) {
      // 更新现有记录
      await db
        .update(userUsageLimits)
        .set({
          monthlyUseCases: limits.monthlyUseCases,
          monthlyTutorials: limits.monthlyTutorials,
          monthlyBlogs: limits.monthlyBlogs,
          monthlyApiCalls: limits.monthlyApiCalls,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          // 重置使用量（新订阅）
          usedUseCases: 0,
          usedTutorials: 0,
          usedBlogs: 0,
          usedApiCalls: 0,
          updatedAt: now,
        })
        .where(eq(userUsageLimits.userId, userId))
    } else {
      // 创建新记录
      await db.insert(userUsageLimits).values({
        userId,
        monthlyUseCases: limits.monthlyUseCases,
        monthlyTutorials: limits.monthlyTutorials,
        monthlyBlogs: limits.monthlyBlogs,
        monthlyApiCalls: limits.monthlyApiCalls,
        usedUseCases: 0,
        usedTutorials: 0,
        usedBlogs: 0,
        usedApiCalls: 0,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        createdAt: now,
        updatedAt: now,
      })
    }

    logger.info(`用户使用限额更新成功: ${userId}`)
  } catch (error) {
    logger.error('更新用户使用限额失败:', error as Error)
    throw error
  }
}
