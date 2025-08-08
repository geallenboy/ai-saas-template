import { getServerStripe } from '@/lib/stripe'
import { auth } from '@clerk/nextjs/server'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { priceId, planName, isYearly = false } = await req.json()

    console.log('🔍 Payment request parameters received by the API:', {
      priceId,
      planName,
      isYearly,
      userId,
      timestamp: new Date().toISOString(),
    })

    if (!(priceId && planName)) {
      console.error('❌ Missing required parameters:', { priceId, planName })
      return NextResponse.json(
        {
          error:
            'Missing required parameters: priceId and planName are required',
        },
        { status: 400 }
      )
    }

    const stripe = getServerStripe()

    // Validate price ID in detail
    console.log('🔍 Starting validation for Stripe price ID:', priceId)

    try {
      const price = await stripe.prices.retrieve(priceId)

      console.log('📋 Stripe price details:', {
        id: price.id,
        type: price.type,
        recurring: price.recurring,
        currency: price.currency,
        unit_amount: price.unit_amount,
        active: price.active,
        product: price.product,
      })

      if (!price.active) {
        console.error('❌ Price is disabled:', price.id)
        return NextResponse.json(
          { error: `Price ${priceId} is not active` },
          { status: 400 }
        )
      }

      if (price.type !== 'recurring') {
        console.error('❌ Price type is not subscription:', {
          priceId: price.id,
          actualType: price.type,
          expected: 'recurring',
        })
        return NextResponse.json(
          {
            error: `Price ${priceId} is not a recurring subscription price. Type: ${price.type}`,
          },
          { status: 400 }
        )
      }

      if (!price.recurring) {
        console.error('❌ Missing subscription configuration:', price.id)
        return NextResponse.json(
          { error: `Price ${priceId} missing recurring configuration` },
          { status: 400 }
        )
      }

      console.log('✅ Price validation passed:', {
        id: price.id,
        interval: price.recurring.interval,
        intervalCount: price.recurring.interval_count,
      })
    } catch (priceError: any) {
      console.error('❌ Failed to retrieve Stripe price:', {
        priceId,
        error: priceError.message,
        type: priceError.type,
        code: priceError.code,
      })
      return NextResponse.json(
        { error: `Invalid Stripe price ID: ${priceId}. ${priceError.message}` },
        { status: 400 }
      )
    }

    // Create or retrieve Stripe customer
    console.log('🔍 Looking up or creating Stripe customer...')
    const customers = await stripe.customers.search({
      query: `metadata["userId"]:"${userId}"`,
    })

    let customerId: string

    if (customers.data.length > 0) {
      customerId = customers.data[0]!.id
      console.log('✅ Found existing Stripe customer:', customerId)
    } else {
      const customer = await stripe.customers.create({
        metadata: {
          userId: userId,
        },
      })
      customerId = customer.id
      console.log('✅ Created new Stripe customer:', customerId)
    }

    // Create checkout session
    console.log('🚀 Creating Stripe checkout session...')
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?canceled=true`,
      metadata: {
        userId: userId,
        planName: planName,
        isYearly: isYearly.toString(),
      },
    })

    console.log('✅ Stripe session created successfully:', {
      sessionId: session.id,
      url: `${session.url?.substring(0, 50)}...`,
      customer: session.customer,
      mode: session.mode,
    })

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
      },
    })
  } catch (error: any) {
    console.error('❌ Failed to create checkout session:', {
      message: error.message,
      type: error.type,
      code: error.code,
      stack: error.stack?.split('\n').slice(0, 5),
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error.message,
        type: error.type,
      },
      { status: 500 }
    )
  }
}
