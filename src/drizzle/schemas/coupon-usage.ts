import {
    decimal,
    index,
    pgTable,
    timestamp,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core'
import { coupons, paymentRecords } from './payments'
import { users } from './users'

// ===============================
// 优惠码使用记录表
// ===============================

export const couponUsage = pgTable(
    'coupon_usage',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        couponId: uuid('coupon_id')
            .notNull()
            .references(() => coupons.id),
        userId: varchar('user_id', { length: 255 })
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        paymentRecordId: uuid('payment_record_id').references(
            () => paymentRecords.id
        ),
        discountAmount: decimal('discount_amount', {
            precision: 10,
            scale: 2,
        }).notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
    },
    (table) => ({
        couponIdIdx: index('coupon_usage_coupon_id_idx').on(table.couponId),
        userIdIdx: index('coupon_usage_user_id_idx').on(table.userId),
        couponUserIdx: index('coupon_usage_coupon_user_idx').on(
            table.couponId,
            table.userId
        ),
    })
)

// ===============================
// 类型导出
// ===============================

export type CouponUsage = typeof couponUsage.$inferSelect
export type NewCouponUsage = typeof couponUsage.$inferInsert
