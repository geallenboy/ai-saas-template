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
// 会员计划表 (支持月付和年付)
// ===============================

export const membershipPlans = pgTable(
  'membership_plans',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name_en', { length: 100 }).notNull(),
    nameZh: varchar('name_zh', { length: 100 }),
    description: text('description_en'),
    descriptionZh: text('description_zh'),

    // 月付价格
    priceUSDMonthly: decimal('price_usd_monthly', {
      precision: 10,
      scale: 2,
    }).notNull(),
    priceCNYMonthly: decimal('price_cny_monthly', { precision: 10, scale: 2 }),

    // 年付价格
    priceUSDYearly: decimal('price_usd_yearly', { precision: 10, scale: 2 }),
    priceCNYYearly: decimal('price_cny_yearly', { precision: 10, scale: 2 }),

    // 年付折扣
    yearlyDiscountPercent: integer('yearly_discount_percent').default(0), // 年付折扣百分比

    // Stripe 价格ID
    stripePriceIdUSDMonthly: varchar('stripe_price_id_usd_monthly', {
      length: 255,
    }),
    stripePriceIdCNYMonthly: varchar('stripe_price_id_cny_monthly', {
      length: 255,
    }),
    stripePriceIdUSDYearly: varchar('stripe_price_id_usd_yearly', {
      length: 255,
    }),
    stripePriceIdCNYYearly: varchar('stripe_price_id_cny_yearly', {
      length: 255,
    }),

    // 功能配额
    features: jsonb('features_en').$type<string[]>().notNull().default([]),
    featuresZh: jsonb('features_zh').$type<string[]>().default([]),
    maxApiCalls: integer('max_api_calls').default(-1), // API 调用限制

    // 高级功能权限
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

    // 会员期限
    monthlyDurationDays: integer('monthly_duration_days').default(30),
    yearlyDurationDays: integer('yearly_duration_days').default(365),

    // 显示控制
    isActive: boolean('is_active').default(true),
    isPopular: boolean('is_popular').default(false),
    isFeatured: boolean('is_featured').default(false), // 特色推荐
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
// 用户会员权限表
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

    // 权限核心字段
    startDate: timestamp('start_date').notNull(),
    endDate: timestamp('end_date').notNull(),
    status: varchar('status', { length: 50 }).notNull().default('active'), // active, expired, cancelled, paused

    // 期限信息
    durationType: varchar('duration_type', { length: 20 })
      .notNull()
      .default('monthly'), // monthly, yearly
    durationDays: integer('duration_days').notNull().default(30),

    // 支付信息
    purchaseAmount: decimal('purchase_amount', {
      precision: 10,
      scale: 2,
    }).notNull(),
    currency: varchar('currency', { length: 3 }).notNull(),
    originalPrice: decimal('original_price', { precision: 10, scale: 2 }), // 原价
    discountAmount: decimal('discount_amount', {
      precision: 10,
      scale: 2,
    }).default('0'), // 折扣金额

    // Stripe 信息
    stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
    stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
    stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }), // 如果是订阅

    // 续费信息
    autoRenew: boolean('auto_renew').default(false),
    nextRenewalDate: timestamp('next_renewal_date'),
    renewalAttempts: integer('renewal_attempts').default(0),

    // 元数据
    paymentMethod: varchar('payment_method', { length: 50 }),
    locale: varchar('locale', { length: 10 }),
    source: varchar('source', { length: 50 }), // web, mobile, admin

    // 取消信息
    cancelledAt: timestamp('cancelled_at'),
    cancelReason: text('cancel_reason'),
    cancelledBy: varchar('cancelled_by', { length: 255 }), // user_id 或 admin_id

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
// 支付记录表
// ===============================

export const paymentRecords = pgTable(
  'payment_records',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    membershipId: uuid('membership_id').references(() => userMemberships.id),

    // Stripe 支付信息
    stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
    stripeCheckoutSessionId: varchar('stripe_checkout_session_id', {
      length: 255,
    }),
    stripeInvoiceId: varchar('stripe_invoice_id', { length: 255 }),

    // 金额信息
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).notNull(),
    tax: decimal('tax', { precision: 10, scale: 2 }).default('0'),
    fees: decimal('fees', { precision: 10, scale: 2 }).default('0'), // 手续费
    netAmount: decimal('net_amount', { precision: 10, scale: 2 }), // 实收金额

    // 支付状态
    status: varchar('status', { length: 50 }).notNull(), // pending, succeeded, failed, refunded, cancelled
    paymentMethod: varchar('payment_method', { length: 50 }),

    // 订单信息
    planName: varchar('plan_name', { length: 100 }).notNull(),
    durationType: varchar('duration_type', { length: 20 }).notNull(),
    membershipDurationDays: integer('membership_duration_days').notNull(),

    // 优惠信息
    couponCode: varchar('coupon_code', { length: 50 }),
    discountAmount: decimal('discount_amount', {
      precision: 10,
      scale: 2,
    }).default('0'),

    // 退款信息
    refundAmount: decimal('refund_amount', { precision: 10, scale: 2 }).default(
      '0'
    ),
    refundedAt: timestamp('refunded_at'),
    refundReason: text('refund_reason'),

    // 时间信息
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
// 用户使用限额记录表
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

    // 使用统计
    usedUseCases: integer('used_use_cases').default(0),
    usedTutorials: integer('used_tutorials').default(0),
    usedBlogs: integer('used_blogs').default(0),
    usedApiCalls: integer('used_api_calls').default(0),

    // 月度统计
    monthlyUseCases: integer('monthly_use_cases').default(0),
    monthlyTutorials: integer('monthly_tutorials').default(0),
    monthlyBlogs: integer('monthly_blogs').default(0),
    monthlyApiCalls: integer('monthly_api_calls').default(0),

    // 重置信息
    lastCheckedAt: timestamp('last_checked_at').defaultNow(),
    resetDate: timestamp('reset_date'), // 配额重置日期
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
// 优惠券表
// ===============================

export const coupons = pgTable(
  'coupons',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    code: varchar('code', { length: 50 }).notNull().unique(),
    name: varchar('name', { length: 100 }).notNull(),
    nameZh: varchar('name_zh', { length: 100 }),
    description: text('description'),

    // 折扣信息
    discountType: varchar('discount_type', { length: 20 }).notNull(), // percent, fixed
    discountValue: decimal('discount_value', {
      precision: 10,
      scale: 2,
    }).notNull(),

    // 适用范围
    applicablePlans: jsonb('applicable_plans').$type<string[]>(), // 适用计划ID
    minAmount: decimal('min_amount', { precision: 10, scale: 2 }),

    // 使用限制
    maxUses: integer('max_uses'),
    usedCount: integer('used_count').default(0),
    maxUsesPerUser: integer('max_uses_per_user').default(1),

    // 有效期
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
// 类型导出
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
// 枚举定义
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
// 关系定义
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
