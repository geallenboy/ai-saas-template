'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import {
  useAdminGuard,
  useBetterAuthPermissions,
  useSuperAdminGuard,
} from '@/hooks/auth'
import { useBetterAuth } from '@/lib/auth/better-auth/client'

// ===============================
// 基础认证守卫
// ===============================

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

export function AuthGuard({
  children,
  fallback,
  redirectTo = '/auth/login',
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useBetterAuth()
  const router = useRouter()

  useEffect(() => {
    if (!(isLoading || isAuthenticated)) {
      router.push(redirectTo)
    }
  }, [isLoading, isAuthenticated, redirectTo, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return fallback || null
  }

  return <>{children}</>
}

// ===============================
// 管理员守卫组件
// ===============================

interface AdminGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

export function AdminGuard({
  children,
  fallback,
  redirectTo = '/',
}: AdminGuardProps) {
  const { isAuthenticated, isLoading } = useBetterAuth()
  const isAdmin = useAdminGuard()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated && !isAdmin) {
      router.push(redirectTo)
    }
  }, [isLoading, isAuthenticated, isAdmin, redirectTo, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthGuard>{children}</AuthGuard>
  }

  if (!isAdmin) {
    return fallback || null
  }

  return <>{children}</>
}

// ===============================
// 超级管理员守卫组件
// ===============================

interface SuperAdminGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

export function SuperAdminGuard({
  children,
  fallback,
  redirectTo = '/',
}: SuperAdminGuardProps) {
  const { isAuthenticated, isLoading } = useBetterAuth()
  const isSuperAdmin = useSuperAdminGuard()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated && !isSuperAdmin) {
      router.push(redirectTo)
    }
  }, [isLoading, isAuthenticated, isSuperAdmin, redirectTo, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthGuard>{children}</AuthGuard>
  }

  if (!isSuperAdmin) {
    return fallback || null
  }

  return <>{children}</>
}

// ===============================
// 便捷的角色显示组件
// ===============================

interface ShowForRoleProps {
  role: 'user' | 'admin' | 'superAdmin'
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ShowForRole({
  role,
  children,
  fallback = null,
}: ShowForRoleProps) {
  const { isUser, isAdmin, isSuperAdmin } = useBetterAuthPermissions()

  let hasRole = false
  switch (role) {
    case 'user':
      hasRole = isUser
      break
    case 'admin':
      hasRole = isAdmin
      break
    case 'superAdmin':
      hasRole = isSuperAdmin
      break
  }

  return hasRole ? children : fallback
}
