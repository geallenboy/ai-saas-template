// ============== Authentication constants ==============

export const AUTH_ROUTES = {
  SIGN_IN: '/auth/sign-in',
  SIGN_UP: '/auth/sign-up',
  SIGN_OUT: '/auth/signout',
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
  '/auth/sign-in',
  '/auth/sign-up',
] as const

// ============== User preferences default values ==============

export const DEFAULT_USER_PREFERENCES = {
  theme: 'light' as const,
  language: 'en' as const,
  currency: 'USD' as const,
  timezone: 'UTC',
}

// ============== Administrator permission level ==============

export const ADMIN_LEVELS = {
  USER: 0,
  ADMIN: 1,
  SUPER_ADMIN: 2,
} as const

export const ADMIN_LEVEL_NAMES = {
  [ADMIN_LEVELS.USER]: 'Regular User',
  [ADMIN_LEVELS.ADMIN]: 'Administrator',
  [ADMIN_LEVELS.SUPER_ADMIN]: 'Super Administrator',
} as const

// ============== Authentication error messages ==============

export const AUTH_ERRORS = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Insufficient permissions',
  USER_NOT_FOUND: 'User not found',
  INVALID_CREDENTIALS: 'Invalid username or password',
  ACCOUNT_DISABLED: 'Account has been disabled',
  SESSION_EXPIRED: 'Session has expired',
  SYNC_FAILED: 'User sync failed',
  UPDATE_FAILED: 'Update failed',
} as const

// ============== Session configuration ==============

export const SESSION_CONFIG = {
  MAX_AGE: 30 * 24 * 60 * 60, // 30 days (seconds)
  REFRESH_THRESHOLD: 24 * 60 * 60, // Refresh within 24 hours (seconds)
  CLEANUP_INTERVAL: 60 * 60, // Clean up every hour (seconds)
} as const

// ============== User status ==============

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
} as const

// ============== Supported languages and currencies ==============

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
] as const

export const SUPPORTED_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
] as const

// ============== Theme options ==============

export const THEME_OPTIONS = [
  { value: 'light', label: 'Light Theme' },
  { value: 'dark', label: 'Dark Theme' },
] as const
