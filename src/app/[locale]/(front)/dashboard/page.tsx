'use client'

import {
  BarChart3,
  CreditCard,
  FileText,
  Settings,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { UserProfileClient } from '@/components/auth'
import {
  MembershipStatusClient,
  PaymentHistoryClient,
} from '@/components/front/payment'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/auth'

function DashboardContent() {
  const { user, isLoading, isStateStale, syncAuthState } = useAuth()
  const pathname = usePathname()

  // 获取当前语言前缀
  const locale = pathname.split('/')[1] || 'zh'

  // 如果检测到状态不同步，尝试同步
  useEffect(() => {
    let mounted = true

    const handleStateSync = async () => {
      if (isStateStale && !isLoading) {
        console.log('🔄 Dashboard: 检测到状态不同步，尝试同步...')
        const needsReload = await syncAuthState()

        if (needsReload && mounted) {
          console.log('🔄 Dashboard: 状态同步需要刷新页面')
          // 让用户知道正在同步状态
          return
        }
      }
    }

    handleStateSync()

    return () => {
      mounted = false
    }
  }, [isStateStale, isLoading, syncAuthState])

  // AuthGuard已经处理认证检查，这里只需要处理加载状态
  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            欢迎回来，{user?.name || user?.email}！
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            这里是您的个人工作台，您可以管理您的账户和查看使用情况。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 左侧：用户资料和会员状态 */}
          <div className="lg:col-span-1 space-y-6">
            <UserProfileClient />
            <MembershipStatusClient />
          </div>

          {/* 右侧：主要内容区域 */}
          <div className="lg:col-span-3 space-y-6">
            {/* 快速操作区域 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  快速操作
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-auto p-4" asChild>
                    <Link href={`/${locale}/pricing`}>
                      <div className="text-center">
                        <CreditCard className="h-6 w-6 mx-auto mb-2" />
                        <span className="text-sm">升级计划</span>
                      </div>
                    </Link>
                  </Button>

                  <Button variant="outline" className="h-auto p-4" asChild>
                    <Link href={`/${locale}/settings`}>
                      <div className="text-center">
                        <Settings className="h-6 w-6 mx-auto mb-2" />
                        <span className="text-sm">账户设置</span>
                      </div>
                    </Link>
                  </Button>

                  <Button variant="outline" className="h-auto p-4" asChild>
                    <Link href={`/${locale}/payment/history`}>
                      <div className="text-center">
                        <BarChart3 className="h-6 w-6 mx-auto mb-2" />
                        <span className="text-sm">支付历史</span>
                      </div>
                    </Link>
                  </Button>

                  <Button variant="outline" className="h-auto p-4" asChild>
                    <Link href={`/${locale}/docs`}>
                      <div className="text-center">
                        <FileText className="h-6 w-6 mx-auto mb-2" />
                        <span className="text-sm">查看文档</span>
                      </div>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 支付历史 */}
            <PaymentHistoryClient />
          </div>
        </div>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          {/* 用户资料骨架 */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 会员状态骨架 */}
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-24 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {/* 概览卡片骨架 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={`skeleton-${i}`}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="ml-4 space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-6 w-12" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 快速操作骨架 */}
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-24 mb-4" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={`skeleton-${i}`} className="h-20" />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 支付历史骨架 */}
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-24 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={`skeleton-${i}`} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  // 中间件已经处理了认证检查，不需要 AuthGuard
  return <DashboardContent />
}
