import {
    decimal,
    index,
    integer,
    pgTable,
    timestamp,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core'

import { aiChatSessions } from './aichat'
import { users } from './users'

// ===============================
// AI Token 使用量表
// ===============================

export const aiTokenUsage = pgTable(
    'ai_token_usage',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        userId: varchar('user_id', { length: 255 })
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        sessionId: uuid('session_id').references(() => aiChatSessions.id, {
            onDelete: 'set null',
        }),
        modelId: varchar('model_id', { length: 100 }).notNull(),
        inputTokens: integer('input_tokens').notNull().default(0),
        outputTokens: integer('output_tokens').notNull().default(0),
        totalTokens: integer('total_tokens').notNull().default(0),
        costUsd: decimal('cost_usd', { precision: 10, scale: 6 })
            .notNull()
            .default('0'),
        createdAt: timestamp('created_at').defaultNow().notNull(),
    },
    (table) => ({
        userIdIdx: index('ai_token_usage_user_id_idx').on(table.userId),
        sessionIdIdx: index('ai_token_usage_session_id_idx').on(table.sessionId),
        createdAtIdx: index('ai_token_usage_created_at_idx').on(table.createdAt),
        modelIdIdx: index('ai_token_usage_model_id_idx').on(table.modelId),
    })
)

// ===============================
// 类型导出
// ===============================

export type AiTokenUsage = typeof aiTokenUsage.$inferSelect
export type NewAiTokenUsage = typeof aiTokenUsage.$inferInsert
