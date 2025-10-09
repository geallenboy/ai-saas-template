import type { User } from '@/drizzle/schemas'

// ============== 用户管理相关类型 ==============

export interface UserListItem extends User {
  // 扩展字段用于列表显示
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

// ============== 表单类型 ==============

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

// ============== 用户操作类型 ==============

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

// ============== 用户过滤器类型 ==============

export interface UserFilters {
  status?: 'all' | 'active' | 'inactive'
  role?: 'all' | 'user' | 'admin' | 'super_admin'
  dateRange?: {
    start: Date
    end: Date
  }
}

// ============== 用户导出类型 ==============

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

// ============== 用户搜索类型 ==============

export interface UserSearchResult {
  users: User[]
  total: number
  query: string
  filters: UserFilters
}

// ============== 用户活动类型 ==============

export interface UserActivity {
  id: string
  userId: string
  action: string
  description: string
  metadata?: Record<string, unknown>
  createdAt: Date
}

// ============== 用户权限类型 ==============

export interface UserPermissions {
  canView: boolean
  canEdit: boolean
  canDelete: boolean
  canPromote: boolean
  canExport: boolean
  canBulkEdit: boolean
}
