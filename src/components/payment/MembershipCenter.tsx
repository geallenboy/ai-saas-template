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
            <p className="text-muted-foreground">请登录查看会员中心</p>
            <Button asChild className="mt-4">
              <Link href="/auth/sign-in">登录</Link>
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
          <h1 className="text-3xl font-bold">会员中心</h1>
          <p className="text-muted-foreground mt-2">
            管理您的会员权益和账单信息
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/pricing">
            <Crown className="mr-2 h-4 w-4" />
            升级计划
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="usage">使用统计</TabsTrigger>
          <TabsTrigger value="billing">账单管理</TabsTrigger>
          <TabsTrigger value="settings">设置</TabsTrigger>
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
            <h3 className="text-lg font-semibold mb-4">升级或更换计划</h3>
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
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            会员状态
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
            会员状态
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="text-muted-foreground mb-4">您当前是免费用户</div>
            <Badge variant="secondary">免费计划</Badge>
            <Button asChild className="mt-4 w-full">
              <Link href="/pricing">升级会员</Link>
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
            {currentPlan?.nameZh || currentPlan?.name}
          </div>
          <Badge className={statusConfig?.color}>{statusConfig?.labelDe}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">计费周期</p>
            <p className="font-medium">
              {membership?.durationType === 'yearly' ? '年付' : '月付'}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">剩余天数</p>
            <p className="font-medium text-green-600">{daysRemaining} 天</p>
          </div>
        </div>

        {endDate && (
          <div>
            <p className="text-sm text-muted-foreground">到期时间</p>
            <p className="font-medium">{endDate.toLocaleDateString('zh-CN')}</p>
          </div>
        )}

        <div className="pt-4">
          <div className="flex justify-between text-sm mb-2">
            <span>会员时长</span>
            <span>
              {daysRemaining} / {membership?.durationDays || 30} 天
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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          快捷操作
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button asChild variant="outline" className="w-full justify-start">
          <Link href="/pricing">
            <Crown className="mr-2 h-4 w-4" />
            升级计划
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full justify-start">
          <Link href="/payment/history">
            <CreditCard className="mr-2 h-4 w-4" />
            查看账单
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full justify-start">
          <Link href="/settings">
            <Settings className="mr-2 h-4 w-4" />
            账户设置
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
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            使用概览
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
          使用概览
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <UsageItem
            icon={<FileText className="h-5 w-5" />}
            label="用例"
            used={usage.usedUseCases || 0}
            limit={currentPlan?.maxUseCases || 0}
          />
          <UsageItem
            icon={<Globe className="h-5 w-5" />}
            label="教程"
            used={usage.usedTutorials || 0}
            limit={currentPlan?.maxTutorials || 0}
          />
          <UsageItem
            icon={<Users className="h-5 w-5" />}
            label="博客"
            used={usage.usedBlogs || 0}
            limit={currentPlan?.maxBlogs || 0}
          />
          <UsageItem
            icon={<Zap className="h-5 w-5" />}
            label="API调用"
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
  const isUnlimited = limit === -1
  const percentage = isUnlimited ? 0 : (used / limit) * 100

  return (
    <div className="text-center">
      <div className="flex items-center justify-center mb-2 text-muted-foreground">
        {icon}
      </div>
      <div className="text-2xl font-bold">{used.toLocaleString()}</div>
      <div className="text-sm text-muted-foreground">
        {isUnlimited ? '无限制' : `/ ${limit.toLocaleString()}`}
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
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>详细使用统计</CardTitle>
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
          <CardTitle>本月使用统计</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DetailedUsageItem
            label="用例生成"
            used={usage.monthlyUseCases || 0}
            limit={currentPlan?.maxUseCases || 0}
            icon={<FileText className="h-4 w-4" />}
          />
          <DetailedUsageItem
            label="教程创建"
            used={usage.monthlyTutorials || 0}
            limit={currentPlan?.maxTutorials || 0}
            icon={<Globe className="h-4 w-4" />}
          />
          <DetailedUsageItem
            label="博客发布"
            used={usage.monthlyBlogs || 0}
            limit={currentPlan?.maxBlogs || 0}
            icon={<Users className="h-4 w-4" />}
          />
          <DetailedUsageItem
            label="API调用"
            used={usage.monthlyApiCalls || 0}
            limit={currentPlan?.maxApiCalls || 0}
            icon={<Zap className="h-4 w-4" />}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>累计使用统计</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span>总用例数</span>
            </div>
            <span className="font-semibold">
              {(usage.usedUseCases || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span>总教程数</span>
            </div>
            <span className="font-semibold">
              {(usage.usedTutorials || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>总博客数</span>
            </div>
            <span className="font-semibold">
              {(usage.usedBlogs || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span>总API调用</span>
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
  const currentPlan = membershipStatus?.currentPlan
  const permissions = currentPlan?.permissions || {}

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          会员权益
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <BenefitItem label="API访问权限" enabled={permissions.apiAccess} />
        <BenefitItem label="自定义模型" enabled={permissions.customModels} />
        <BenefitItem
          label="优先客服支持"
          enabled={permissions.prioritySupport}
        />
        <BenefitItem label="数据导出" enabled={permissions.exportData} />
        <BenefitItem label="批量操作" enabled={permissions.bulkOperations} />
        <BenefitItem label="高级分析" enabled={permissions.advancedAnalytics} />
      </CardContent>
    </Card>
  )
}

function BenefitItem({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm">{label}</span>
      <Badge variant={enabled ? 'default' : 'secondary'}>
        {enabled ? '已开启' : '未开启'}
      </Badge>
    </div>
  )
}

// Bill management card
function BillingManagementCard({
  membershipStatus,
}: { membershipStatus: any }) {
  const membership = membershipStatus?.membership

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          账单管理
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">当前计费周期</p>
            <p className="font-medium">
              {membership?.durationType === 'yearly' ? '年付' : '月付'}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">自动续费</p>
            <Badge variant={membership?.autoRenew ? 'default' : 'secondary'}>
              {membership?.autoRenew ? '已开启' : '已关闭'}
            </Badge>
          </div>
        </div>

        {membership?.nextRenewalDate && (
          <div>
            <p className="text-sm text-muted-foreground">下次续费时间</p>
            <p className="font-medium">
              {new Date(membership.nextRenewalDate).toLocaleDateString('zh-CN')}
            </p>
          </div>
        )}

        <Separator />

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <RefreshCw className="mr-2 h-4 w-4" />
            管理续费
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <FileText className="mr-2 h-4 w-4" />
            下载发票
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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          会员设置
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">自动续费</p>
            <p className="text-sm text-muted-foreground">到期时自动续费会员</p>
          </div>
          <Button variant="outline" size="sm">
            管理
          </Button>
        </div>

        <Separator />

        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">支付方式</p>
            <p className="text-sm text-muted-foreground">管理您的支付方式</p>
          </div>
          <Button variant="outline" size="sm">
            设置
          </Button>
        </div>

        <Separator />

        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">取消会员</p>
            <p className="text-sm text-muted-foreground">取消当前会员计划</p>
          </div>
          <Button variant="destructive" size="sm">
            取消
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
