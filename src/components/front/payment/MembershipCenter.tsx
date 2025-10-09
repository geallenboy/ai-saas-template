'use client'

import { Crown, Shield } from 'lucide-react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { MEMBERSHIP_STATUS } from '@/constants/payment'
import { useAuth } from '@/hooks/auth'
import { useUserMembership } from '@/hooks/use-membership'
import { localizePath } from '@/lib/utils'
import { trpc } from '@/server/client'

export function MembershipCenter() {
  const auth = useAuth()
  const locale = useLocale()
  const {
    membershipStatus,
    currentPlan,
    isLoading,
    hasActiveMembership,
    remainingDays,
    nextExpiryDate,
  } = useUserMembership()

  const createPortalSession =
    trpc.payments.createBillingPortalSession.useMutation({
      onSuccess: data => {
        if (data?.url) {
          window.location.href = data.url
        } else {
          toast.error('未能获取订阅管理链接')
        }
      },
      onError: error => {
        toast.error(error.message || '创建订阅管理链接失败')
      },
    })

  const handleManageSubscription = () => {
    const returnUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}${localizePath(locale, '/membership')}`
        : `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}${localizePath(locale, '/membership')}`

    createPortalSession.mutate({ returnUrl })
  }

  if (!auth.isAuthenticated) {
    return (
      <div className="container mx-auto py-12">
        <Card className="mx-auto max-w-xl text-center">
          <CardHeader>
            <CardTitle className="flex flex-col items-center gap-2 text-lg">
              <Shield className="h-6 w-6 text-muted-foreground" />
              登录以查看会员信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>登录后可以查看当前会员计划、续费时间和账单历史。</p>
            <Button asChild>
              <Link href={localizePath(locale, '/auth/login')}>立即登录</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-12">
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-48" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!hasActiveMembership) {
    return (
      <div className="container mx-auto py-12">
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-muted-foreground" />
              您当前使用免费计划
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              升级到会员计划即可解锁更高的调用额度、优先支持和更多高级功能。
            </p>
            <Button asChild className="w-full sm:w-auto">
              <Link href={localizePath(locale, '/pricing')}>
                <Crown className="mr-2 h-4 w-4" />
                查看可选计划
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const membership = membershipStatus?.membership
  const statusConfig = membership?.status
    ? MEMBERSHIP_STATUS[membership.status as keyof typeof MEMBERSHIP_STATUS]
    : undefined
  const planName = currentPlan?.nameZh || currentPlan?.name || '会员计划'
  const billingCycle = membership?.durationType === 'yearly' ? '年付' : '月付'
  const nextRenewal = nextExpiryDate
    ? new Date(nextExpiryDate).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—'

  return (
    <div className="container mx-auto py-12">
      <Card className="mx-auto max-w-2xl">
        <CardHeader className="flex flex-col gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Crown className="h-5 w-5 text-amber-500" />
            {planName}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {statusConfig ? (
              <Badge className={statusConfig.color}>
                {statusConfig.labelZh}
              </Badge>
            ) : null}
            <span>计费周期：{billingCycle}</span>
            <span>剩余天数：{remainingDays}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="flex flex-col gap-2">
            <p>
              下次续费日期：<strong>{nextRenewal}</strong>
            </p>
            {membership?.purchaseAmount ? (
              <p>
                最近一次支付金额：
                <strong>
                  {membership.purchaseAmount} {membership.currency}
                </strong>
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <Button
              onClick={handleManageSubscription}
              variant="outline"
              disabled={createPortalSession.isPending}
            >
              {createPortalSession.isPending ? '跳转中...' : '管理订阅'}
            </Button>
            <Button asChild variant="ghost">
              <Link href={localizePath(locale, '/payment/history')}>
                查看账单
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
