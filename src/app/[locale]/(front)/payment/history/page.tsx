'use client'

import { ArrowLeft, Calendar, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { AuthGuardClient } from '@/components/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice } from '@/constants/payment'
import { useAuth } from '@/hooks/auth'
import { trpc } from '@/server/client'

function PaymentHistoryContent() {
  const { user, isAuthenticated, isLoading } = useAuth()

  // 获取当前语言前缀
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
  const locale = pathname.split('/')[1] || 'zh'

  const {
    data: paymentHistory,
    isLoading: authLoading,
    error,
  } = trpc.payments.getPaymentHistory.useQuery(
    { page: 1, limit: 10 },
    {
      enabled: isAuthenticated && !!user,
      retry: (failureCount, error) => {
        console.error('Payment history error:', error)
        return failureCount < 1
      },
    }
  )

  // 调试输出
  if (process.env.NODE_ENV === 'development') {
    console.log('PaymentHistory - user:', user)
    console.log('PaymentHistory - isAuthenticated:', isAuthenticated)
    console.log('PaymentHistory - paymentHistory:', paymentHistory)
    console.log('PaymentHistory - error:', error)
  }

  // 等待认证加载完成
  if (authLoading) {
    return <PaymentHistorySkeleton />
  }

  // 未认证状态
  if (!(isAuthenticated && user)) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">请先登录查看支付历史。</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return <PaymentHistorySkeleton />
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            加载支付历史失败，请稍后重试。
          </p>
          <p className="text-xs text-red-500 mt-2">{error.message}</p>
        </div>
      </div>
    )
  }

  const payments = paymentHistory?.payments || []

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/${locale}/dashboard`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回仪表盘
        </Link>
        <h1 className="text-3xl font-bold">支付历史</h1>
      </div>

      {payments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">暂无支付记录</h3>
            <p className="text-muted-foreground mb-6">
              您还没有任何支付记录。立即选择计划开始使用我们的服务！
            </p>
            <Link
              href={`/${locale}/pricing`}
              className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              查看定价计划
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              支付记录
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments.map(payment => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {payment.planName || '会员计划'}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(payment.createdAt).toLocaleDateString(
                          'zh-CN',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatPrice(
                        Number(payment.amount),
                        payment.currency as 'USD' | 'CNY'
                      )}
                    </div>
                    <div className="text-sm">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'succeeded'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : payment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}
                      >
                        {payment.status === 'succeeded'
                          ? '成功'
                          : payment.status === 'pending'
                            ? '处理中'
                            : '失败'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {paymentHistory?.pagination &&
              paymentHistory.pagination.totalPages > 1 && (
                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    显示第 {paymentHistory.pagination.page} 页，共{' '}
                    {paymentHistory.pagination.totalPages} 页
                  </p>
                </div>
              )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function PaymentHistorySkeleton() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-32" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentHistoryPage() {
  return (
    <AuthGuardClient>
      <PaymentHistoryContent />
    </AuthGuardClient>
  )
}
