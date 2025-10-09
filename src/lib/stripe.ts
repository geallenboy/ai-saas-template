import Stripe from 'stripe'
import { env } from '@/env'
import { logger } from '@/lib/logger'

// 初始化Stripe客户端
export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
  typescript: true,
  appInfo: {
    name: 'AI SaaS Template',
    version: '1.0.0',
  },
})

// 服务端Stripe实例
export function getServerStripe(): Stripe {
  return stripe
}

// Stripe webhook签名验证
export function verifyStripeWebhook(
  body: string,
  signature: string
): Stripe.Event {
  const endpointSecret = env.STRIPE_WEBHOOK_SECRET

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      endpointSecret
    )
    return event
  } catch (error) {
    logger.error('Stripe webhook签名验证失败:', error as Error)
    throw new Error('Invalid signature')
  }
}

// 创建客户
export async function createStripeCustomer(params: {
  email: string
  name?: string
  userId: string
  metadata?: Record<string, string>
}): Promise<Stripe.Customer> {
  try {
    const customer = await stripe.customers.create({
      email: params.email,
      name: params.name,
      metadata: {
        userId: params.userId,
        ...params.metadata,
      },
    })

    logger.info(`Stripe客户创建成功: ${customer.id}`)
    return customer
  } catch (error) {
    logger.error('创建Stripe客户失败:', error as Error)
    throw error
  }
}

// 创建订阅
export async function createStripeSubscription(params: {
  customerId: string
  priceId: string
  metadata?: Record<string, string>
  trialPeriodDays?: number
}): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: params.customerId,
      items: [{ price: params.priceId }],
      metadata: params.metadata,
      trial_period_days: params.trialPeriodDays,
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    })

    logger.info(`Stripe订阅创建成功: ${subscription.id}`)
    return subscription
  } catch (error) {
    logger.error('创建Stripe订阅失败:', error as Error)
    throw error
  }
}

// 创建结账会话
export async function createStripeCheckoutSession(params: {
  priceId: string
  customerId?: string
  customerEmail?: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
  mode?: 'payment' | 'subscription'
  allowPromotionCodes?: boolean
}): Promise<Stripe.Checkout.Session> {
  try {
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: params.mode || 'subscription',
      line_items: [
        {
          price: params.priceId,
          quantity: 1,
        },
      ],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: params.metadata,
      allow_promotion_codes: params.allowPromotionCodes ?? true,
      billing_address_collection: 'auto',
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
    }

    if (params.customerId) {
      sessionParams.customer = params.customerId
    } else if (params.customerEmail) {
      sessionParams.customer_email = params.customerEmail
    }

    if (params.mode === 'subscription') {
      sessionParams.subscription_data = {
        metadata: params.metadata,
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    logger.info(`Stripe结账会话创建成功: ${session.id}`)
    return session
  } catch (error) {
    logger.error('创建Stripe结账会话失败:', error as Error)
    throw error
  }
}

// 创建客户门户会话
export async function createStripePortalSession(params: {
  customerId: string
  returnUrl: string
}): Promise<Stripe.BillingPortal.Session> {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: params.customerId,
      return_url: params.returnUrl,
    })

    logger.info(`Stripe客户门户会话创建成功: ${session.id}`)
    return session
  } catch (error) {
    logger.error('创建Stripe客户门户会话失败:', error as Error)
    throw error
  }
}

// 取消订阅
export async function cancelStripeSubscription(
  subscriptionId: string,
  options?: {
    cancelAtPeriodEnd?: boolean
    prorate?: boolean
  }
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: options?.cancelAtPeriodEnd ?? true,
      proration_behavior: options?.prorate ? 'create_prorations' : 'none',
    })

    logger.info(`Stripe订阅取消成功: ${subscription.id}`)
    return subscription
  } catch (error) {
    logger.error('取消Stripe订阅失败:', error as Error)
    throw error
  }
}

// 获取客户订阅
export async function getStripeCustomerSubscriptions(
  customerId: string
): Promise<Stripe.Subscription[]> {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      expand: ['data.default_payment_method'],
    })

    return subscriptions.data
  } catch (error) {
    logger.error('获取Stripe客户订阅失败:', error as Error)
    throw error
  }
}

// 获取客户支付记录
export async function getStripeCustomerPayments(
  customerId: string,
  limit = 10
): Promise<Stripe.PaymentIntent[]> {
  try {
    const payments = await stripe.paymentIntents.list({
      customer: customerId,
      limit,
    })

    return payments.data
  } catch (error) {
    logger.error('获取Stripe客户支付记录失败:', error as Error)
    throw error
  }
}

// 创建优惠券
export async function createStripeCoupon(params: {
  id?: string
  percentOff?: number
  amountOff?: number
  currency?: string
  duration: 'forever' | 'once' | 'repeating'
  durationInMonths?: number
  maxRedemptions?: number
  name?: string
  metadata?: Record<string, string>
}): Promise<Stripe.Coupon> {
  try {
    const coupon = await stripe.coupons.create({
      id: params.id,
      percent_off: params.percentOff,
      amount_off: params.amountOff,
      currency: params.currency,
      duration: params.duration,
      duration_in_months: params.durationInMonths,
      max_redemptions: params.maxRedemptions,
      name: params.name,
      metadata: params.metadata,
    })

    logger.info(`Stripe优惠券创建成功: ${coupon.id}`)
    return coupon
  } catch (error) {
    logger.error('创建Stripe优惠券失败:', error as Error)
    throw error
  }
}

// 获取产品和价格
export async function getStripeProducts(): Promise<{
  products: Stripe.Product[]
  prices: Stripe.Price[]
}> {
  try {
    const [productsResponse, pricesResponse] = await Promise.all([
      stripe.products.list({ active: true }),
      stripe.prices.list({ active: true, expand: ['data.product'] }),
    ])

    return {
      products: productsResponse.data,
      prices: pricesResponse.data,
    }
  } catch (error) {
    logger.error('获取Stripe产品和价格失败:', error as Error)
    throw error
  }
}

// 格式化Stripe金额（从分转换为元）
export function formatStripeAmount(amount: number, currency = 'usd'): number {
  const zeroDecimalCurrencies = ['jpy', 'krw', 'vnd']
  return zeroDecimalCurrencies.includes(currency.toLowerCase())
    ? amount
    : amount / 100
}

// 转换金额为Stripe格式（从元转换为分）
export function toStripeAmount(amount: number, currency = 'usd'): number {
  const zeroDecimalCurrencies = ['jpy', 'krw', 'vnd']
  return zeroDecimalCurrencies.includes(currency.toLowerCase())
    ? Math.round(amount)
    : Math.round(amount * 100)
}

// Stripe事件类型守卫
export const isStripeEvent = (event: unknown): event is Stripe.Event => {
  return typeof event === 'object' && event !== null && 'type' in event
}

// 获取Stripe错误信息
export function getStripeErrorMessage(error: unknown): string {
  if (error instanceof Stripe.errors.StripeError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return '未知的Stripe错误'
}
