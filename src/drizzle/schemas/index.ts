// ===============================
// Import all table definitions
// ===============================
import { conversations, messages, promptTemplates } from './conversations'
import {
  type UserMembership,
  type UserUsageLimit,
  coupons,
  membershipPlans,
  paymentRecords,
  userMemberships,
  userUsageLimits,
} from './payments'
import { apiKeys, notifications, systemConfigs } from './system'
import { users } from './users'

// ===============================
// User module export
// ===============================
export {
  AdminLevel,
  Currency,
  Language,
  Theme,
  users,
  type NewUser,
  type User,
} from './users'

// ===============================
// Payment module export
// ===============================
export {
  DiscountType,
  DurationType,
  MembershipStatus,
  PaymentSource,
  PaymentStatus,
  coupons,
  membershipPlans,
  paymentRecords,
  userMemberships,
  userUsageLimits,
  type Coupon,
  type MembershipPlan,
  type NewCoupon,
  type NewMembershipPlan,
  type NewPaymentRecord,
  type NewUserMembership,
  type NewUserUsageLimit,
  type PaymentRecord,
  type UserMembership,
  type UserUsageLimit,
} from './payments'

// ===============================
// AI conversation module export
// ===============================
export {
  ConversationType,
  MessageRole,
  PromptCategory,
  VariableType,
  conversations,
  messages,
  promptTemplates,
  type Conversation,
  type Message,
  type NewConversation,
  type NewMessage,
  type NewPromptTemplate,
  type PromptTemplate,
} from './conversations'

// ===============================
// System module export
// ===============================
export {
  ApiScope,
  ConfigCategory,
  ConfigDataType,
  NotificationPriority,
  NotificationType,
  apiKeys,
  notifications,
  systemConfigs,
  type ApiKey,
  type NewApiKey,
  type NewNotification,
  type NewSystemConfig,
  type Notification,
  type SystemConfig,
} from './system'

// ===============================
// Joint export of all tables (for Drizzle Kit)
// ===============================
export const schema = {
  // User module
  users,

  // Payment module
  membershipPlans,
  userMemberships,
  paymentRecords,
  userUsageLimits,
  coupons,

  // AI conversation module
  conversations,
  messages,
  promptTemplates,

  // System module
  apiKeys,
  notifications,
  systemConfigs,
}

// ===============================
// Global type definitions
// ===============================

// Common query result type
export type PaginationResult<T> = {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// API response type
export type ApiResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Database transaction type
export type DatabaseTransaction = Parameters<
  Parameters<typeof import('@/lib/db').db.transaction>[0]
>[0]

// Query filter type
export type QueryFilters = {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  startDate?: Date
  endDate?: Date
}

// User permission check results
export type PermissionCheck = {
  hasPermission: boolean
  reason?: string
  membership?: UserMembership
  limits?: UserUsageLimit
}
