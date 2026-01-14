import { relations } from 'drizzle-orm'
import { paymentRecords, userMemberships, userUsageLimits } from './payments'
import { apiKeys, notifications } from './system'
import { loginLogs, users } from './users'

// ===============================
// 用户关系定义
// ===============================
export const usersRelations = relations(users, ({ many }) => ({
  // 认证相关 (Better-Auth 统一管理)
  loginLogs: many(loginLogs),

  // 支付相关
  userMemberships: many(userMemberships),
  paymentRecords: many(paymentRecords),
  userUsageLimits: many(userUsageLimits),

  // 系统相关
  apiKeys: many(apiKeys),
  notifications: many(notifications),
}))

// ===============================
// 认证关系定义 (Better-Auth 统一管理)
// ===============================
export const loginLogsRelations = relations(loginLogs, ({ one }) => ({
  user: one(users, {
    fields: [loginLogs.userId],
    references: [users.id],
  }),
}))

// ===============================
// 支付关系定义
// ===============================
export const userMembershipsRelations = relations(
  userMemberships,
  ({ one }) => ({
    user: one(users, {
      fields: [userMemberships.userId],
      references: [users.id],
    }),
  })
)

export const paymentRecordsRelations = relations(paymentRecords, ({ one }) => ({
  user: one(users, {
    fields: [paymentRecords.userId],
    references: [users.id],
  }),
}))

export const userUsageLimitsRelations = relations(
  userUsageLimits,
  ({ one }) => ({
    user: one(users, {
      fields: [userUsageLimits.userId],
      references: [users.id],
    }),
  })
)

// ===============================
// 系统关系定义
// ===============================
export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id],
  }),
}))

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}))
