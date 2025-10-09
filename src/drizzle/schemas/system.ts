import {
  boolean,
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
// API 密钥表
// ===============================

export const apiKeys = pgTable(
  'api_keys',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    name: varchar('name', { length: 100 }).notNull(),
    keyHash: text('key_hash').notNull().unique(),
    keyPrefix: varchar('key_prefix', { length: 10 }).notNull(),

    scopes: jsonb('scopes').$type<string[]>().default(['ai:chat']),

    requestsUsed: integer('requests_used').default(0),
    requestsLimit: integer('requests_limit').default(1000),
    lastUsedAt: timestamp('last_used_at'),

    isActive: boolean('is_active').default(true),
    expiresAt: timestamp('expires_at'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => ({
    userIdIdx: index('api_keys_user_id_idx').on(table.userId),
    keyHashIdx: index('api_keys_key_hash_idx').on(table.keyHash),
    activeIdx: index('api_keys_active_idx').on(table.isActive),
  })
)

// ===============================
// 通知表
// ===============================

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    type: varchar('type', { length: 50 }).notNull(),
    title: varchar('title', { length: 200 }).notNull(),
    titleZh: varchar('title_zh', { length: 200 }),
    message: text('message').notNull(),
    messageZh: text('message_zh'),

    isRead: boolean('is_read').default(false),
    readAt: timestamp('read_at'),

    data: jsonb('data').$type<{
      actionUrl?: string
      priority: 'low' | 'medium' | 'high'
    }>(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => ({
    userIdIdx: index('notifications_user_id_idx').on(table.userId),
    typeIdx: index('notifications_type_idx').on(table.type),
    isReadIdx: index('notifications_is_read_idx').on(table.isRead),
  })
)

// ===============================
// 系统配置表
// ===============================

export const systemConfigs = pgTable(
  'system_configs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    key: varchar('key', { length: 100 }).notNull().unique(),
    value: jsonb('value').notNull(),
    description: text('description'),
    category: varchar('category', { length: 50 }).notNull(),

    dataType: varchar('data_type', { length: 20 }).notNull(),
    isEditable: boolean('is_editable').default(true),
    isSecret: boolean('is_secret').default(false),

    updatedBy: varchar('updated_by', { length: 255 }).references(
      () => users.id
    ),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    keyIdx: index('system_configs_key_idx').on(table.key),
    categoryIdx: index('system_configs_category_idx').on(table.category),
  })
)

// ===============================
// 类型导出
// ===============================

export type ApiKey = typeof apiKeys.$inferSelect
export type NewApiKey = typeof apiKeys.$inferInsert

export type Notification = typeof notifications.$inferSelect
export type NewNotification = typeof notifications.$inferInsert

export type SystemConfig = typeof systemConfigs.$inferSelect
export type NewSystemConfig = typeof systemConfigs.$inferInsert

// ===============================
// 枚举定义
// ===============================

export enum ApiScope {
  AI_CHAT = 'ai:chat',
  AI_COMPLETION = 'ai:completion',
  USER_READ = 'user:read',
  USER_WRITE = 'user:write',
  ANALYTICS_READ = 'analytics:read',
}

export enum NotificationType {
  MEMBERSHIP_EXPIRING = 'membership_expiring',
  MEMBERSHIP_EXPIRED = 'membership_expired',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',
  USAGE_LIMIT_WARNING = 'usage_limit_warning',
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum ConfigDataType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  JSON = 'json',
  ARRAY = 'array',
}

export enum ConfigCategory {
  GENERAL = 'general',
  PAYMENT = 'payment',
  AI = 'ai',
  NOTIFICATION = 'notification',
  SECURITY = 'security',
  FEATURE = 'feature',
}
