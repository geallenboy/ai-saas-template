'use client'

import { createContext, type ReactNode, useContext } from 'react'
import { useAuth } from '@/hooks/auth'
import {
  getUserPermissions,
  getUserRole,
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
  isAdmin,
  type Permission,
  type UserRole,
} from '@/lib/auth/permissions'

interface PermissionContextType {
  isAdmin: boolean
  userRole: UserRole
  permissions: Permission[]
  hasPermission: (permission: Permission) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
  hasAllPermissions: (permissions: Permission[]) => boolean
}

const PermissionContext = createContext<PermissionContextType | undefined>(
  undefined
)

interface PermissionProviderProps {
  children: ReactNode
}

export function PermissionProvider({ children }: PermissionProviderProps) {
  const { user } = useAuth()

  const userIsAdmin = isAdmin(user)
  const userRole = getUserRole(user)
  const permissions = getUserPermissions(user)

  const contextValue: PermissionContextType = {
    isAdmin: userIsAdmin,
    userRole,
    permissions,
    hasPermission: (permission: Permission) => hasPermission(user, permission),
    hasAnyPermission: (permissions: Permission[]) =>
      hasAnyPermission(user, permissions),
    hasAllPermissions: (permissions: Permission[]) =>
      hasAllPermissions(user, permissions),
  }

  return (
    <PermissionContext.Provider value={contextValue}>
      {children}
    </PermissionContext.Provider>
  )
}

export function usePermissions(): PermissionContextType {
  const context = useContext(PermissionContext)
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider')
  }
  return context
}

// 便捷 hooks
export function useIsAdmin(): boolean {
  const { isAdmin } = usePermissions()
  return isAdmin
}

export function useUserRole(): UserRole {
  const { userRole } = usePermissions()
  return userRole
}

export function useHasPermission() {
  const { hasPermission } = usePermissions()
  return hasPermission
}

export function useHasAnyPermission() {
  const { hasAnyPermission } = usePermissions()
  return hasAnyPermission
}

export function useHasAllPermissions() {
  const { hasAllPermissions } = usePermissions()
  return hasAllPermissions
}

// 权限包装组件
interface PermissionWrapperProps {
  children: ReactNode
  permission?: Permission
  permissions?: Permission[]
  requireAll?: boolean
  fallback?: ReactNode
  inverse?: boolean
}

export function PermissionWrapper({
  children,
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
  inverse = false,
}: PermissionWrapperProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } =
    usePermissions()

  let hasAccess = false

  if (permission) {
    hasAccess = hasPermission(permission)
  } else if (permissions.length > 0) {
    hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions)
  } else {
    hasAccess = true // 如果没有指定权限，默认有权限
  }

  // 如果是反向检查，则取反
  if (inverse) {
    hasAccess = !hasAccess
  }

  return hasAccess ? children : fallback
}
