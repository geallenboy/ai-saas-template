// ===============================
// 全局类型定义
// ===============================

// 导入需要在本文件中使用的类型
import type { UserMembership } from './payments'
import type { AdminLevel } from './users'

// 额外的通用类型定义
export type {
  ApiResponse,
  DatabaseTransaction,
  PaginationResult,
  PermissionCheck,
  QueryFilters,
} from './index'
export type {
  Coupon,
  DiscountType,
  DurationType,
  MembershipPlan,
  MembershipStatus,
  NewCoupon,
  NewMembershipPlan,
  NewPaymentRecord,
  NewUserMembership,
  NewUserUsageLimit,
  PaymentRecord,
  PaymentSource,
  PaymentStatus,
  UserMembership,
  UserUsageLimit,
} from './payments'

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

// 会员权限检查结果
export type MembershipPermissionResult = {
  isValid: boolean
  isActive: boolean
  isExpired: boolean
  daysRemaining: number
  features: string[]
  limits: {
    useCases: { used: number; max: number; unlimited: boolean }
    tutorials: { used: number; max: number; unlimited: boolean }
    blogs: { used: number; max: number; unlimited: boolean }
    apiCalls: { used: number; max: number; unlimited: boolean }
  }
}

// 支付处理结果
export type PaymentProcessResult = {
  success: boolean
  paymentIntentId?: string
  clientSecret?: string
  error?: string
  membership?: UserMembership
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
  stripe: boolean
  clerk: boolean
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
  memberships: {
    total: number
    active: number
    expired: number
    revenue: number
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
