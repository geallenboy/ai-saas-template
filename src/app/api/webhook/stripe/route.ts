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

// ===============================
// Webhook 事件处理器类型
// ===============================

type WebhookHandler = (event: Stripe.Event) => Promise<void>

// ===============================
// 事件处理器映射
// 覆盖完整的 Stripe 订阅生命周期事件：
// - subscription.created / updated / deleted
// - invoice.paid / payment_failed / payment_succeeded / upcoming
// - checkout.session.completed
// - payment_intent.succeeded / payment_failed
// - trial_will_end
// ===============================

const webhookHandlers: Record<string, WebhookHandler> = {
  'checkout.session.completed': async (event) => {
    await handleCheckoutSessionCompleted(
      event.data.object as Stripe.Checkout.Session
    )
  },
  'payment_intent.succeeded': async (event) => {
    await handlePaymentIntentSucceeded(
      event.data.object as Stripe.PaymentIntent
    )
  },
  'payment_intent.payment_failed': async (event) => {
    await handlePaymentIntentFailed(
      event.data.object as Stripe.PaymentIntent
    )
  },
  'customer.subscription.created': async (event) => {
    await handleSubscriptionCreated(
      event.data.object as Stripe.Subscription
    )
  },
  'customer.subscription.updated': async (event) => {
    await handleSubscriptionUpdated(
      event.data.object as Stripe.Subscription
    )
  },
  'customer.subscription.deleted': async (event) => {
    await handleSubscriptionDeleted(
      event.data.object as Stripe.Subscription
    )
  },
  'invoice.paid': async (event) => {
    await handleInvoicePaid(event.data.object as Stripe.Invoice)
  },
  'invoice.payment_failed': async (event) => {
    await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
  },
  'invoice.payment_succeeded': async (event) => {
    await handleInvoicePaid(event.data.object as Stripe.Invoice)
  },
  'customer.subscription.trial_will_end': async (event) => {
    await handleTrialWillEnd(event.data.object as Stripe.Subscription)
  },
  'invoice.upcoming': async (event) => {
    await handleUpcomingInvoice(event.data.object as Stripe.Invoice)
  },
}

/**
 * 获取所有已注册的 webhook 事件类型（用于外部查询）
 */
export function getRegisteredWebhookEvents(): string[] {
  return Object.keys(webhookHandlers)
}

// ===============================
// Webhook POST 处理器
// ===============================

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      logger.error('缺少 Stripe webhook 签名')
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    // Stripe webhook 签名验证
    let event: Stripe.Event
    try {
      event = verifyStripeWebhook(body, signature)
    } catch (verifyError) {
      logger.error('Stripe webhook 签名验证失败', verifyError as Error)
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      )
    }

    logger.info(`收到 Stripe webhook 事件: ${event.type}`, {
      eventId: event.id,
      eventType: event.type,
    })

    // 查找并执行对应的事件处理器
    const handler = webhookHandlers[event.type]
    if (handler) {
      try {
        await handler(event)
        logger.info(`Webhook 事件处理成功: ${event.type}`, {
          eventId: event.id,
        })
      } catch (handlerError) {
        logger.error(
          `Webhook 事件处理器执行失败: ${event.type}`,
          handlerError as Error,
          { eventId: event.id }
        )
        // 返回 500 让 Stripe 自动重试
        return NextResponse.json(
          { error: 'Webhook handler failed' },
          { status: 500 }
        )
      }
    } else {
      logger.info(`未处理的 Stripe 事件类型: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    logger.error('处理 Stripe webhook 失败:', error as Error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// ===============================
// 事件处理函数
// ===============================

/** 处理支付完成 (checkout.session.completed) */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const userId = session.client_reference_id || session.metadata?.userId
  const planName = session.metadata?.planName
  const durationType = session.metadata?.durationType || 'monthly'

  if (!userId) {
    logger.error('Checkout session 缺少 userId', undefined, {
      sessionId: session.id,
    })
    return
  }

  if (!planName) {
    logger.error('Checkout session 缺少 planName', undefined, {
      sessionId: session.id,
    })
    return
  }

  // 幂等性检查：检查是否已处理过此 checkout session
  const existingPayment = await db.query.paymentRecords.findFirst({
    where: eq(paymentRecords.stripeCheckoutSessionId, session.id),
  })
  if (existingPayment) {
    logger.info(`Checkout session 已处理过，跳过: ${session.id}`)
    return
  }

  // 查找对应的计划
  const plan = await db.query.membershipPlans.findFirst({
    where: eq(membershipPlans.name, planName),
  })

  if (!plan) {
    logger.error(`计划不存在: ${planName}`)
    return
  }

  const paymentIntentId = session.payment_intent as string
  const amount = session.amount_total ? session.amount_total / 100 : 0
  const sessionCurrency =
    session.metadata?.currency?.toLowerCase() ||
    session.currency ||
    'usd'
  const durationDays =
    session.metadata?.membershipDurationDays
      ? Number.parseInt(session.metadata.membershipDurationDays, 10)
      : durationType === 'yearly'
        ? 365
        : 30

  // 创建支付记录
  await db.insert(paymentRecords).values({
    userId,
    stripePaymentIntentId: paymentIntentId,
    stripeCheckoutSessionId: session.id,
    amount: amount.toString(),
    currency: sessionCurrency.toUpperCase(),
    status: 'succeeded',
    paymentMethod: session.metadata?.paymentMethod || 'card',
    planName,
    durationType: durationDays === 365 ? 'yearly' : 'monthly',
    membershipDurationDays: durationDays,
    paidAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  // 计算会员期限
  const now = new Date()
  const endDate = new Date(
    now.getTime() + durationDays * 24 * 60 * 60 * 1000
  )

  // 创建或更新会员记录
  const existingMembership = await db.query.userMemberships.findFirst({
    where: eq(userMemberships.userId, userId),
  })

  if (existingMembership) {
    await db
      .update(userMemberships)
      .set({
        planId: plan.id,
        startDate: now,
        endDate,
        status: 'active',
        durationType,
        durationDays,
        purchaseAmount: amount.toString(),
        currency: sessionCurrency.toUpperCase(),
        stripeCustomerId: session.customer as string,
        autoRenew: durationType === 'monthly',
        updatedAt: now,
      })
      .where(eq(userMemberships.id, existingMembership.id))
  } else {
    await db.insert(userMemberships).values({
      userId,
      planId: plan.id,
      startDate: now,
      endDate,
      status: 'active',
      durationType,
      durationDays,
      purchaseAmount: amount.toString(),
      currency: sessionCurrency.toUpperCase(),
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

  logger.info(`支付完成处理成功: 用户 ${userId}, 计划 ${plan.name}`)
}

/** 处理订阅创建 (customer.subscription.created) */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  // 查找已有会员记录（可能由 checkout.session.completed 创建）
  const membership = await db.query.userMemberships.findFirst({
    where: eq(userMemberships.stripeCustomerId, customerId),
  })

  if (membership) {
    await db
      .update(userMemberships)
      .set({
        stripeSubscriptionId: subscription.id,
        status: 'active',
        autoRenew: !subscription.cancel_at_period_end,
        updatedAt: new Date(),
      })
      .where(eq(userMemberships.id, membership.id))

    logger.info(`订阅创建成功: ${subscription.id}`, {
      customerId,
      userId: membership.userId,
    })
  } else {
    logger.warn(`订阅创建但未找到对应会员: ${customerId}`)
  }
}

/** 处理订阅更新 (customer.subscription.updated) */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  const membership = await db.query.userMemberships.findFirst({
    where: eq(userMemberships.stripeCustomerId, customerId),
  })

  if (!membership) {
    logger.warn(`找不到订阅对应的会员: ${customerId}`)
    return
  }

  // 映射 Stripe 订阅状态到内部状态
  const statusMap: Record<string, string> = {
    active: 'active',
    past_due: 'active',
    canceled: 'cancelled',
    unpaid: 'suspended',
    incomplete: 'pending',
    incomplete_expired: 'expired',
    trialing: 'active',
  }
  const status = statusMap[subscription.status] || 'active'

  const endDate = new Date(
    (subscription as any).current_period_end * 1000
  )
  const cancelAtPeriodEnd = subscription.cancel_at_period_end

  await db
    .update(userMemberships)
    .set({
      status,
      stripeSubscriptionId: subscription.id,
      endDate,
      nextRenewalDate: cancelAtPeriodEnd ? null : endDate,
      autoRenew: !cancelAtPeriodEnd,
      cancelledAt:
        status === 'cancelled' ? new Date() : membership.cancelledAt,
      updatedAt: new Date(),
    })
    .where(eq(userMemberships.id, membership.id))

  logger.info(`订阅更新成功: ${subscription.id}`, {
    status,
    customerId,
    endDate: endDate.toISOString(),
  })
}

/** 处理订阅取消 (customer.subscription.deleted) */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
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

  logger.info(`订阅取消成功: ${subscription.id}`, { customerId })
}

/** 处理发票支付成功 (invoice.paid / invoice.payment_succeeded) */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  const subscriptionId = (invoice as any).subscription as string

  // 幂等性检查：检查是否已处理过此发票
  if (invoice.id) {
    const existingPayment = await db.query.paymentRecords.findFirst({
      where: eq(paymentRecords.stripeInvoiceId, invoice.id),
    })
    if (existingPayment) {
      logger.info(`发票已处理过，跳过: ${invoice.id}`)
      return
    }
  }

  const membership = await db.query.userMemberships.findFirst({
    where: eq(userMemberships.stripeCustomerId, customerId),
  })

  if (!membership) {
    logger.warn(`找不到 customer 对应的会员: ${customerId}`)
    return
  }

  // 创建支付记录
  await db.insert(paymentRecords).values({
    userId: membership.userId,
    amount: invoice.amount_paid
      ? (invoice.amount_paid / 100).toString()
      : '0',
    currency: invoice.currency?.toUpperCase() || 'USD',
    status: 'succeeded',
    paymentMethod: 'stripe',
    stripePaymentIntentId: (invoice as any).payment_intent as string,
    stripeInvoiceId: invoice.id ?? undefined,
    planName: invoice.lines?.data?.[0]?.description || '订阅续费',
    durationType: 'monthly',
    membershipDurationDays: 30,
    paidAt: new Date(),
    metadata: {
      invoiceId: invoice.id,
      subscriptionId,
      customerId,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  // 续费成功时延长会员有效期
  if (
    membership.status === 'active' ||
    membership.status === 'suspended'
  ) {
    const now = new Date()
    const currentEndDate = new Date(membership.endDate)
    const baseDate = currentEndDate > now ? currentEndDate : now
    const durationDays = membership.durationDays || 30
    const newEndDate = new Date(
      baseDate.getTime() + durationDays * 24 * 60 * 60 * 1000
    )

    await db
      .update(userMemberships)
      .set({
        status: 'active',
        endDate: newEndDate,
        nextRenewalDate: newEndDate,
        renewalAttempts: 0,
        updatedAt: now,
      })
      .where(eq(userMemberships.id, membership.id))

    logger.info(`会员有效期已延长: 用户 ${membership.userId}`, {
      newEndDate: newEndDate.toISOString(),
    })
  }

  logger.info(`发票支付成功: ${invoice.id}`)
}

/** 处理发票支付失败 (invoice.payment_failed) */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  const subscriptionId = (invoice as any).subscription as string

  const membership = await db.query.userMemberships.findFirst({
    where: eq(userMemberships.stripeCustomerId, customerId),
  })

  if (!membership) {
    logger.warn(`找不到 customer 对应的会员: ${customerId}`)
    return
  }

  const attemptCount = invoice.attempt_count ?? 0

  // 创建失败的支付记录
  await db.insert(paymentRecords).values({
    userId: membership.userId,
    amount: invoice.amount_due
      ? (invoice.amount_due / 100).toString()
      : '0',
    currency: invoice.currency?.toUpperCase() || 'USD',
    status: 'failed',
    paymentMethod: 'stripe',
    stripeInvoiceId: invoice.id ?? undefined,
    planName: invoice.lines?.data?.[0]?.description || '订阅续费',
    durationType: 'monthly',
    membershipDurationDays: 30,
    failedAt: new Date(),
    metadata: {
      invoiceId: invoice.id,
      subscriptionId,
      customerId,
      failureReason: 'payment_failed',
      attemptCount,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  // 更新续费尝试次数
  await db
    .update(userMemberships)
    .set({
      renewalAttempts: attemptCount,
      updatedAt: new Date(),
    })
    .where(eq(userMemberships.id, membership.id))

  // 连续失败 3 次以上，暂停会员
  if (attemptCount >= 3) {
    await db
      .update(userMemberships)
      .set({
        status: 'suspended',
        updatedAt: new Date(),
      })
      .where(eq(userMemberships.id, membership.id))

    logger.warn(`会员因支付失败被暂停: 用户 ${membership.userId}`, {
      attemptCount,
      invoiceId: invoice.id,
    })
  }

  logger.info(`支付失败记录创建: ${invoice.id}`, {
    attemptCount,
    userId: membership.userId,
  })
}

/** 处理支付意图成功 (payment_intent.succeeded) */
async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
) {
  logger.info(`支付意图成功: ${paymentIntent.id}`, {
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
  })

  // 更新对应的支付记录状态
  const existingRecord = await db.query.paymentRecords.findFirst({
    where: eq(paymentRecords.stripePaymentIntentId, paymentIntent.id),
  })

  if (existingRecord) {
    await db
      .update(paymentRecords)
      .set({
        status: 'succeeded',
        paidAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(paymentRecords.stripePaymentIntentId, paymentIntent.id))
  }
}

/** 处理支付意图失败 (payment_intent.payment_failed) */
async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent
) {
  logger.warn(`支付意图失败: ${paymentIntent.id}`, {
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
  })

  // 更新对应的支付记录状态
  await db
    .update(paymentRecords)
    .set({
      status: 'failed',
      failedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(paymentRecords.stripePaymentIntentId, paymentIntent.id))
}

/** 处理试用期即将结束 (customer.subscription.trial_will_end) */
async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  const membership = await db.query.userMemberships.findFirst({
    where: eq(userMemberships.stripeCustomerId, customerId),
  })

  if (!membership) {
    logger.warn(`找不到订阅对应的会员: ${customerId}`)
    return
  }

  // TODO: 发送试用期即将结束的邮件通知
  logger.info(
    `试用期即将结束: 用户 ${membership.userId}, 订阅 ${subscription.id}`
  )
}

/** 处理即将到期的账单 (invoice.upcoming) */
async function handleUpcomingInvoice(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  const membership = await db.query.userMemberships.findFirst({
    where: eq(userMemberships.stripeCustomerId, customerId),
  })

  if (!membership) {
    logger.warn(`找不到 customer 对应的会员: ${customerId}`)
    return
  }

  // TODO: 发送即将扣费的邮件通知
  logger.info(
    `即将扣费: 用户 ${membership.userId}, 金额 ${invoice.amount_due}`
  )
}

// ===============================
// 辅助函数
// ===============================

/** 更新用户使用限额 */
async function updateUserUsageLimits(userId: string, planType: string) {
  const limits =
    DEFAULT_USAGE_LIMITS[planType as keyof typeof DEFAULT_USAGE_LIMITS] ||
    DEFAULT_USAGE_LIMITS.free

  const now = new Date()
  const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const existingLimits = await db.query.userUsageLimits.findFirst({
    where: eq(userUsageLimits.userId, userId),
  })

  if (existingLimits) {
    await db
      .update(userUsageLimits)
      .set({
        monthlyUseCases: limits.monthlyUseCases,
        monthlyTutorials: limits.monthlyTutorials,
        monthlyBlogs: limits.monthlyBlogs,
        monthlyApiCalls: limits.monthlyApiCalls,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        usedUseCases: 0,
        usedTutorials: 0,
        usedBlogs: 0,
        usedApiCalls: 0,
        updatedAt: now,
      })
      .where(eq(userUsageLimits.userId, userId))
  } else {
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

  logger.info(`用户使用限额更新成功: ${userId}`, { planType })
}
