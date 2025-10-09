// ============== 认证常量 ==============

export const AUTH_ROUTES = {
  SIGN_IN: '/auth/login',
  SIGN_UP: '/auth/register',
  SIGN_OUT: '/auth/logout',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const

export const PROTECTED_ROUTES = [
  '/admin',
  '/dashboard',
  '/settings',
  '/profile',
] as const

export const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/contact',
  '/pricing',
  '/blog',
  '/docs',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
] as const

// ============== 用户偏好默认值 ==============

export const DEFAULT_USER_PREFERENCES = {
  theme: 'light' as const,
  language: 'en' as const,
  currency: 'USD' as const,
  timezone: 'UTC',
}

// ============== 管理员权限级别 ==============

export const ADMIN_LEVELS = {
  USER: 0,
  ADMIN: 1,
  SUPER_ADMIN: 2,
} as const

export const ADMIN_LEVEL_NAMES = {
  [ADMIN_LEVELS.USER]: '普通用户',
  [ADMIN_LEVELS.ADMIN]: '管理员',
  [ADMIN_LEVELS.SUPER_ADMIN]: '超级管理员',
} as const

// ============== 认证错误消息 ==============

export const AUTH_ERRORS = {
  UNAUTHORIZED: '未授权访问',
  FORBIDDEN: '权限不足',
  USER_NOT_FOUND: '用户不存在',
  INVALID_CREDENTIALS: '用户名或密码错误',
  ACCOUNT_DISABLED: '账户已被禁用',
  SESSION_EXPIRED: '会话已过期',
  SYNC_FAILED: '用户同步失败',
  UPDATE_FAILED: '更新失败',
} as const

// ============== 会话配置 ==============

export const SESSION_CONFIG = {
  MAX_AGE: 30 * 24 * 60 * 60, // 30天 (秒)
  REFRESH_THRESHOLD: 24 * 60 * 60, // 24小时内刷新 (秒)
  CLEANUP_INTERVAL: 60 * 60, // 1小时清理一次 (秒)
} as const

// ============== 用户状态 ==============

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
} as const

// ============== 支持的语言和货币 ==============

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
] as const

export const SUPPORTED_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
] as const

// ============== 主题选项 ==============

export const THEME_OPTIONS = [
  { value: 'light', label: '浅色主题' },
  { value: 'dark', label: '深色主题' },
] as const
