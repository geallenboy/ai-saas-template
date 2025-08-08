/**
 * Payment module constant configuration
 */

import type {
  Currency,
  MembershipStatus,
  PaymentStatus,
  PlanConfiguration,
} from '@/types/payment'

// ============== Billing cycle configuration ==============

export const BILLING_CYCLES = [
  { value: 'monthly', label: 'Monthly', labelDe: 'Monatlich' },
  { value: 'yearly', label: 'Yearly', labelDe: 'Jährlich' },
] as const

export const BILLING_CYCLE_CONFIG = {
  monthly: {
    label: 'monthly',
    labelDe: 'Monatlich',
    discount: 0,
    description: 'Billed monthly',
  },
  yearly: {
    label: 'Annual payment',
    labelDe: 'Jährliche Zahlung',
    discount: 0.16, // 16% discount (equivalent to 2 months free)
    description: 'Billed annually, save 16%',
  },
} as const

// ============== Currency allocation ==============

export const CURRENCIES: Array<{
  code: Currency
  name: string
  symbol: string
  nameDe: string
}> = [
  { code: 'USD', name: 'US Dollar', symbol: '$', nameDe: 'US-Dollar' },
  { code: 'EUR', name: 'Euro', symbol: '€', nameDe: 'Euro' },
]

export const CURRENCY_CONFIG = {
  USD: {
    symbol: '$',
    name: 'US Dollar',
    nameDe: 'US-Dollar',
    position: 'before', // Symbol position
    locale: 'en-US',
  },
  EUR: {
    symbol: '€',
    name: 'Euro',
    nameDe: 'Euro',
    position: 'before',
    locale: 'de-DE',
  },
} as const

// ============== Payment status configuration ==============

export const PAYMENT_STATUS: Record<
  PaymentStatus,
  { label: string; labelDe: string; color: string }
> = {
  pending: {
    label: 'Pending',
    labelDe: 'Ausstehend',
    color: 'bg-yellow-100 text-yellow-800',
  },
  processing: {
    label: 'Processing',
    labelDe: 'Wird bearbeitet',
    color: 'bg-blue-100 text-blue-800',
  },
  completed: {
    label: 'Completed',
    labelDe: 'Abgeschlossen',
    color: 'bg-green-100 text-green-800',
  },
  failed: {
    label: 'Failed',
    labelDe: 'Fehlgeschlagen',
    color: 'bg-red-100 text-red-800',
  },
  cancelled: {
    label: 'Cancelled',
    labelDe: 'Abgebrochen',
    color: 'bg-gray-100 text-gray-800',
  },
  refunded: {
    label: 'Refunded',
    labelDe: 'Erstattet',
    color: 'bg-purple-100 text-purple-800',
  },
}

// ============== Membership status configuration ==============

export const MEMBERSHIP_STATUS: Record<
  MembershipStatus,
  { label: string; labelDe: string; color: string }
> = {
  active: {
    label: 'Active',
    labelDe: 'Aktiv',
    color: 'bg-green-100 text-green-800',
  },
  expired: {
    label: 'Expired',
    labelDe: 'Abgelaufen',
    color: 'bg-red-100 text-red-800',
  },
  cancelled: {
    label: 'Cancelled',
    labelDe: 'Abgebrochen',
    color: 'bg-gray-100 text-gray-800',
  },
  paused: {
    label: 'Paused',
    labelDe: 'Pausiert',
    color: 'bg-yellow-100 text-yellow-800',
  },
}

// ============== Coupon type ==============

export const COUPON_TYPES = {
  percentage: {
    label: 'Percentage',
    labelDe: 'Prozentsatz',
    symbol: '%',
    description: 'Percentage discount',
    descriptionDe: 'Prozentsatzrabatt',
  },
  fixed: {
    label: 'Fixed Amount',
    labelDe: 'Fester Betrag',
    symbol: '$',
    description: 'Fixed amount discount',
    descriptionDe: 'Fester Betrag Rabatt',
  },
} as const

// ============== Payment method configuration ==============

export const PAYMENT_METHODS = [
  {
    id: 'stripe',
    name: 'Credit Card',
    nameDe: 'Kreditkarte',
    icon: '💳',
    description: 'Visa, Mastercard, American Express',
    descriptionDe: 'Visa, Mastercard, American Express',
    enabled: true,
  },
  {
    id: 'paypal',
    name: 'PayPal',
    nameDe: 'PayPal',
    icon: '🅿️',
    description: 'Pay with your PayPal account',
    descriptionDe: 'Mit Ihrem PayPal-Konto bezahlen',
    enabled: false,
  },
] as const

// ============== Default configuration ==============

export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  maxLimit: 100,
} as const

export const DEFAULT_USAGE_LIMITS = {
  free: {
    monthlyUseCases: 10,
    monthlyTutorials: 5,
    monthlyBlogs: 3,
    monthlyApiCalls: 100,
  },
  basic: {
    monthlyUseCases: 50,
    monthlyTutorials: 25,
    monthlyBlogs: 15,
    monthlyApiCalls: 1000,
  },
  pro: {
    monthlyUseCases: 200,
    monthlyTutorials: 100,
    monthlyBlogs: 50,
    monthlyApiCalls: 10000,
  },
  enterprise: {
    monthlyUseCases: -1, // Unlimited
    monthlyTutorials: -1,
    monthlyBlogs: -1,
    monthlyApiCalls: -1,
  },
} as const

// ============== Stripe configuration ==============

export const STRIPE_CONFIG = {
  webhookEvents: [
    'checkout.session.completed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'invoice.payment_succeeded',
    'invoice.payment_failed',
  ],
  subscriptionStatuses: {
    active: 'active',
    canceled: 'cancelled',
    incomplete: 'pending',
    incomplete_expired: 'expired',
    past_due: 'expired',
    trialing: 'active',
    unpaid: 'expired',
  },
} as const

// ============== Payment error messages ==============

export const PAYMENT_ERRORS = {
  PLAN_NOT_FOUND: 'Membership plan not found',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
  INVALID_COUPON: 'Invalid coupon',
  PAYMENT_FAILED: 'Payment failed',
  SUBSCRIPTION_CREATION_FAILED: 'Subscription creation failed',
  WEBHOOK_VERIFICATION_FAILED: 'Webhook verification failed',
  USAGE_LIMIT_EXCEEDED: 'Usage limit exceeded',
  MEMBERSHIP_EXPIRED: 'Membership expired',
  INVALID_PAYMENT_METHOD: 'Invalid payment method',
} as const

// ============== Success messages ==============

export const PAYMENT_SUCCESS = {
  PAYMENT_COMPLETED: 'Payment completed',
  SUBSCRIPTION_CREATED: 'Subscription created successfully',
  COUPON_APPLIED: 'Coupon applied successfully',
  USAGE_INCREMENTED: 'Usage incremented successfully',
  MEMBERSHIP_UPDATED: 'Membership updated successfully',
} as const

// ============== Utility function ==============

export function formatPrice(amount: number, currency: Currency): string {
  const config = CURRENCY_CONFIG[currency]
  const formatter = new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
  return formatter.format(amount)
}

export function calculateDiscountedPrice(
  originalPrice: number,
  discountType: 'percentage' | 'fixed',
  discountValue: number
): number {
  if (discountType === 'percentage') {
    return Math.max(0, originalPrice * (1 - discountValue / 100))
  }
  return Math.max(0, originalPrice - discountValue)
}

export function getPlanPrice(
  plan: PlanConfiguration,
  durationType: 'monthly' | 'yearly',
  currency: Currency = 'USD'
): number {
  if (durationType === 'yearly') {
    return plan.yearlyPrice[currency]
  }
  return plan.monthlyPrice[currency]
}
