// ============== User management constants ==============

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const

export const USER_ROLE = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
} as const

// ============== User list configuration ==============

export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

export const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Registration Time' },
  { value: 'email', label: 'Email' },
  { value: 'fullName', label: 'Full Name' },
  { value: 'lastLoginAt', label: 'Last Login' },
] as const

export const SORT_ORDERS = [
  { value: 'desc', label: 'Descending' },
  { value: 'asc', label: 'Ascending' },
] as const

// ============== User status labels ==============

export const STATUS_LABELS = {
  [USER_STATUS.ACTIVE]: 'Active',
  [USER_STATUS.INACTIVE]: 'Inactive',
} as const

export const STATUS_COLORS = {
  [USER_STATUS.ACTIVE]: 'bg-green-100 text-green-800',
  [USER_STATUS.INACTIVE]: 'bg-red-100 text-red-800',
} as const

// ============== User role label ==============

export const ROLE_LABELS = {
  [USER_ROLE.USER]: 'Regular User',
  [USER_ROLE.ADMIN]: 'Administrator',
  [USER_ROLE.SUPER_ADMIN]: 'Super Administrator',
} as const

export const ROLE_COLORS = {
  [USER_ROLE.USER]: 'bg-gray-100 text-gray-800',
  [USER_ROLE.ADMIN]: 'bg-blue-100 text-blue-800',
  [USER_ROLE.SUPER_ADMIN]: 'bg-purple-100 text-purple-800',
} as const

// ============== Administrator permission levels ==============

export const ADMIN_LEVELS = {
  USER: 0,
  ADMIN: 1,
  SUPER_ADMIN: 2,
} as const

export const ADMIN_LEVEL_LABELS = {
  [ADMIN_LEVELS.USER]: 'Regular User',
  [ADMIN_LEVELS.ADMIN]: 'Administrator',
  [ADMIN_LEVELS.SUPER_ADMIN]: 'Super Administrator',
} as const

// ============== User operation permissions ==============

export const USER_PERMISSIONS = {
  VIEW_USERS: 'view_users',
  CREATE_USER: 'create_user',
  EDIT_USER: 'edit_user',
  DELETE_USER: 'delete_user',
  MANAGE_ADMINS: 'manage_admins',
  BULK_OPERATIONS: 'bulk_operations',
  EXPORT_USERS: 'export_users',
} as const

// ============== 批量操作选项 ==============

export const BULK_ACTIONS = [
  { value: 'activate', label: 'Activate user', requiresConfirm: false },
  { value: 'deactivate', label: 'Deactivate user', requiresConfirm: true },
  { value: 'promote', label: 'Promote to admin', requiresConfirm: true },
  { value: 'demote', label: 'Demote from admin', requiresConfirm: true },
  { value: 'delete', label: 'Delete user', requiresConfirm: true },
] as const

// ============== User search configuration ==============

export const SEARCH_FIELDS = [
  { value: 'email', label: 'Email' },
  { value: 'fullName', label: 'Full Name' },
  { value: 'all', label: 'All Fields' },
] as const

// ============== User export configuration ==============

export const EXPORT_FORMATS = [
  { value: 'csv', label: 'CSV', mimeType: 'text/csv' },
  {
    value: 'xlsx',
    label: 'Excel',
    mimeType:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
  { value: 'json', label: 'JSON', mimeType: 'application/json' },
] as const

export const EXPORT_FIELDS = [
  { key: 'id', label: 'User ID', required: true },
  { key: 'email', label: 'Email', required: true },
  { key: 'fullName', label: 'Full Name', required: false },
  { key: 'isAdmin', label: 'Administrator', required: false },
  { key: 'isActive', label: 'Status', required: false },
  { key: 'createdAt', label: 'Registration Date', required: false },
  { key: 'lastLoginAt', label: 'Last Login', required: false },
  { key: 'totalUseCases', label: 'Total Use Cases', required: false },
  { key: 'totalTutorials', label: 'Total Tutorials', required: false },
  { key: 'totalBlogs', label: 'Total Blogs', required: false },
] as const

// ============== User activity types ==============

export const USER_ACTIVITY_TYPES = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  PROFILE_UPDATE: 'profile_update',
  PASSWORD_CHANGE: 'password_change',
  ADMIN_ACTION: 'admin_action',
} as const

// ============== User error messages ==============

export const USER_ERRORS = {
  NOT_FOUND: 'User not found',
  EMAIL_EXISTS: 'Email already exists',
  INVALID_EMAIL: 'Invalid email format',
  PERMISSION_DENIED: 'Permission denied',
  CANNOT_DELETE_SELF: 'Cannot delete own account',
  CANNOT_DELETE_SUPER_ADMIN: 'Cannot delete super administrator account',
  BULK_OPERATION_FAILED: 'Bulk operation failed',
} as const
