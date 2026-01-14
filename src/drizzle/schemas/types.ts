// ===============================
// 全局类型定义
// ===============================

// 导入需要在本文件中使用的类型
import type { AdminLevel } from './users'

// 额外的通用类型定义
export type {
  ApiResponse,
  DatabaseTransaction,
  PaginationResult,
  QueryFilters,
} from './index'

export type {
  ApiKey,
  ApiScope,
  ConfigCategory,
  ConfigDataType,
  NewApiKey,
  NewNotification,
  NewSystemConfig,
  Notification,
  NotificationPriority,
  NotificationType,
  SystemConfig,
} from './system'
// 重新导出所有模块的类型，保持向后兼容
export type {
  AdminLevel,
  Currency,
  Language,
  NewUser,
  Theme,
  User,
} from './users'

// ===============================
// 业务逻辑相关类型
// ===============================

// 用户权限级别映射
export type UserPermissionLevel = {
  level: AdminLevel
  permissions: string[]
  canAccessAdmin: boolean
  canManageUsers: boolean
  canViewAnalytics: boolean
}

// AI对话上下文
export type ConversationContext = {
  conversationId: string
  userId: string
  model: string
  totalTokens: number
  totalCost: number
  messageCount: number
  lastMessageAt?: Date
}

// 提示词变量值
export type PromptVariableValues = Record<string, string | number | boolean>

// 系统健康检查结果
export type SystemHealthCheck = {
  status: 'healthy' | 'degraded' | 'down'
  database: boolean
  ai: boolean
  lastChecked: Date
}

// 分析数据类型
export type AnalyticsData = {
  users: {
    total: number
    active: number
    new: number
    growth: number
  }
  usage: {
    conversations: number
    messages: number
    tokens: number
    cost: number
  }
  period: {
    start: Date
    end: Date
  }
}
