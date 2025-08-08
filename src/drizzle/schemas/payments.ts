import { relations } from 'drizzle-orm'
import {
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { users } from './users'

// ===============================
// Membership Plan (supports monthly and annual payment)
// ===============================

export const membershipPlans = pgTable(
  'membership_plans',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),
    nameDe: varchar('name_de', { length: 100 }),
    description: text('description'),
    descriptionDe: text('description_de'),

    // monthly payment price
    priceUSDMonthly: decimal('price_usd_monthly', {
      precision: 10,
      scale: 2,
    }).notNull(),
    priceEURMonthly: decimal('price_eur_monthly', { precision: 10, scale: 2 }),

    // yearly payment price
    priceUSDYearly: decimal('price_usd_yearly', { precision: 10, scale: 2 }),
    priceEURYearly: decimal('price_eur_yearly', { precision: 10, scale: 2 }),

    // yearly discount
    yearlyDiscountPercent: integer('yearly_discount_percent').default(0), // annual payment discount percentage

    // Stripe price ID
    stripePriceIdUSDMonthly: varchar('stripe_price_id_usd_monthly', {
      length: 255,
    }),
    stripePriceIdEURMonthly: varchar('stripe_price_id_eur_monthly', {
      length: 255,
    }),
    stripePriceIdUSDYearly: varchar('stripe_price_id_usd_yearly', {
      length: 255,
    }),
    stripePriceIdEURYearly: varchar('stripe_price_id_eur_yearly', {
      length: 255,
    }),

    // Feature quota
    features: jsonb('features').$type<string[]>().notNull().default([]),
    featuresDe: jsonb('features_de').$type<string[]>().default([]),
    maxUseCases: integer('max_use_cases').default(-1), // -1 means unlimited
    maxTutorials: integer('max_tutorials').default(-1),
    maxBlogs: integer('max_blogs').default(-1),
    maxApiCalls: integer('max_api_calls').default(-1), // API call limit

    // Advanced feature permissions
    permissions: jsonb('permissions')
      .$type<{
        apiAccess: boolean
        customModels: boolean
        prioritySupport: boolean
        exportData: boolean
        bulkOperations: boolean
        advancedAnalytics: boolean
      }>()
      .default({
        apiAccess: false,
        customModels: false,
        prioritySupport: false,
        exportData: true,
        bulkOperations: false,
        advancedAnalytics: false,
      }),

    // Membership duration
    monthlyDurationDays: integer('monthly_duration_days').default(30),
    yearlyDurationDays: integer('yearly_duration_days').default(365),

    // Display control
    isActive: boolean('is_active').default(true),
    isPopular: boolean('is_popular').default(false),
    isFeatured: boolean('is_featured').default(false), // Featured recommendation
    sortOrder: integer('sort_order').default(0),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    nameIdx: index('membership_plans_name_idx').on(table.name),
    isActiveIdx: index('membership_plans_is_active_idx').on(table.isActive),
    sortOrderIdx: index('membership_plans_sort_order_idx').on(table.sortOrder),
    isPopularIdx: index('membership_plans_is_popular_idx').on(table.isPopular),
  })
)

// ===============================
// User Memberships Table
// ===============================

export const userMemberships = pgTable(
  'user_memberships',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    planId: uuid('plan_id')
      .notNull()
      .references(() => membershipPlans.id),

    // Permission core fields
    startDate: timestamp('start_date').notNull(),
    endDate: timestamp('end_date').notNull(),
    status: varchar('status', { length: 50 }).notNull().default('active'), // active, expired, cancelled, paused

    // Duration information
    durationType: varchar('duration_type', { length: 20 })
      .notNull()
      .default('monthly'), // monthly, yearly
    durationDays: integer('duration_days').notNull().default(30),

    // Payment information
    purchaseAmount: decimal('purchase_amount', {
      precision: 10,
      scale: 2,
    }).notNull(),
    currency: varchar('currency', { length: 3 }).notNull(),
    originalPrice: decimal('original_price', { precision: 10, scale: 2 }), // Original price
    discountAmount: decimal('discount_amount', {
      precision: 10,
      scale: 2,
    }).default('0'), // Discount amount

    // Stripe information
    stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
    stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
    stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }), // If it's a subscription

    // Renewal information
    autoRenew: boolean('auto_renew').default(false),
    nextRenewalDate: timestamp('next_renewal_date'),
    renewalAttempts: integer('renewal_attempts').default(0),

    // Metadata
    paymentMethod: varchar('payment_method', { length: 50 }),
    locale: varchar('locale', { length: 10 }),
    source: varchar('source', { length: 50 }), // web, mobile, admin

    // Cancellation information
    cancelledAt: timestamp('cancelled_at'),
    cancelReason: text('cancel_reason'),
    cancelledBy: varchar('cancelled_by', { length: 255 }), // user_id or admin_id

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    userIdIdx: index('user_memberships_user_id_idx').on(table.userId),
    statusIdx: index('user_memberships_status_idx').on(table.status),
    endDateIdx: index('user_memberships_end_date_idx').on(table.endDate),
    stripeCustomerIdx: index('user_memberships_stripe_customer_idx').on(
      table.stripeCustomerId
    ),
    autoRenewIdx: index('user_memberships_auto_renew_idx').on(table.autoRenew),
  })
)

// ===============================
// Payment Records Table
// ===============================

export const paymentRecords = pgTable(
  'payment_records',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    membershipId: uuid('membership_id').references(() => userMemberships.id),

    // Stripe payment information
    stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
    stripeCheckoutSessionId: varchar('stripe_checkout_session_id', {
      length: 255,
    }),
    stripeInvoiceId: varchar('stripe_invoice_id', { length: 255 }),

    // Amount information
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).notNull(),
    tax: decimal('tax', { precision: 10, scale: 2 }).default('0'),
    fees: decimal('fees', { precision: 10, scale: 2 }).default('0'), // Handling fees
    netAmount: decimal('net_amount', { precision: 10, scale: 2 }), // Actual amount received

    // Payment status
    status: varchar('status', { length: 50 }).notNull(), // pending, succeeded, failed, refunded, cancelled
    paymentMethod: varchar('payment_method', { length: 50 }),

    // Order information
    planName: varchar('plan_name', { length: 100 }).notNull(),
    durationType: varchar('duration_type', { length: 20 }).notNull(),
    membershipDurationDays: integer('membership_duration_days').notNull(),

    // Discount information
    couponCode: varchar('coupon_code', { length: 50 }),
    discountAmount: decimal('discount_amount', {
      precision: 10,
      scale: 2,
    }).default('0'),

    // Refund information
    refundAmount: decimal('refund_amount', { precision: 10, scale: 2 }).default(
      '0'
    ),
    refundedAt: timestamp('refunded_at'),
    refundReason: text('refund_reason'),

    // Time information
    paidAt: timestamp('paid_at'),
    failedAt: timestamp('failed_at'),

    description: text('description'),
    metadata: jsonb('metadata'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    userIdIdx: index('payment_records_user_id_idx').on(table.userId),
    statusIdx: index('payment_records_status_idx').on(table.status),
    stripePaymentIntentIdx: index(
      'payment_records_stripe_payment_intent_idx'
    ).on(table.stripePaymentIntentId),
    paidAtIdx: index('payment_records_paid_at_idx').on(table.paidAt),
    createdAtIdx: index('payment_records_created_at_idx').on(table.createdAt),
  })
)

// ===============================
// User Usage Limits Table
// ===============================

export const userUsageLimits = pgTable(
  'user_usage_limits',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    membershipId: uuid('membership_id').references(() => userMemberships.id),

    // Usage statistics
    usedUseCases: integer('used_use_cases').default(0),
    usedTutorials: integer('used_tutorials').default(0),
    usedBlogs: integer('used_blogs').default(0),
    usedApiCalls: integer('used_api_calls').default(0),

    // Monthly statistics
    monthlyUseCases: integer('monthly_use_cases').default(0),
    monthlyTutorials: integer('monthly_tutorials').default(0),
    monthlyBlogs: integer('monthly_blogs').default(0),
    monthlyApiCalls: integer('monthly_api_calls').default(0),

    // Renewal information
    lastCheckedAt: timestamp('last_checked_at').defaultNow(),
    resetDate: timestamp('reset_date'), // Quota reset date
    currentPeriodStart: timestamp('current_period_start'),
    currentPeriodEnd: timestamp('current_period_end'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    userIdIdx: index('user_usage_limits_user_id_idx').on(table.userId),
    membershipIdIdx: index('user_usage_limits_membership_id_idx').on(
      table.membershipId
    ),
    resetDateIdx: index('user_usage_limits_reset_date_idx').on(table.resetDate),
  })
)

// ===============================
// Coupons Table
// ===============================

export const coupons = pgTable(
  'coupons',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    code: varchar('code', { length: 50 }).notNull().unique(),
    name: varchar('name', { length: 100 }).notNull(),
    nameDe: varchar('name_de', { length: 100 }),
    description: text('description'),

    // Discount information
    discountType: varchar('discount_type', { length: 20 }).notNull(), // percent, fixed
    discountValue: decimal('discount_value', {
      precision: 10,
      scale: 2,
    }).notNull(),

    // Applicable plans
    applicablePlans: jsonb('applicable_plans').$type<string[]>(), // Applicable plan IDs
    minAmount: decimal('min_amount', { precision: 10, scale: 2 }),

    // Usage limits
    maxUses: integer('max_uses'),
    usedCount: integer('used_count').default(0),
    maxUsesPerUser: integer('max_uses_per_user').default(1),

    // Validity period
    startsAt: timestamp('starts_at'),
    expiresAt: timestamp('expires_at'),

    isActive: boolean('is_active').default(true),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    codeIdx: index('coupons_code_idx').on(table.code),
    activeIdx: index('coupons_active_idx').on(table.isActive),
    expiresAtIdx: index('coupons_expires_at_idx').on(table.expiresAt),
  })
)

// ===============================
// Type export
// ===============================

export type MembershipPlan = typeof membershipPlans.$inferSelect
export type NewMembershipPlan = typeof membershipPlans.$inferInsert

export type UserMembership = typeof userMemberships.$inferSelect
export type NewUserMembership = typeof userMemberships.$inferInsert

export type PaymentRecord = typeof paymentRecords.$inferSelect
export type NewPaymentRecord = typeof paymentRecords.$inferInsert

export type UserUsageLimit = typeof userUsageLimits.$inferSelect
export type NewUserUsageLimit = typeof userUsageLimits.$inferInsert

export type Coupon = typeof coupons.$inferSelect
export type NewCoupon = typeof coupons.$inferInsert

// ===============================
// Enum definitions
// ===============================

export enum MembershipStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  PAUSED = 'paused',
}

export enum DurationType {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

export enum DiscountType {
  PERCENT = 'percent',
  FIXED = 'fixed',
}

export enum PaymentSource {
  WEB = 'web',
  MOBILE = 'mobile',
  ADMIN = 'admin',
}

// ===============================
// Relations definitions
// ===============================

export const membershipPlansRelations = relations(
  membershipPlans,
  ({ many }) => ({
    userMemberships: many(userMemberships),
  })
)

export const userMembershipsRelations = relations(
  userMemberships,
  ({ one }) => ({
    user: one(users, {
      fields: [userMemberships.userId],
      references: [users.id],
    }),
    plan: one(membershipPlans, {
      fields: [userMemberships.planId],
      references: [membershipPlans.id],
    }),
  })
)

export const userUsageLimitsRelations = relations(
  userUsageLimits,
  ({ one }) => ({
    user: one(users, {
      fields: [userUsageLimits.userId],
      references: [users.id],
    }),
  })
)

export const paymentRecordsRelations = relations(paymentRecords, ({ one }) => ({
  user: one(users, {
    fields: [paymentRecords.userId],
    references: [users.id],
  }),
  membership: one(userMemberships, {
    fields: [paymentRecords.membershipId],
    references: [userMemberships.id],
  }),
}))
