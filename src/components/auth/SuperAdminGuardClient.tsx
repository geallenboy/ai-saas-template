'use client'

import { ArrowLeft, Crown, Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/hooks/auth'

interface SuperAdminGuardClientProps {
  children: ReactNode
  fallback?: ReactNode
  redirectTo?: string
  showAccessDenied?: boolean
}

export function SuperAdminGuardClient({
  children,
  fallback,
  redirectTo = '/dashboard',
  showAccessDenied = true,
}: SuperAdminGuardClientProps) {
  const { user, isAuthenticated, isLoading } = useAuth()

  const router = useRouter()

  // 显示加载状态
  if (isLoading) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
      </div>
    )
  }

  // 未登录用户
  if (!(isAuthenticated && user)) {
    router.push('/auth/login')
    return null
  }

  // 检查是否是超级管理员
  const isSuperAdmin = user.isAdmin && (user.adminLevel ?? 0) >= 2

  if (!isSuperAdmin) {
    if (!showAccessDenied) {
      return null
    }

    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <Crown className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle>超级管理员权限必需</CardTitle>
            <CardDescription>
              此页面仅限超级管理员访问。您当前的权限级别为：
              {user.isAdmin
                ? `管理员 (Level ${user.adminLevel ?? 0})`
                : '普通用户'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => router.push(redirectTo)}
              className="w-full"
              variant="default"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回仪表盘
            </Button>
            <Button
              onClick={() => router.push('/settings')}
              className="w-full"
              variant="outline"
            >
              <Shield className="mr-2 h-4 w-4" />
              前往设置
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
