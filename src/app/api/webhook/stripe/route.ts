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
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      logger.error('Missing Stripe signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // Use real Stripe webhook signature verification
    const event = verifyStripeWebhook(body, signature)
    logger.info(`Received Stripe webhook: ${event.type}`)

    // Handle different types of events
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
        logger.info(`Unhandled Stripe event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    logger.error('Failed to process Stripe webhook:', error as Error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}

// Handle payment succeeded
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  try {
    const userId = session.client_reference_id
    const planId = session.metadata?.planId
    const durationType = session.metadata?.durationType || 'monthly'

    if (!userId || !planId) {
      logger.error(
        'Checkout session is missing necessary information: ' + session.id
      )
      return
    }

    // Get plan information
    const plan = await db.query.membershipPlans.findFirst({
      where: eq(membershipPlans.id, planId),
    })

    if (!plan) {
      logger.error(`Plan does not exist: ${planId}`)
      return
    }

    // Create payment record
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

    // Calculate membership duration
    const now = new Date()
    const durationDays = durationType === 'yearly' ? 365 : 30
    const endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000)

    // Create or update membership record
    const existingMembership = await db.query.userMemberships.findFirst({
      where: eq(userMemberships.userId, userId),
    })

    if (existingMembership) {
      // Update existing membership
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
      // Create new member record
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

    // Update user usage limits
    const planType = plan.name.toLowerCase().includes('pro')
      ? 'pro'
      : plan.name.toLowerCase().includes('enterprise')
        ? 'enterprise'
        : plan.name.toLowerCase().includes('basic')
          ? 'basic'
          : 'free'
    await updateUserUsageLimits(userId, planType)

    logger.info(`Payment succeeded: User ${userId}, Plan ${planId}`)
  } catch (error) {
    logger.error(
      'Failed to process checkout.session.completed:',
      error as Error
    )
    throw error
  }
}

// Handle subscription updated
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string

    // Find user membership by Stripe customer ID
    const membership = await db.query.userMemberships.findFirst({
      where: eq(userMemberships.stripeCustomerId, customerId),
    })

    if (!membership) {
      logger.error(`Cannot find membership for subscription: ${customerId}`)
      return
    }

    // Update membership status
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

    logger.info(`Subscription updated successfully: ${subscription.id}`)
  } catch (error) {
    logger.error('Failed to process subscription.updated:', error as Error)
    throw error
  }
}

// Handle subscription deleted
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

    logger.info(`Subscription deleted successfully: ${subscription.id}`)
  } catch (error) {
    logger.error('Failed to process subscription.deleted:', error as Error)
    throw error
  }
}

// Handle payment succeeded
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string
    const subscriptionId = (invoice as any).subscription as string

    // Get user ID
    const membership = await db.query.userMemberships.findFirst({
      where: eq(userMemberships.stripeCustomerId, customerId),
    })

    if (!membership) {
      logger.warn(`Cannot find membership for payment: ${customerId}`)
      return
    }

    // Create payment record
    await db.insert(paymentRecords).values({
      userId: membership.userId,
      amount: invoice.amount_paid
        ? (invoice.amount_paid / 100).toString()
        : '0',
      currency: invoice.currency?.toUpperCase() || 'USD',
      status: 'completed',
      paymentMethod: 'stripe',
      stripePaymentIntentId: (invoice as any).payment_intent as string,
      planName: invoice.lines?.data?.[0]?.description || 'Subscription Renewal',
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

    logger.info(`Payment record created successfully: ${invoice.id}`)
  } catch (error) {
    logger.error('Failed to process payment_succeeded:', error as Error)
    throw error
  }
}

// Handle payment failed
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string
    const subscriptionId = (invoice as any).subscription as string

    // Get user ID
    const membership = await db.query.userMemberships.findFirst({
      where: eq(userMemberships.stripeCustomerId, customerId),
    })

    if (!membership) {
      logger.warn(`Cannot find membership for payment: ${customerId}`)
      return
    }

    // Create failed payment record
    await db.insert(paymentRecords).values({
      userId: membership.userId,
      amount: invoice.amount_due ? (invoice.amount_due / 100).toString() : '0',
      currency: invoice.currency?.toUpperCase() || 'USD',
      status: 'failed',
      paymentMethod: 'stripe',
      planName: invoice.lines?.data?.[0]?.description || 'Subscription Renewal',
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

    // If failed multiple times, suspend membership
    if ((invoice as any).attempt_count && (invoice as any).attempt_count >= 3) {
      await db
        .update(userMemberships)
        .set({
          status: 'suspended',
          updatedAt: new Date(),
        })
        .where(eq(userMemberships.id, membership.id))
    }

    logger.info(`Failed payment record created: ${invoice.id}`)
  } catch (error) {
    logger.error('Failed to process payment_failed:', error as Error)
    throw error
  }
}

// Handle trial will end
async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string

    const membership = await db.query.userMemberships.findFirst({
      where: eq(userMemberships.stripeCustomerId, customerId),
      with: { user: true },
    })

    if (!membership) {
      logger.warn(`Cannot find membership for trial will end: ${customerId}`)
      return
    }

    // TODO: Send an email notification when the trial period is about to end
    logger.info(
      `Trial will end soon: User ${membership.userId}, Subscription ${subscription.id}`
    )
  } catch (error) {
    logger.error('Failed to process trial_will_end:', error as Error)
    throw error
  }
}

// Handle upcoming invoice
async function handleUpcomingInvoice(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string

    const membership = await db.query.userMemberships.findFirst({
      where: eq(userMemberships.stripeCustomerId, customerId),
      with: { user: true },
    })

    if (!membership) {
      logger.warn(`Cannot find membership for upcoming invoice: ${customerId}`)
      return
    }

    // TODO: Send email notifications of upcoming deductions
    logger.info(
      `Upcoming invoice: User ${membership.userId}, Amount ${invoice.amount_due}`
    )
  } catch (error) {
    logger.error('Failed to process upcoming_invoice:', error as Error)
    throw error
  }
}

// Update user usage limits
async function updateUserUsageLimits(userId: string, planType: string) {
  try {
    const limits =
      DEFAULT_USAGE_LIMITS[planType as keyof typeof DEFAULT_USAGE_LIMITS] ||
      DEFAULT_USAGE_LIMITS.free

    const now = new Date()
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    // Check if usage limits record already exists
    const existingLimits = await db.query.userUsageLimits.findFirst({
      where: eq(userUsageLimits.userId, userId),
    })

    if (existingLimits) {
      // Update existing record
      await db
        .update(userUsageLimits)
        .set({
          monthlyUseCases: limits.monthlyUseCases,
          monthlyTutorials: limits.monthlyTutorials,
          monthlyBlogs: limits.monthlyBlogs,
          monthlyApiCalls: limits.monthlyApiCalls,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          // Reset usage (new subscription)
          usedUseCases: 0,
          usedTutorials: 0,
          usedBlogs: 0,
          usedApiCalls: 0,
          updatedAt: now,
        })
        .where(eq(userUsageLimits.userId, userId))
    } else {
      // Create new record
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

    logger.info(`User usage limits updated successfully: ${userId}`)
  } catch (error) {
    logger.error('Failed to update user usage limits:', error as Error)
    throw error
  }
}
