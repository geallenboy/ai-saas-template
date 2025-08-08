'use client'

import { AuthGuardClient } from '@/components/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice } from '@/constants/payment'
import { trpc } from '@/lib/trpc/client'
import { useUser } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
import { ArrowLeft, Calendar, CreditCard } from 'lucide-react'
import Link from 'next/link'

function PaymentHistoryContent() {
  const t = useTranslations('paymentHistory')
  const { user } = useUser()

  const {
    data: paymentHistory,
    isLoading,
    error,
  } = trpc.payments.getPaymentHistory.useQuery(
    { page: 1, limit: 10 },
    {
      enabled: !!user?.id,
    }
  )

  if (isLoading) {
    return <PaymentHistorySkeleton />
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t('loadingError')}</p>
      </div>
    )
  }

  const payments = paymentHistory?.payments || []

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('backToDashboard')}
        </Link>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
      </div>

      {payments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">{t('noRecords')}</h3>
            <p className="text-muted-foreground mb-6">
              {t('noRecordsDescription')}
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              {t('viewPricingPlans')}
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {t('paymentRecords')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments.map((payment: any) => (
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
                        {payment.planName || t('membershipPlan')}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(payment.createdAt).toLocaleDateString(
                          'en-US',
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
                        payment.currency as 'USD' | 'EUR'
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
                          ? t('status.succeeded')
                          : payment.status === 'pending'
                            ? t('status.pending')
                            : t('status.failed')}
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
                    {t('pagination', {
                      page: paymentHistory.pagination.page,
                      totalPages: paymentHistory.pagination.totalPages,
                    })}
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
                key={i}
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
    <AuthGuardClient requireAuth>
      <PaymentHistoryContent />
    </AuthGuardClient>
  )
}
