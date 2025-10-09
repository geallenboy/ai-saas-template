'use client'

import { CreditCard, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice, PAYMENT_STATUS } from '@/constants/payment'
import { useAuth } from '@/hooks/auth'
import { trpc } from '@/server/client'

export function PaymentHistoryClient() {
  const { isAuthenticated } = useAuth()
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'zh'

  const { data, isLoading, error } = trpc.payments.getPaymentHistory.useQuery(
    { limit: 5 },
    {
      enabled: isAuthenticated,
      staleTime: 5 * 60 * 1000, // 5分钟缓存
      gcTime: 10 * 60 * 1000, // 10分钟垃圾回收
    }
  )

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            支付历史
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            请先登录查看支付记录
          </p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return <PaymentHistorySkeleton />
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            支付历史
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-destructive py-8">
            加载支付历史失败
          </div>
        </CardContent>
      </Card>
    )
  }

  const payments = data?.payments || []

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          支付历史
        </CardTitle>
        {payments.length > 0 && (
          <Button asChild variant="outline" size="sm">
            <Link href={`/${locale}/payment/history`}>
              查看全部
              <ExternalLink className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">暂无支付记录</p>
            <Button asChild variant="outline">
              <Link href={`/${locale}/pricing`}>选择计划</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map(payment => {
              const statusConfig =
                PAYMENT_STATUS[payment.status as keyof typeof PAYMENT_STATUS]
              const paymentDate = new Date(payment.createdAt)

              return (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{payment.planName}</p>
                      <Badge
                        className={
                          statusConfig?.color || 'bg-gray-100 text-gray-800'
                        }
                      >
                        {statusConfig?.labelZh || payment.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        {paymentDate.toLocaleDateString('zh-CN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span>
                        {payment.durationType === 'yearly' ? '年付' : '月付'}
                      </span>
                      {payment.paymentMethod && (
                        <span className="capitalize">
                          {payment.paymentMethod}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-lg">
                      {formatPrice(
                        Number(payment.amount),
                        payment.currency as 'USD' | 'CNY'
                      )}
                    </p>
                    {payment.discountAmount &&
                      Number(payment.discountAmount) > 0 && (
                        <p className="text-sm text-green-600">
                          节省{' '}
                          {formatPrice(
                            Number(payment.discountAmount),
                            payment.currency as 'USD' | 'CNY'
                          )}
                        </p>
                      )}
                  </div>
                </div>
              )
            })}

            {data?.pagination.hasMore && (
              <div className="text-center pt-4 border-t">
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/${locale}/payment/history`}>
                    查看更多支付记录
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function PaymentHistorySkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          支付历史
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex-1">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="text-right">
                <Skeleton className="h-6 w-16 mb-1" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
