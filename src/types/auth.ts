import type { User } from '@/drizzle/schemas'

// ============== 认证相关类型 ==============

export interface AuthUser extends User {
  sessionId?: string
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  isAdmin: boolean
  isLoading?: boolean
}

export interface UserPreferences {
  theme: 'light' | 'dark'
  language: 'en' | 'zh'
  currency: 'USD' | 'CNY'
  timezone: string
}

// ============== 表单类型 ==============

export interface UpdateProfileData {
  fullName?: string
  preferences?: Partial<UserPreferences>
}

export interface SignInFormData {
  email: string
  password: string
  rememberMe?: boolean
}

export interface SignUpFormData {
  email: string
  password: string
  fullName: string
  acceptTerms: boolean
}

// ============== API响应类型 ==============

export interface AuthResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface UserSyncResult {
  user: User
  isNewUser: boolean
}

// ============== 权限检查类型 ==============

export interface PermissionResult {
  hasPermission: boolean
  reason?: string
  user?: User
}

// ============== 认证事件类型 ==============

export type AuthEvent =
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'session.created'
  | 'session.ended'

export interface AuthEventData {
  userId: string
  event: AuthEvent
  timestamp: Date
  metadata?: Record<string, unknown>
}
