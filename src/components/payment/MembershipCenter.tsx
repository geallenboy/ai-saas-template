'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MEMBERSHIP_STATUS } from '@/constants/payment'
import { useUserMembership } from '@/hooks/use-membership'
import { trpc } from '@/lib/trpc/client'
import { useUser } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
import {
  CreditCard,
  Crown,
  FileText,
  Globe,
  RefreshCw,
  Settings,
  Shield,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { PaymentHistoryClient } from './PaymentHistoryClient'
import { PricingPlans } from './PricingPlans'

export function MembershipCenter() {
  const { user } = useUser()
  const t = useTranslations('membershipCenter')
  const { membershipStatus, isLoading } = useUserMembership(user?.id)

  const { data: usageData, isLoading: usageLoading } =
    trpc.payments.getUserUsageStats.useQuery(
      { userId: user?.id },
      {
        enabled: !!user?.id,
        staleTime: 5 * 60 * 1000,
      }
    )

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">{t('loginToView')}</p>
            <Button asChild className="mt-4">
              <Link href="/auth/sign-in">{t('login')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-2">{t('description')}</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/pricing">
            <Crown className="mr-2 h-4 w-4" />
            {t('upgradePlan')}
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
          <TabsTrigger value="usage">{t('usageStatsTitle')}</TabsTrigger>
          <TabsTrigger value="billing">{t('billingManagement')}</TabsTrigger>
          <TabsTrigger value="settings">{t('settings')}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <MembershipStatusCard
              membershipStatus={membershipStatus}
              isLoading={isLoading}
            />
            <QuickActionsCard />
          </div>

          <UsageOverviewCard
            usageData={usageData}
            membershipStatus={membershipStatus}
            isLoading={usageLoading || isLoading}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <PaymentHistoryClient />
            <MembershipBenefitsCard membershipStatus={membershipStatus} />
          </div>
        </TabsContent>

        {/* Usage Statistics tab */}
        <TabsContent value="usage" className="space-y-6">
          <UsageStatsCard
            usageData={usageData}
            membershipStatus={membershipStatus}
            isLoading={usageLoading || isLoading}
          />
        </TabsContent>

        {/* Billing Management Tab */}
        <TabsContent value="billing" className="space-y-6">
          <BillingManagementCard membershipStatus={membershipStatus} />
          <PaymentHistoryClient />
        </TabsContent>

        {/* Set up tabs */}
        <TabsContent value="settings" className="space-y-6">
          <MembershipSettingsCard membershipStatus={membershipStatus} />
          <div className="pt-8">
            <h3 className="text-lg font-semibold mb-4">
              {t('upgradeOrChangePlan')}
            </h3>
            <PricingPlans showCurrentPlan />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Member status card
function MembershipStatusCard({
  membershipStatus,
  isLoading,
}: {
  membershipStatus: any
  isLoading: boolean
}) {
  const t = useTranslations('membershipCenter.statusCard')

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
        </CardContent>
      </Card>
    )
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
          <div className="text-center py-6">
            <div className="text-muted-foreground mb-4">{t('freeUser')}</div>
            <Badge variant="secondary">{t('freePlan')}</Badge>
            <Button asChild className="mt-4 w-full">
              <Link href="/pricing">{t('upgrade')}</Link>
            </Button>
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            {currentPlan?.nameDe || currentPlan?.name}
          </div>
          <Badge className={statusConfig?.color}>{statusConfig?.labelDe}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{t('billingCycle')}</p>
            <p className="font-medium">
              {membership?.durationType === 'yearly'
                ? t('yearly')
                : t('monthly')}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              {t('daysRemaining')}
            </p>
            <p className="font-medium text-green-600">
              {t('days', { count: daysRemaining })}
            </p>
          </div>
        </div>

        {endDate && (
          <div>
            <p className="text-sm text-muted-foreground">
              {t('expirationDate')}
            </p>
            <p className="font-medium">{endDate.toLocaleDateString('zh-CN')}</p>
          </div>
        )}

        <div className="pt-4">
          <div className="flex justify-between text-sm mb-2">
            <span>{t('membershipDuration')}</span>
            <span>
              {t('daysCount', {
                daysRemaining,
                durationDays: membership?.durationDays || 30,
              })}
            </span>
          </div>
          <Progress
            value={(daysRemaining / (membership?.durationDays || 30)) * 100}
            className="h-2"
          />
        </div>
      </CardContent>
    </Card>
  )
}

// Quick action card
function QuickActionsCard() {
  const t = useTranslations('membershipCenter.quickActions')
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          {t('title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button asChild variant="outline" className="w-full justify-start">
          <Link href="/pricing">
            <Crown className="mr-2 h-4 w-4" />
            {t('upgradePlan')}
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full justify-start">
          <Link href="/payment/history">
            <CreditCard className="mr-2 h-4 w-4" />
            {t('viewBilling')}
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full justify-start">
          <Link href="/settings">
            <Settings className="mr-2 h-4 w-4" />
            {t('accountSettings')}
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

// Use overview cards
function UsageOverviewCard({
  usageData,
  membershipStatus,
  isLoading,
}: {
  usageData: any
  membershipStatus: any
  isLoading: boolean
}) {
  const t = useTranslations('membershipCenter.usageOverview')
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-8 w-16 mx-auto mb-2" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentPlan = membershipStatus?.currentPlan
  const usage = usageData || {}

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {t('title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <UsageItem
            icon={<FileText className="h-5 w-5" />}
            label={t('useCases')}
            used={usage.usedUseCases || 0}
            limit={currentPlan?.maxUseCases || 0}
          />
          <UsageItem
            icon={<Globe className="h-5 w-5" />}
            label={t('tutorials')}
            used={usage.usedTutorials || 0}
            limit={currentPlan?.maxTutorials || 0}
          />
          <UsageItem
            icon={<Users className="h-5 w-5" />}
            label={t('blogs')}
            used={usage.usedBlogs || 0}
            limit={currentPlan?.maxBlogs || 0}
          />
          <UsageItem
            icon={<Zap className="h-5 w-5" />}
            label={t('apiCalls')}
            used={usage.usedApiCalls || 0}
            limit={currentPlan?.maxApiCalls || 0}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function UsageItem({
  icon,
  label,
  used,
  limit,
}: {
  icon: React.ReactNode
  label: string
  used: number
  limit: number
}) {
  const t = useTranslations('membershipCenter.usageOverview')
  const isUnlimited = limit === -1
  const percentage = isUnlimited ? 0 : (used / limit) * 100

  return (
    <div className="text-center">
      <div className="flex items-center justify-center mb-2 text-muted-foreground">
        {icon}
      </div>
      <div className="text-2xl font-bold">{used.toLocaleString()}</div>
      <div className="text-sm text-muted-foreground">
        {isUnlimited ? t('unlimited') : `/ ${limit.toLocaleString()}`}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
      {!isUnlimited && <Progress value={percentage} className="h-1 mt-2" />}
    </div>
  )
}

// Detailed usage statistics card
function UsageStatsCard({
  usageData,
  membershipStatus,
  isLoading,
}: {
  usageData: any
  membershipStatus: any
  isLoading: boolean
}) {
  const t = useTranslations('membershipCenter.usageStats')
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentPlan = membershipStatus?.currentPlan
  const usage = usageData || {}

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t('monthly.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DetailedUsageItem
            label={t('monthly.useCases')}
            used={usage.monthlyUseCases || 0}
            limit={currentPlan?.maxUseCases || 0}
            icon={<FileText className="h-4 w-4" />}
          />
          <DetailedUsageItem
            label={t('monthly.tutorials')}
            used={usage.monthlyTutorials || 0}
            limit={currentPlan?.maxTutorials || 0}
            icon={<Globe className="h-4 w-4" />}
          />
          <DetailedUsageItem
            label={t('monthly.blogs')}
            used={usage.monthlyBlogs || 0}
            limit={currentPlan?.maxBlogs || 0}
            icon={<Users className="h-4 w-4" />}
          />
          <DetailedUsageItem
            label={t('monthly.apiCalls')}
            used={usage.monthlyApiCalls || 0}
            limit={currentPlan?.maxApiCalls || 0}
            icon={<Zap className="h-4 w-4" />}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('total.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span>{t('total.useCases')}</span>
            </div>
            <span className="font-semibold">
              {(usage.usedUseCases || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span>{t('total.tutorials')}</span>
            </div>
            <span className="font-semibold">
              {(usage.usedTutorials || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{t('total.blogs')}</span>
            </div>
            <span className="font-semibold">
              {(usage.usedBlogs || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span>{t('total.apiCalls')}</span>
            </div>
            <span className="font-semibold">
              {(usage.usedApiCalls || 0).toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DetailedUsageItem({
  label,
  used,
  limit,
  icon,
}: {
  label: string
  used: number
  limit: number
  icon: React.ReactNode
}) {
  const isUnlimited = limit === -1
  const percentage = isUnlimited ? 0 : Math.min(100, (used / limit) * 100)

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {used.toLocaleString()}{' '}
          {isUnlimited ? '' : `/ ${limit.toLocaleString()}`}
        </span>
      </div>
      {!isUnlimited && <Progress value={percentage} className="h-2" />}
    </div>
  )
}

// Member benefits card
function MembershipBenefitsCard({
  membershipStatus,
}: { membershipStatus: any }) {
  const t = useTranslations('membershipCenter.benefits')
  const currentPlan = membershipStatus?.currentPlan
  const permissions = currentPlan?.permissions || {}

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          {t('title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <BenefitItem label={t('apiAccess')} enabled={permissions.apiAccess} />
        <BenefitItem
          label={t('customModels')}
          enabled={permissions.customModels}
        />
        <BenefitItem
          label={t('prioritySupport')}
          enabled={permissions.prioritySupport}
        />
        <BenefitItem label={t('exportData')} enabled={permissions.exportData} />
        <BenefitItem
          label={t('bulkOperations')}
          enabled={permissions.bulkOperations}
        />
        <BenefitItem
          label={t('advancedAnalytics')}
          enabled={permissions.advancedAnalytics}
        />
      </CardContent>
    </Card>
  )
}

function BenefitItem({ label, enabled }: { label: string; enabled: boolean }) {
  const t = useTranslations('membershipCenter.benefits')
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm">{label}</span>
      <Badge variant={enabled ? 'default' : 'secondary'}>
        {enabled ? t('enabled') : t('disabled')}
      </Badge>
    </div>
  )
}

// Bill management card
function BillingManagementCard({
  membershipStatus,
}: { membershipStatus: any }) {
  const t = useTranslations('membershipCenter.billing')
  const membership = membershipStatus?.membership

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          {t('title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              {t('currentBillingCycle')}
            </p>
            <p className="font-medium">
              {membership?.durationType === 'yearly'
                ? t('yearly')
                : t('monthly')}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('autoRenewal')}</p>
            <Badge variant={membership?.autoRenew ? 'default' : 'secondary'}>
              {membership?.autoRenew ? t('renewalOn') : t('renewalOff')}
            </Badge>
          </div>
        </div>

        {membership?.nextRenewalDate && (
          <div>
            <p className="text-sm text-muted-foreground">
              {t('nextRenewalDate')}
            </p>
            <p className="font-medium">
              {new Date(membership.nextRenewalDate).toLocaleDateString('zh-CN')}
            </p>
          </div>
        )}

        <Separator />

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('manageRenewal')}
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <FileText className="mr-2 h-4 w-4" />
            {t('downloadInvoice')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Member settings card
function MembershipSettingsCard({
  membershipStatus,
}: { membershipStatus: any }) {
  const t = useTranslations('membershipCenter.settingsCard')
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          {t('title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">{t('autoRenewal')}</p>
            <p className="text-sm text-muted-foreground">
              {t('autoRenewalDescription')}
            </p>
          </div>
          <Button variant="outline" size="sm">
            {t('manage')}
          </Button>
        </div>

        <Separator />

        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">{t('paymentMethod')}</p>
            <p className="text-sm text-muted-foreground">
              {t('paymentMethodDescription')}
            </p>
          </div>
          <Button variant="outline" size="sm">
            {t('setup')}
          </Button>
        </div>

        <Separator />

        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">{t('cancelMembership')}</p>
            <p className="text-sm text-muted-foreground">
              {t('cancelMembershipDescription')}
            </p>
          </div>
          <Button variant="destructive" size="sm">
            {t('cancel')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
