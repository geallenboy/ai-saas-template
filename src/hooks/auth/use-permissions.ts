'use client'

import { useMemo } from 'react'
import { useSession } from '@/lib/auth/better-auth/client'
import { AdminLevel } from '@/lib/auth/better-auth/roles'

/**
 * 简化的客户端权限管理 Hook
 */
export function useBetterAuthPermissions() {
  const { data: session, isPending } = useSession()
  const isLoading = isPending
  const user = session?.user

  // 角色检查
  const isAdmin = useMemo(() => {
    if (!user) return false
    return ((user as any)?.adminLevel ?? AdminLevel.USER) >= AdminLevel.ADMIN
  }, [user])

  const isSuperAdmin = useMemo(() => {
    if (!user) return false
    return (
      ((user as any)?.adminLevel ?? AdminLevel.USER) >= AdminLevel.SUPER_ADMIN
    )
  }, [user])

  const isUser = useMemo(() => {
    if (!user) return true
    return ((user as any)?.adminLevel ?? AdminLevel.USER) === AdminLevel.USER
  }, [user])

  return {
    // 用户信息
    user,
    isLoading,
    isAuthenticated: !!user,

    // 角色检查
    isUser,
    isAdmin,
    isSuperAdmin,
  }
}

/**
 * 管理员守卫 Hook
 */
export function useAdminGuard() {
  const { isAdmin } = useBetterAuthPermissions()
  return isAdmin
}

/**
 * 超级管理员守卫 Hook
 */
export function useSuperAdminGuard() {
  const { isSuperAdmin } = useBetterAuthPermissions()
  return isSuperAdmin
}
