/**
 * Payment module type definition
 */

import type {
  Coupon,
  MembershipPlan,
  PaymentRecord,
  UserMembership,
  UserUsageLimit,
} from '@/drizzle/schemas'

// ============== Basic export type ==============

export type {
  Coupon,
  MembershipPlan,
  PaymentRecord,
  UserMembership,
  UserUsageLimit,
}

// ============== Query parameter type ==============

export interface MembershipPlanQueryParams {
  isActive?: boolean
  currency?: 'USD' | 'CNY'
}

export interface UserMembershipQueryParams {
  page?: number
  limit?: number
}

export interface PaymentRecordQueryParams {
  page?: number
  limit?: number
  status?: string
}

export interface MembershipAdminQueryParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  planId?: string
}

// ============== Paginated result type ==============

export interface PaginatedMemberships {
  memberships: UserMembership[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginatedPayments {
  payments: PaymentRecord[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginatedMembershipsAdmin {
  memberships: Array<{
    membership: UserMembership
    user: any
    plan: MembershipPlan
  }>
  total: number
  page: number
  limit: number
  totalPages: number
}

// ============== User membership status type ==============

export interface UserMembershipStatus {
  membership: (UserMembership & { plan?: MembershipPlan }) | null
  usageLimits: UserUsageLimit | null
  hasActiveMembership: boolean
  currentPlan: MembershipPlan | null
  remainingDays: number
  isExpired: boolean
  canUpgrade: boolean
  nextExpiryDate: Date | null
  usage: UserUsageLimit | null
}

export interface UsageLimitCheck {
  canUse: boolean
  remaining: number
  limit: number
  used?: number
  resetDate?: Date
}

// ============== Payment operation type ==============

export interface CreateCheckoutSessionInput {
  planId?: string // Maintain backward compatibility
  priceId: string
  planName: string
  durationType: 'monthly' | 'yearly'
  paymentMethod: 'card' | 'alipay'
  locale: string
  couponCode?: string
  successUrl?: string
  cancelUrl?: string
}

export interface CheckoutSessionResult {
  sessionId: string
  url: string
  amount: number
  currency: string
  planName: string
}

// ============== Coupon related types ==============

export interface CouponValidationResult {
  isValid: boolean
  coupon?: Coupon
  error?: string
}

// ============== Payment statistics type ==============

export interface PaymentStats {
  totalRevenue: number
  totalPayments: number
  successfulPayments: number
  thisMonthRevenue: number
}

export interface MembershipStats {
  totalMemberships: number
  activeMemberships: number
  expiredMemberships: number
  cancelledMemberships: number
  monthlyRecurringRevenue: number
  churnRate: number
}

// ============== API response type ==============

export interface PaymentApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface UsageIncrementResult {
  success: boolean
  error?: string
}

// ============== Payment method type ==============

export type PaymentMethod = 'stripe' | 'paypal' | 'alipay' | 'wechat'

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded'

export type MembershipStatus = 'active' | 'expired' | 'cancelled' | 'paused'

export type DurationType = 'monthly' | 'yearly'

export type Currency = 'USD' | 'CNY'

export type UsageType = 'useCases' | 'tutorials' | 'blogs' | 'apiCalls'

// ============== Membership program related types ==============

export interface PlanFeature {
  name: string
  included: boolean
  limit?: number
  description?: string
}

export interface PlanConfiguration {
  id: string
  name: string
  nameZh?: string
  description?: string
  descriptionZh?: string
  features: PlanFeature[]
  monthlyPrice: {
    USD: number
    CNY: number
  }
  yearlyPrice: {
    USD: number
    CNY: number
  }
  isPopular?: boolean
  sortOrder: number
}

// ============== Payment history type ==============

export interface PaymentHistoryItem {
  id: string
  amount: number
  currency: Currency
  status: PaymentStatus
  planName: string
  durationType: DurationType
  createdAt: Date
  stripePaymentIntentId?: string
}

// ============== Stripe related types ==============

export interface StripeCustomer {
  id: string
  email: string
  name?: string
  metadata?: Record<string, string>
}

export interface StripeSubscription {
  id: string
  customerId: string
  priceId: string
  status: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
}

export interface StripeWebhookEvent {
  type: string
  data: {
    object: any
  }
  created: number
  livemode: boolean
}

// ============== Error type ==============

export interface PaymentError {
  code: string
  message: string
  details?: Record<string, any>
}

// ============== Form data type ==============

export interface CheckoutFormData {
  planId: string
  durationType: DurationType
  couponCode?: string
  email: string
  paymentMethodId: string
}

export interface CouponFormData {
  code: string
}

// ============== Administrator related types ==============

export interface AdminMembershipFilters {
  status?: MembershipStatus
  planId?: string
  startDate?: Date
  endDate?: Date
  search?: string
}

export interface AdminPaymentFilters {
  status?: PaymentStatus
  startDate?: Date
  endDate?: Date
  minAmount?: number
  maxAmount?: number
}

// ============== Usage limit related types ==============

export interface UsageLimitSettings {
  monthlyUseCases: number
  monthlyTutorials: number
  monthlyBlogs: number
  monthlyApiCalls: number
}

export interface UsageSummary {
  useCases: {
    used: number
    limit: number
    remaining: number
  }
  tutorials: {
    used: number
    limit: number
    remaining: number
  }
  blogs: {
    used: number
    limit: number
    remaining: number
  }
  apiCalls: {
    used: number
    limit: number
    remaining: number
  }
  resetDate: Date
}
