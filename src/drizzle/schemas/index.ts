// ===============================
// 导入所有表定义
// ===============================

import * as relations from './relations'
import { apiKeys, notifications, systemConfigs } from './system'
import {
  accounts,
  loginLogs,
  sessions,
  users,
  verificationTokens,
} from './users'

// ===============================
// 系统模块导出
// ===============================
export {
  type ApiKey,
  ApiScope,
  apiKeys,
  ConfigCategory,
  ConfigDataType,
  type NewApiKey,
  type NewNotification,
  type NewSystemConfig,
  type Notification,
  NotificationPriority,
  NotificationType,
  notifications,
  type SystemConfig,
  systemConfigs,
} from './system'
// ===============================
// 用户模块导出
// ===============================
export {
  type Account,
  AdminLevel,
  accounts,
  Currency,
  Language,
  type LoginLog,
  loginLogs,
  type NewAccount,
  type NewLoginLog,
  type NewSession,
  type NewUser,
  type NewVerificationToken,
  type Session,
  sessions,
  Theme,
  type User,
  users,
  type VerificationToken,
  verificationTokens,
} from './users'

// ===============================
// 所有表的联合导出 (用于Drizzle Kit)
// ===============================
export const schema = {
  // 用户模块 (已整合 Better Auth)
  users,
  sessions,
  accounts,
  verificationTokens,
  loginLogs,

  // 系统模块
  apiKeys,
  notifications,
  systemConfigs,

  // 关系定义
  ...relations,
}

// ===============================
// 全局类型定义
// ===============================

// 通用查询结果类型
export type PaginationResult<T> = {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// API响应类型
export type ApiResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 数据库事务类型
export type DatabaseTransaction = Parameters<
  Parameters<typeof import('@/lib/db').db.transaction>[0]
>[0]

// 查询过滤器类型
export type QueryFilters = {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  startDate?: Date
  endDate?: Date
}
