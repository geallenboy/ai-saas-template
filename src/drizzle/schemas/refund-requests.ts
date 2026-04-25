import {
    decimal,
    index,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core'
import { paymentRecords } from './payments'
import { users } from './users'

// ===============================
// 退款请求表
// ===============================

export const refundRequests = pgTable(
    'refund_requests',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        paymentRecordId: uuid('payment_record_id')
            .notNull()
            .references(() => paymentRecords.id),
        userId: varchar('user_id', { length: 255 })
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        reason: text('reason').notNull(),
        // pending, approved, rejected, processed
        status: varchar('status', { length: 30 }).notNull().default('pending'),
        requestedAmount: decimal('requested_amount', {
            precision: 10,
            scale: 2,
        }).notNull(),
        approvedAmount: decimal('approved_amount', { precision: 10, scale: 2 }),
        adminId: varchar('admin_id', { length: 255 }).references(() => users.id),
        adminNote: text('admin_note'),
        stripeRefundId: varchar('stripe_refund_id', { length: 255 }),
        processedAt: timestamp('processed_at'),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().notNull(),
    },
    (table) => ({
        userIdIdx: index('refund_requests_user_id_idx').on(table.userId),
        statusIdx: index('refund_requests_status_idx').on(table.status),
        paymentRecordIdIdx: index('refund_requests_payment_record_idx').on(
            table.paymentRecordId
        ),
    })
)

// ===============================
// 类型导出
// ===============================

export type RefundRequest = typeof refundRequests.$inferSelect
export type NewRefundRequest = typeof refundRequests.$inferInsert
