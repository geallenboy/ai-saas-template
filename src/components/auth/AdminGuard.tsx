'use client'

import { ArrowLeft, Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/hooks/auth'

interface AdminGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
  showAccessDenied?: boolean
}

export function AdminGuard({
  children,
  fallback,
  redirectTo = '/dashboard',
  showAccessDenied = true,
}: AdminGuardProps) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()

  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated && !isAdmin) {
      router.push(redirectTo)
    }
  }, [isLoading, isAuthenticated, isAdmin, redirectTo, router])

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

  // 未登录用户会被AuthGuard处理，这里不需要处理
  if (!isAuthenticated) {
    return null
  }

  // 非管理员用户
  if (!isAdmin) {
    if (!showAccessDenied) {
      return null
    }

    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
              <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <CardTitle>管理员权限必需</CardTitle>
            <CardDescription>
              此页面仅限管理员访问。如果您认为这是错误，请联系系统管理员。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => router.push(redirectTo)}
              className="w-full"
              variant="default"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回首页
            </Button>
            <Button
              onClick={() => router.push('/settings/profile')}
              className="w-full"
              variant="outline"
            >
              前往设置
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
