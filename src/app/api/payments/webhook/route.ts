import {
  membershipPlans,
  paymentRecords,
  userMemberships,
  userUsageLimits,
} from '@/drizzle/schemas'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'
import { verifyStripeWebhook } from '@/lib/stripe'
import { eq } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'

/**
 * Activate user membership
 */
async function activateMembership(
  userId: string,
  planId: string,
  paymentIntentId: string,
  amount: number,
  currency: string,
  paymentMethod: string,
  durationDays: number
) {
  const now = new Date()
  const endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000)

  // Check if there is already a member record
  const existingMembership = await db
    .select()
    .from(userMemberships)
    .where(eq(userMemberships.userId, userId))
    .limit(1)

  if (existingMembership.length > 0) {
    // Update existing membership
    await db
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
      .where(eq(userMemberships.userId, userId))
  } else {
    // Create new membership record
    await db.insert(userMemberships).values({
      userId,
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
  await updateUserUsageLimits(userId, planId)

  logger.info('Membership activated successfully:', {
    userId,
    planId,
    endDate: endDate.toISOString(),
  })
}

/**
 * Update user usage limits
 */
async function updateUserUsageLimits(userId: string, planId: string) {
  // Get plan information
  const plan = await db.query.membershipPlans.findFirst({
    where: eq(membershipPlans.id, planId),
  })

  if (!plan) {
    logger.error(
      'Plan not found, unable to update usage limits',
      new Error(`Plan not found: ${planId}`)
    )
    return
  }

  const now = new Date()
  const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days later reset

  // Check if there are existing usage limits records
  const existingLimits = await db
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
    await db
      .update(userUsageLimits)
      .set(usageLimitsData)
      .where(eq(userUsageLimits.userId, userId))
  } else {
    // Create new record
    await db.insert(userUsageLimits).values({
      ...usageLimitsData,
      usedUseCases: 0,
      usedTutorials: 0,
      usedBlogs: 0,
      usedApiCalls: 0,
      createdAt: now,
    })
  }

  logger.info('User usage limits updated successfully', { userId })
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature') as string

  if (!signature) {
    logger.error('Missing Stripe signature')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = verifyStripeWebhook(body, signature)
  } catch (err: any) {
    logger.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  logger.info('Received Stripe webhook event:', event)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutSessionCompleted(session)
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        logger.info('Payment intent succeeded:', {
          paymentIntent: paymentIntent.id,
        })
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        logger.info('Payment intent failed:', {
          paymentIntent: paymentIntent.id,
        })
        await handlePaymentFailed(paymentIntent)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentSucceeded(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentFailed(invoice)
        break
      }

      default:
        logger.info('Unhandled event type:', event)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    logger.error('Error processing webhook:', error as Error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle checkout.session.completed event
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  try {
    logger.info('Processing checkout session completed:', session)

    // Verify session mode is payment (one-time payment)
    if (session.mode !== 'payment') {
      logger.info('Skipping non-payment session:', session)
      return
    }

    // Get necessary metadata
    const {
      userId,
      planName,
      currency,
      paymentMethod,
      membershipDurationDays,
    } = session.metadata || {}

    if (!userId) {
      logger.error('Missing userId in session metadata:')
      return
    }

    if (!planName) {
      logger.error('Missing planName in session metadata:')
      return
    }

    // Find the corresponding plan
    const [plan] = await db
      .select()
      .from(membershipPlans)
      .where(eq(membershipPlans.name, planName))
      .limit(1)

    if (!plan) {
      logger.info('Plan not found:', { planName })
      return
    }

    // Get payment information
    const paymentIntentId = session.payment_intent as string
    const amount = session.amount_total ? session.amount_total / 100 : 0 // Stripe is in cents
    const sessionCurrency = currency?.toLowerCase() || session.currency || 'usd'
    const durationDays = membershipDurationDays
      ? Number.parseInt(membershipDurationDays, 10)
      : 30

    logger.info('Processing membership activation:', {
      userId,
      planId: plan.id,
      planName,
      paymentIntentId,
      sessionId: session.id,
      amount,
      currency: sessionCurrency,
      durationDays,
    })

    // Create payment record
    await db.insert(paymentRecords).values({
      userId,
      stripePaymentIntentId: paymentIntentId,
      stripeCheckoutSessionId: session.id,
      amount: amount.toString(),
      currency: sessionCurrency.toUpperCase(),
      status: 'succeeded',
      paymentMethod: paymentMethod || 'card',
      planName,
      durationType: durationDays === 365 ? 'yearly' : 'monthly',
      membershipDurationDays: durationDays,
      paidAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Activate membership
    await activateMembership(
      userId,
      plan.id,
      paymentIntentId,
      amount,
      sessionCurrency,
      paymentMethod || 'card',
      durationDays
    )

    logger.info('Membership activated successfully for user:', { userId })
  } catch (error) {
    logger.error('Failed to handle checkout session completed:', error as Error)
    throw error
  }
}

/**
 * Handle payment failed event
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    logger.info('Processing payment failed:', paymentIntent)

    // Get related payment record and update status
    await db
      .update(paymentRecords)
      .set({
        status: 'failed',
        failedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(paymentRecords.stripePaymentIntentId, paymentIntent.id))

    logger.info('Payment failure recorded:', paymentIntent)
  } catch (error) {
    logger.error('Failed to handle payment failed:', error as Error)
    throw error
  }
}

/**
 * Handle subscription updated event
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    logger.info('Processing subscription updated:', subscription)

    const customerId = subscription.customer as string

    // Find user membership by Stripe customer ID
    const membership = await db
      .select()
      .from(userMemberships)
      .where(eq(userMemberships.stripeCustomerId, customerId))
      .limit(1)

    if (membership.length === 0) {
      logger.error(`Membership not found for customer: ${customerId}`)
      return
    }

    // Update membership status
    const statusMap: Record<string, string> = {
      active: 'active',
      past_due: 'active', // Keep active but mark as past due
      canceled: 'cancelled',
      unpaid: 'cancelled',
      incomplete: 'active',
      incomplete_expired: 'expired',
      trialing: 'active',
    }

    const status = statusMap[subscription.status] || 'active'
    const endDate = new Date((subscription as any).current_period_end * 1000)

    if (membership[0]) {
      await db
        .update(userMemberships)
        .set({
          status,
          endDate,
          nextRenewalDate: subscription.cancel_at_period_end ? null : endDate,
          autoRenew: !subscription.cancel_at_period_end,
          updatedAt: new Date(),
        })
        .where(eq(userMemberships.id, membership[0].id))
    }

    logger.info(`Subscription updated: ${subscription.id}, status: ${status}`)
  } catch (error) {
    logger.error('Failed to handle subscription updated:', error as Error)
    throw error
  }
}

/**
 * Handle subscription deleted event
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    logger.info('Processing subscription deleted:', subscription)

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

    logger.info(`Subscription cancelled: ${subscription.id}`)
  } catch (error) {
    logger.error('Failed to handle subscription deleted:', error as Error)
    throw error
  }
}

/**
 * Handle invoice payment succeeded event
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    logger.info('Processing invoice payment succeeded:', invoice)

    const customerId = invoice.customer as string

    // Get user membership information
    const membership = await db
      .select()
      .from(userMemberships)
      .where(eq(userMemberships.stripeCustomerId, customerId))
      .limit(1)

    if (membership.length === 0) {
      logger.warn(`Membership not found for customer: ${customerId}`)
      return
    }

    // Create payment record
    if (membership[0]) {
      await db.insert(paymentRecords).values({
        userId: membership[0].userId,
        amount: invoice.amount_paid
          ? (invoice.amount_paid / 100).toString()
          : '0',
        currency: invoice.currency?.toUpperCase() || 'USD',
        status: 'succeeded',
        paymentMethod: 'stripe',
        stripePaymentIntentId: (invoice as any).payment_intent as string,
        stripeInvoiceId: invoice.id,
        planName:
          invoice.lines?.data?.[0]?.description || 'Subscription renewal',
        durationType: 'monthly',
        membershipDurationDays: 30,
        paidAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    logger.info(`Invoice payment recorded: ${invoice.id}`)
  } catch (error) {
    logger.error('Failed to handle invoice payment succeeded:', error as Error)
    throw error
  }
}

/**
 * Handle invoice payment failed event
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    logger.info('Processing invoice payment failed:', invoice)

    const customerId = invoice.customer as string

    // Get user membership information
    const membership = await db
      .select()
      .from(userMemberships)
      .where(eq(userMemberships.stripeCustomerId, customerId))
      .limit(1)

    if (membership.length === 0) {
      logger.warn(`Membership not found for customer: ${customerId}`)
      return
    }

    // Create failed payment record
    if (membership[0]) {
      await db.insert(paymentRecords).values({
        userId: membership[0].userId,
        amount: invoice.amount_due
          ? (invoice.amount_due / 100).toString()
          : '0',
        currency: invoice.currency?.toUpperCase() || 'USD',
        status: 'failed',
        paymentMethod: 'stripe',
        stripeInvoiceId: invoice.id,
        planName:
          invoice.lines?.data?.[0]?.description || 'Subscription renewal',
        durationType: 'monthly',
        membershipDurationDays: 30,
        failedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      // If you fail multiple times in a row, your membership will be suspended.
      if (invoice.attempt_count && invoice.attempt_count >= 3) {
        await db
          .update(userMemberships)
          .set({
            status: 'cancelled',
            updatedAt: new Date(),
          })
          .where(eq(userMemberships.id, membership[0].id))

        logger.info(
          `Membership suspended due to payment failures: ${membership[0].userId}`
        )
      }
    }

    logger.info(`Invoice payment failure recorded: ${invoice.id}`)
  } catch (error) {
    logger.error('Failed to handle invoice payment failed:', error as Error)
    throw error
  }
}
