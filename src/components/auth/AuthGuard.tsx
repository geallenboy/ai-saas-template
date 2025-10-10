'use client'

import { AlertCircle, Loader2, Lock } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { memo, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/hooks/auth'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
  showLoginPrompt?: boolean
  useSkeletonFallback?: boolean
}

const AuthGuardComponent = function AuthGuard({
  children,
  fallback,
  redirectTo = '/auth/login',
  showLoginPrompt = true,
  useSkeletonFallback = false,
}: AuthGuardProps) {
  // 只获取必要的认证状态，减少重渲染
  const { isAuthenticated, isLoading, error, session } = useAuth()

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // 使用 useMemo 缓存当前路径，减少重计算
  const currentPath = useMemo(() => {
    const search = searchParams.toString()
    return pathname + (search ? `?${search}` : '')
  }, [pathname, searchParams])

  const getCurrentPath = useCallback(() => currentPath, [currentPath])

  // 简化的认证检查：由于中间件已经处理了路由保护，这里只需要处理加载和错误状态

  // 加载状态 - 使用 useMemo 缓存加载组件
  const loadingComponent = useMemo(() => {
    if (fallback) {
      return <>{fallback}</>
    }

    if (useSkeletonFallback) {
      return (
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>
      )
    }

    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground text-sm">正在加载...</p>
          </CardContent>
        </Card>
      </div>
    )
  }, [fallback, useSkeletonFallback])

  // 错误状态 - 使用 useMemo 缓存错误组件
  const errorComponent = useMemo(
    () => (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>认证错误</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button onClick={() => session} className="w-full">
              刷新会话
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(redirectTo)}
              className="w-full"
            >
              前往登录
            </Button>
            <Button
              variant="ghost"
              onClick={() => window.location.reload()}
              className="w-full"
            >
              重试
            </Button>
          </CardContent>
        </Card>
      </div>
    ),
    [error, session, router, redirectTo]
  )

  // 登录提示 - 使用 useMemo 缓存登录组件
  const loginComponent = useMemo(
    () => (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>需要登录</CardTitle>
            <CardDescription>请登录后访问此页面</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => {
                const currentPath = getCurrentPath()
                const separator = redirectTo.includes('?') ? '&' : '?'
                const loginUrl = `${redirectTo}${separator}callbackUrl=${encodeURIComponent(currentPath)}`
                router.push(loginUrl)
              }}
              className="w-full"
            >
              立即登录
            </Button>
          </CardContent>
        </Card>
      </div>
    ),
    [getCurrentPath, redirectTo, router]
  )

  // 早期返回模式避免不必要的计算
  if (isLoading) return loadingComponent
  if (error && !isAuthenticated) return errorComponent
  if (!(isLoading || isAuthenticated) && showLoginPrompt) return loginComponent

  return <>{children}</>
}

// 使用 memo 优化组件，只在 props 变化时重渲染
export const AuthGuard = memo(AuthGuardComponent)
