import type { User } from '@/drizzle/schemas'

// ============== User management related types ==============

export interface UserListItem extends User {
  //  Extended fields for list display
  statusLabel?: string
  roleLabel?: string
}

export interface UserQueryParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: 'createdAt' | 'email' | 'fullName' | 'lastLoginAt'
  sortOrder?: 'asc' | 'desc'
  isActive?: boolean
  isAdmin?: boolean
}

export interface UserQueryResult {
  users: User[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface UserStats {
  totalUsers: number
  activeUsers: number
  adminUsers: number
  newUsersThisMonth: number
}

// ============== Form data type ==============

export interface CreateUserData {
  email: string
  fullName?: string
  isAdmin?: boolean
}

export interface UpdateUserData {
  fullName?: string
  isAdmin?: boolean
  isActive?: boolean
  adminLevel?: number
}

export interface BulkUpdateData {
  isActive?: boolean
  isAdmin?: boolean
}

// ============== User action types ==============

export type UserAction =
  | 'view'
  | 'edit'
  | 'delete'
  | 'toggle_status'
  | 'promote_admin'
  | 'demote_admin'

export interface UserActionResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// ============== User filters type ==============

export interface UserFilters {
  status?: 'all' | 'active' | 'inactive'
  role?: 'all' | 'user' | 'admin' | 'super_admin'
  dateRange?: {
    start: Date
    end: Date
  }
}

// ============== User export type ==============

export interface UserExportData {
  id: string
  email: string
  fullName: string | null
  isAdmin: boolean
  isActive: boolean
  createdAt: string
  lastLoginAt: string | null
  totalUseCases: number
  totalTutorials: number
  totalBlogs: number
}

// ============== User search type ==============

export interface UserSearchResult {
  users: User[]
  total: number
  query: string
  filters: UserFilters
}

// ============== User activity type ==============

export interface UserActivity {
  id: string
  userId: string
  action: string
  description: string
  metadata?: Record<string, unknown>
  createdAt: Date
}

// ============== User permissions type ==============

export interface UserPermissions {
  canView: boolean
  canEdit: boolean
  canDelete: boolean
  canPromote: boolean
  canExport: boolean
  canBulkEdit: boolean
}
