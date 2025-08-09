'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { MEMBERSHIP_STATUS, formatPrice } from '@/constants/payment'
import { useUserMembership } from '@/hooks/use-membership'
import { useUser } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
import { Calendar, Shield } from 'lucide-react'

export function MembershipStatusClient() {
  const t = useTranslations('membershipStatus')
  const { user } = useUser()
  const { membershipStatus, isLoading } = useUserMembership(user?.id)

  if (isLoading) {
    return <MembershipStatusSkeleton />
  }

  if (!membershipStatus?.hasActiveMembership) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-muted-foreground mb-4">
              {t('noActivePlan')}
            </div>
            <Badge variant="secondary">{t('freeUser')}</Badge>
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
      {/* Member information card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t('title')}
            </div>
            <Badge className={statusConfig?.color}>
              {statusConfig?.labelDe}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {t('currentPlan')}
              </p>
              <p className="font-medium">
                {currentPlan?.nameDe || currentPlan?.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t('billingCycle')}
              </p>
              <p className="font-medium">
                {membership?.durationType === 'yearly'
                  ? t('yearly')
                  : t('monthly')}
              </p>
            </div>
          </div>

          {endDate && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">
                  {t('expirationDate')}
                </p>
                <div className="flex items-center gap-1 text-sm">
                  <Calendar className="h-4 w-4" />
                  {t('daysRemaining', { count: daysRemaining })}
                </div>
              </div>
              <p className="font-medium">
                {endDate.toLocaleDateString('zh-CN')}
              </p>
            </div>
          )}

          {membership?.purchaseAmount && (
            <div>
              <p className="text-sm text-muted-foreground">
                {t('paymentAmount')}
              </p>
              <p className="font-medium">
                {formatPrice(
                  Number(membership.purchaseAmount),
                  membership.currency as 'USD' | 'EUR'
                )}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function MembershipStatusSkeleton() {
  const t = useTranslations('membershipStatus')
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {t('currentPlan')}
              </p>
              <Skeleton className="h-6 w-20" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t('billingCycle')}
              </p>
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              {t('expirationDate')}
            </p>
            <Skeleton className="h-6 w-32" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
