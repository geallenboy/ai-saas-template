'use client'

import { AuthGuardClient } from '@/components/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice } from '@/constants/payment'
import { trpc } from '@/lib/trpc/client'
import { ArrowRight, Calendar, CheckCircle, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  const {
    data: membershipStatus,
    isLoading,
    error,
  } = trpc.payments.getUserMembershipStatus.useQuery(undefined, {
    staleTime: 0, // Do not cache after successful payment to ensure the latest status
    gcTime: 0,
  })

  if (isLoading) {
    return <PaymentSuccessLoading />
  }

  if (error || !membershipStatus) {
    return <PaymentSuccessError />
  }

  const { hasActiveMembership, currentPlan, membership, remainingDays } =
    membershipStatus

  return (
    <div className="text-center space-y-8">
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
        </div>
      </div>

      {/* Success Message */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          支付成功！
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          感谢您的购买，您的会员已成功激活
        </p>
      </div>

      {/* Member information card */}
      {hasActiveMembership && currentPlan && membership && (
        <Card className="text-left">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              会员信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">会员计划</p>
                <p className="font-medium text-lg">
                  {currentPlan.nameDe || currentPlan.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">计费周期</p>
                <p className="font-medium">
                  {membership.durationType === 'yearly' ? '年付' : '月付'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">支付金额</p>
                <p className="font-medium text-lg">
                  {formatPrice(
                    Number(membership.purchaseAmount),
                    membership.currency as 'USD' | 'EUR'
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">有效期</p>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <p className="font-medium">{remainingDays} 天</p>
                </div>
              </div>
            </div>

            {membership.endDate && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">到期时间</p>
                <p className="font-medium">
                  {new Date(membership.endDate).toLocaleDateString('de-DE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Features */}
      {currentPlan && (
        <Card className="text-left">
          <CardHeader>
            <CardTitle>您现在可以享受以下功能</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentPlan.featuresDe && currentPlan.featuresDe.length > 0
                ? currentPlan.featuresDe.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))
                : currentPlan.features?.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action button */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild size="lg">
          <Link href="/dashboard">
            前往仪表盘
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>

        <Button asChild variant="outline" size="lg">
          <Link href="/payment/history">查看支付记录</Link>
        </Button>
      </div>

      {/* Support information */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          如有任何问题，请{' '}
          <Link href="/contact" className="text-primary hover:underline">
            联系客服
          </Link>
        </p>
      </div>

      {/* Debug information (only in development) */}
      {process.env.NODE_ENV === 'development' && sessionId && (
        <Card className="text-left">
          <CardHeader>
            <CardTitle className="text-sm">调试信息</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground font-mono">
              Session ID: {sessionId}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function PaymentSuccessLoading() {
  return (
    <div className="text-center space-y-8">
      <div className="flex justify-center">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center animate-pulse">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-6 w-64 mx-auto" />
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function PaymentSuccessError() {
  return (
    <div className="text-center space-y-8">
      <div className="flex justify-center">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <CreditCard className="w-12 h-12 text-red-600 dark:text-red-400" />
        </div>
      </div>

      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          支付处理中
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          您的支付正在处理中，请稍后查看会员状态
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild size="lg">
          <Link href="/dashboard">
            前往仪表盘
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>

        <Button asChild variant="outline" size="lg">
          <Link href="/pricing">返回定价页面</Link>
        </Button>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <AuthGuardClient requireAuth>
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-8">
          <PaymentSuccessContent />
        </div>
      </main>
    </AuthGuardClient>
  )
}
