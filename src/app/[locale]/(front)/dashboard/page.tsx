'use client'

import { AuthGuardClient, UserProfileClient } from '@/components/auth'
import {
  MembershipStatusClient,
  PaymentHistoryClient,
} from '@/components/payment'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useUserMembership } from '@/hooks/use-membership'
import { useUser } from '@clerk/nextjs'
import {
  BarChart3,
  CreditCard,
  FileText,
  Settings,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'

function DashboardContent() {
  const { user } = useUser()
  const { isLoading } = useUserMembership(user?.id)

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            控制面板
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            欢迎回来！这里是您的个人工作台。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left: User profile and membership status*/}
          <div className="lg:col-span-1 space-y-6">
            <UserProfileClient />
            <MembershipStatusClient />
          </div>

          {/* Right: Main content area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Quick actions area */}
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
                    <Link href="/pricing">
                      <div className="text-center">
                        <CreditCard className="h-6 w-6 mx-auto mb-2" />
                        <span className="text-sm">升级计划</span>
                      </div>
                    </Link>
                  </Button>

                  <Button variant="outline" className="h-auto p-4" asChild>
                    <Link href="/settings">
                      <div className="text-center">
                        <Settings className="h-6 w-6 mx-auto mb-2" />
                        <span className="text-sm">账户设置</span>
                      </div>
                    </Link>
                  </Button>

                  <Button variant="outline" className="h-auto p-4" asChild>
                    <Link href="/payment/history">
                      <div className="text-center">
                        <BarChart3 className="h-6 w-6 mx-auto mb-2" />
                        <span className="text-sm">支付历史</span>
                      </div>
                    </Link>
                  </Button>

                  <Button variant="outline" className="h-auto p-4" asChild>
                    <Link href="/docs">
                      <div className="text-center">
                        <FileText className="h-6 w-6 mx-auto mb-2" />
                        <span className="text-sm">查看文档</span>
                      </div>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Payment history */}
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
          {/* User profile skeleton */}
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

          {/* Member status skeleton */}
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
          {/* Overview Card Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
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

          {/* Quick operation skeleton */}
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-24 mb-4" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment history skeleton */}
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-24 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
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
  return (
    <AuthGuardClient requireAuth>
      <DashboardContent />
    </AuthGuardClient>
  )
}
