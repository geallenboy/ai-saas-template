'use client'

import { Calendar, Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { MEMBERSHIP_STATUS } from '@/constants/payment'
import { useAuth } from '@/hooks/auth'
import { useUserMembership } from '@/hooks/use-membership'

export function MembershipStatusClient() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()

  const { membershipStatus, isLoading } = useUserMembership() // 不传用户ID，让后端自动使用当前认证用户

  // 如果用户未认证或认证状态加载中，显示占位内容
  if (authLoading) {
    return <MembershipStatusSkeleton />
  }

  if (!(isAuthenticated && user)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            会员状态
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-muted-foreground mb-4">
              请先登录查看会员状态
            </div>
            <Badge variant="secondary">未登录</Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return <MembershipStatusSkeleton />
  }

  if (!membershipStatus?.hasActiveMembership) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            会员状态
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-muted-foreground mb-4">
              您当前没有有效的会员计划
            </div>
            <Badge variant="secondary">免费用户</Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { membership, currentPlan } = membershipStatus
  const statusConfig =
    MEMBERSHIP_STATUS[membership?.status as keyof typeof MEMBERSHIP_STATUS]
  const endDate = membership?.endDate ? new Date(membership.endDate) : null
  const daysRemaining = endDate
    ? Math.max(
        0,
        Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      )
    : 0

  return (
    <div className="space-y-6">
      {/* 会员信息卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              会员状态
            </div>
            <Badge className={statusConfig?.color}>
              {statusConfig?.labelZh}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 当前计划 */}
          <div className="text-center py-4">
            <h3 className="text-lg font-semibold mb-2">
              {currentPlan?.nameZh || currentPlan?.name}
            </h3>
            <div className="text-sm text-muted-foreground">
              {membership?.durationType === 'yearly' ? '年付' : '月付'}计划
            </div>
          </div>

          {/* 到期信息 - 核心信息 */}
          {endDate && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">
                  剩余 {daysRemaining} 天
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                到期时间: {endDate.toLocaleDateString('zh-CN')}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function MembershipStatusSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          会员状态
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center py-4">
          <Skeleton className="h-6 w-24 mx-auto mb-2" />
          <Skeleton className="h-4 w-16 mx-auto" />
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
          <Skeleton className="h-4 w-20 mx-auto mb-2" />
          <Skeleton className="h-3 w-32 mx-auto" />
        </div>
      </CardContent>
    </Card>
  )
}
