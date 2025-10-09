import { env } from '@/env'
import type { User } from '@/lib/auth/better-auth'

export function getAdminEmails(): string[] {
  // 只在服务器端运行
  if (typeof window !== 'undefined') {
    return []
  }

  if (!env.ADMIN_EMAILS) {
    return []
  }

  return env.ADMIN_EMAILS.split(',')
    .map(email => email.trim())
    .filter(email => email.length > 0)
}

export function isAdmin(user: User | null): boolean {
  if (!user) {
    return false
  }

  // 检查 Better-Auth admin 插件设置的 role
  if (user.role === 'admin') {
    return true
  }

  // 检查自定义的 isAdmin 字段
  if (user.isAdmin === true) {
    return true
  }

  // 检查是否在管理员邮箱列表中（仅在服务器端）
  if (typeof window === 'undefined' && user.email) {
    const adminEmails = getAdminEmails()
    return adminEmails.includes(user.email)
  }

  return false
}

export function isAdminEmail(email: string): boolean {
  // 只在服务器端检查
  if (typeof window !== 'undefined') {
    return false
  }

  const adminEmails = getAdminEmails()
  return adminEmails.includes(email)
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export function getUserRole(user: User | null): UserRole {
  if (isAdmin(user)) {
    return UserRole.ADMIN
  }
  return UserRole.USER
}

// 权限常量
export const PERMISSIONS = {
  // 用户管理
  USER_READ: 'user.read',
  USER_WRITE: 'user.write',
  USER_DELETE: 'user.delete',
  USER_ADMIN: 'user.admin',

  // 内容管理
  CONTENT_READ: 'content.read',
  CONTENT_WRITE: 'content.write',
  CONTENT_DELETE: 'content.delete',

  // 系统管理
  SYSTEM_CONFIG: 'system.config',
  SYSTEM_LOGS: 'system.logs',

  // 基础权限
  PROFILE_READ: 'profile.read',
  PROFILE_WRITE: 'profile.write',
  SETTINGS_READ: 'settings.read',
  SETTINGS_WRITE: 'settings.write',
  BILLING_READ: 'billing.read',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

// 角色权限映射
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // 管理员拥有所有权限
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_WRITE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.USER_ADMIN,
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.CONTENT_WRITE,
    PERMISSIONS.CONTENT_DELETE,
    PERMISSIONS.SYSTEM_CONFIG,
    PERMISSIONS.SYSTEM_LOGS,
    PERMISSIONS.PROFILE_READ,
    PERMISSIONS.PROFILE_WRITE,
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.SETTINGS_WRITE,
    PERMISSIONS.BILLING_READ,
  ],
  [UserRole.USER]: [
    // 普通用户基础权限
    PERMISSIONS.PROFILE_READ,
    PERMISSIONS.PROFILE_WRITE,
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.SETTINGS_WRITE,
    PERMISSIONS.BILLING_READ,
    PERMISSIONS.CONTENT_READ,
  ],
}

export function getUserPermissions(user: User | null): Permission[] {
  const role = getUserRole(user)
  return ROLE_PERMISSIONS[role] || []
}

export function hasPermission(
  user: User | null,
  permission: Permission
): boolean {
  const userPermissions = getUserPermissions(user)
  return userPermissions.includes(permission)
}

export function hasAnyPermission(
  user: User | null,
  permissions: Permission[]
): boolean {
  return permissions.some(permission => hasPermission(user, permission))
}

export function hasAllPermissions(
  user: User | null,
  permissions: Permission[]
): boolean {
  return permissions.every(permission => hasPermission(user, permission))
}
