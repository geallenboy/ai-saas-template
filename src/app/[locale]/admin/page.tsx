'use client'

import Link from 'next/link'
import { useLocale } from 'next-intl'
import { Suspense } from 'react'
import { UserStatsClient } from '@/components/admin/user'
import { AdminGuardClient } from '@/components/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { localizePath } from '@/lib/utils'

function AdminDashboardContent() {
  const locale = useLocale()
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">管理仪表盘</h1>
        <p className="text-muted-foreground">平台运营数据总览</p>
      </div>

      <Suspense fallback={<UserStatsSkeleton />}>
        <UserStatsClient />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              常用管理功能快捷入口
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={localizePath(locale, '/admin/users')}
                className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
              >
                用户管理
              </Link>
              <Link
                href={localizePath(locale, '/admin/blog')}
                className="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors"
              >
                博客管理
              </Link>
              <Link
                href={localizePath(locale, '/admin/settings')}
                className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full hover:bg-green-200 transition-colors"
              >
                系统设置
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>系统状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">数据库</span>
                <span className="text-sm text-green-600">正常</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">认证服务</span>
                <span className="text-sm text-green-600">正常</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">支付服务</span>
                <span className="text-sm text-green-600">正常</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function UserStatsSkeleton() {
  return (
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
  )
}

export default function AdminDashboardPage() {
  return (
    <AdminGuardClient>
      <AdminDashboardContent />
    </AdminGuardClient>
  )
}
