// ===============================
// Global type definition
// ===============================

// Import the types you need to use in this file
import type { UserMembership } from './payments'
import type { AdminLevel } from './users'

// Re-export all module types to maintain backward compatibility
export type {
  AdminLevel,
  Currency,
  Language,
  NewUser,
  Theme,
  User,
} from './users'

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
  Conversation,
  ConversationType,
  Message,
  MessageRole,
  NewConversation,
  NewMessage,
  NewPromptTemplate,
  PromptCategory,
  PromptTemplate,
  VariableType,
} from './conversations'

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

// Additional common type definitions
export type {
  ApiResponse,
  DatabaseTransaction,
  PaginationResult,
  PermissionCheck,
  QueryFilters,
} from './index'

// ===============================
// Business logic related types
// ===============================

// User permission level mapping
export type UserPermissionLevel = {
  level: AdminLevel
  permissions: string[]
  canAccessAdmin: boolean
  canManageUsers: boolean
  canViewAnalytics: boolean
}

// Membership permission check result
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

// Payment processing result
export type PaymentProcessResult = {
  success: boolean
  paymentIntentId?: string
  clientSecret?: string
  error?: string
  membership?: UserMembership
}

// AI conversation context
export type ConversationContext = {
  conversationId: string
  userId: string
  model: string
  totalTokens: number
  totalCost: number
  messageCount: number
  lastMessageAt?: Date
}

// Prompt variable values
export type PromptVariableValues = Record<string, string | number | boolean>

// System health check result
export type SystemHealthCheck = {
  status: 'healthy' | 'degraded' | 'down'
  database: boolean
  stripe: boolean
  clerk: boolean
  ai: boolean
  lastChecked: Date
}

// Analytics data type
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
