import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core'

// ===============================
// Better-Auth 用户表
// ===============================

export const users = pgTable(
  'user',
  {
    // Better-Auth 核心字段
    id: text('id').primaryKey(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').notNull().default(false),
    name: text('name'),
    image: text('image'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),

    // Username plugin 字段
    username: text('username').unique(),
    displayUsername: text('display_username'),

    // Admin plugin 字段
    role: text('role').default('user'),

    // 扩展字段
    fullName: text('full_name'),
    isAdmin: boolean('is_admin').default(false),
    adminLevel: integer('admin_level').default(0), // 0=普通用户, 1=管理员, 2=超级管理员
    isActive: boolean('is_active').default(true),
    banned: boolean('banned').default(false), // 是否封禁
    banReason: text('ban_reason'), // 封禁原因
    banExpires: timestamp('ban_expires'), // 封禁到期时间
    locale: varchar('locale', { length: 10 }).default('zh'),
    preferences: jsonb('preferences')
      .$type<{
        theme: 'light' | 'dark'
        language: 'en' | 'zh'
        currency: 'USD' | 'CNY'
        timezone: string
      }>()
      .default({
        theme: 'light',
        language: 'zh',
        currency: 'CNY',
        timezone: 'Asia/Shanghai',
      }),
  },
  table => ({
    emailIdx: index('user_email_idx').on(table.email),
    isActiveIdx: index('user_is_active_idx').on(table.isActive),
    isAdminIdx: index('user_is_admin_idx').on(table.isAdmin),
  })
)

// ===============================
// Better-Auth 会话表
// ===============================

export const sessions = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // 扩展字段
    deviceName: varchar('device_name', { length: 100 }),
    location: varchar('location', { length: 100 }),
    lastActiveAt: timestamp('last_active_at').defaultNow(),
  },
  table => ({
    tokenIdx: index('session_token_idx').on(table.token),
    userIdIdx: index('session_user_id_idx').on(table.userId),
    expiresAtIdx: index('session_expires_at_idx').on(table.expiresAt),
  })
)

// ===============================
// Better-Auth 账户表
// ===============================

export const accounts = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  table => ({
    userIdIdx: index('account_user_id_idx').on(table.userId),
    providerAccountIdx: index('account_provider_account_idx').on(
      table.providerId,
      table.accountId
    ),
    // 添加复合唯一约束，防止重复账户
    providerUserIdx: index('account_provider_user_idx').on(
      table.providerId,
      table.userId
    ),
  })
)

// ===============================
// Better-Auth 验证表
// ===============================

export const verificationTokens = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  table => ({
    identifierIdx: index('verification_identifier_idx').on(table.identifier),
    valueIdx: index('verification_value_idx').on(table.value),
  })
)

// ===============================
// 登录日志表 (保留原有功能)
// ===============================

export const loginLogs = pgTable(
  'login_logs',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').references(() => users.id, {
      onDelete: 'set null',
    }),

    // 登录信息
    email: varchar('email', { length: 255 }).notNull(),
    success: boolean('success').notNull(),
    failureReason: varchar('failure_reason', { length: 100 }),

    // 设备和位置信息
    userAgent: text('user_agent'),
    ipAddress: varchar('ip_address', { length: 45 }),
    location: varchar('location', { length: 100 }),

    // 时间戳
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => ({
    userIdIdx: index('login_logs_user_id_idx').on(table.userId),
    emailIdx: index('login_logs_email_idx').on(table.email),
    createdAtIdx: index('login_logs_created_at_idx').on(table.createdAt),
    successIdx: index('login_logs_success_idx').on(table.success),
  })
)

// ===============================
// 类型导出
// ===============================

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
export type Account = typeof accounts.$inferSelect
export type NewAccount = typeof accounts.$inferInsert
export type VerificationToken = typeof verificationTokens.$inferSelect
export type NewVerificationToken = typeof verificationTokens.$inferInsert
export type LoginLog = typeof loginLogs.$inferSelect
export type NewLoginLog = typeof loginLogs.$inferInsert

// ===============================
// 枚举定义
// ===============================

export enum AdminLevel {
  USER = 0,
  ADMIN = 1,
  SUPER_ADMIN = 2,
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

export enum Language {
  EN = 'en',
  ZH = 'zh',
}

export enum Currency {
  USD = 'USD',
  CNY = 'CNY',
}
