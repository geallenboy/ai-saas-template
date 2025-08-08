import type { User } from '@/drizzle/schemas'

// ============== Certification related types ==============

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
  language: 'en' | 'de'
  currency: 'USD' | 'EUR'
  timezone: string
}

// ============== Profile Update Form Types ==============

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

// ============== API response type ==============

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

// ============== Permission check type ==============

export interface PermissionResult {
  hasPermission: boolean
  reason?: string
  user?: User
}

// ============== Authentication event type ==============

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
