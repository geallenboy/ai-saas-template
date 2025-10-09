// ============== 用户管理常量 ==============

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const

export const USER_ROLE = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
} as const

// ============== 用户列表配置 ==============

export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

export const SORT_OPTIONS = [
  { value: 'createdAt', label: '注册时间' },
  { value: 'email', label: '邮箱' },
  { value: 'fullName', label: '姓名' },
  { value: 'lastLoginAt', label: '最后登录' },
] as const

export const SORT_ORDERS = [
  { value: 'desc', label: '降序' },
  { value: 'asc', label: '升序' },
] as const

// ============== 用户状态标签 ==============

export const STATUS_LABELS = {
  [USER_STATUS.ACTIVE]: '活跃',
  [USER_STATUS.INACTIVE]: '已禁用',
} as const

export const STATUS_COLORS = {
  [USER_STATUS.ACTIVE]: 'bg-green-100 text-green-800',
  [USER_STATUS.INACTIVE]: 'bg-red-100 text-red-800',
} as const

// ============== 用户角色标签 ==============

export const ROLE_LABELS = {
  [USER_ROLE.USER]: '普通用户',
  [USER_ROLE.ADMIN]: '管理员',
  [USER_ROLE.SUPER_ADMIN]: '超级管理员',
} as const

export const ROLE_COLORS = {
  [USER_ROLE.USER]: 'bg-gray-100 text-gray-800',
  [USER_ROLE.ADMIN]: 'bg-blue-100 text-blue-800',
  [USER_ROLE.SUPER_ADMIN]: 'bg-purple-100 text-purple-800',
} as const

// ============== 管理员权限级别 ==============

export const ADMIN_LEVELS = {
  USER: 0,
  ADMIN: 1,
  SUPER_ADMIN: 2,
} as const

export const ADMIN_LEVEL_LABELS = {
  [ADMIN_LEVELS.USER]: '普通用户',
  [ADMIN_LEVELS.ADMIN]: '管理员',
  [ADMIN_LEVELS.SUPER_ADMIN]: '超级管理员',
} as const

// ============== 用户操作权限 ==============

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
  { value: 'activate', label: '激活用户', requiresConfirm: false },
  { value: 'deactivate', label: '禁用用户', requiresConfirm: true },
  { value: 'promote', label: '设为管理员', requiresConfirm: true },
  { value: 'demote', label: '取消管理员', requiresConfirm: true },
  { value: 'delete', label: '删除用户', requiresConfirm: true },
] as const

// ============== 用户搜索配置 ==============

export const SEARCH_FIELDS = [
  { value: 'email', label: '邮箱' },
  { value: 'fullName', label: '姓名' },
  { value: 'all', label: '全部字段' },
] as const

// ============== 用户导出配置 ==============

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
  { key: 'id', label: '用户ID', required: true },
  { key: 'email', label: '邮箱', required: true },
  { key: 'fullName', label: '姓名', required: false },
  { key: 'isAdmin', label: '管理员', required: false },
  { key: 'isActive', label: '状态', required: false },
  { key: 'createdAt', label: '注册时间', required: false },
  { key: 'lastLoginAt', label: '最后登录', required: false },
  { key: 'totalUseCases', label: '使用案例数', required: false },
  { key: 'totalTutorials', label: '教程数', required: false },
  { key: 'totalBlogs', label: '博客数', required: false },
] as const

// ============== 用户活动类型 ==============

export const USER_ACTIVITY_TYPES = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  PROFILE_UPDATE: 'profile_update',
  PASSWORD_CHANGE: 'password_change',
  ADMIN_ACTION: 'admin_action',
} as const

// ============== 错误消息 ==============

export const USER_ERRORS = {
  NOT_FOUND: '用户不存在',
  EMAIL_EXISTS: '邮箱已存在',
  INVALID_EMAIL: '邮箱格式不正确',
  PERMISSION_DENIED: '权限不足',
  CANNOT_DELETE_SELF: '不能删除自己的账户',
  CANNOT_DELETE_SUPER_ADMIN: '不能删除超级管理员账户',
  BULK_OPERATION_FAILED: '批量操作失败',
} as const
