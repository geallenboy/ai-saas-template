'use client'

import { AdminGuardClient } from '@/components/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { UserStatsClient } from '@/components/user'
import { useTranslations } from 'next-intl'
import { Suspense } from 'react'

function AdminDashboardContent() {
  const t = useTranslations('admin.dashboard')

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <Suspense fallback={<UserStatsSkeleton />}>
        <UserStatsClient />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('quickActions.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {t('quickActions.description')}
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href="/admin/users"
                className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
              >
                {t('quickActions.userManagement')}
              </a>
              <a
                href="/admin/settings"
                className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full hover:bg-green-200 transition-colors"
              >
                {t('quickActions.systemSettings')}
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('systemStatus.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">{t('systemStatus.database')}</span>
                <span className="text-sm text-green-600">
                  {t('systemStatus.status')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">{t('systemStatus.authService')}</span>
                <span className="text-sm text-green-600">
                  {t('systemStatus.status')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">
                  {t('systemStatus.paymentService')}
                </span>
                <span className="text-sm text-green-600">
                  {t('systemStatus.status')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function UserStatsSkeleton() {
  return (
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
  )
}

export default function AdminDashboardPage() {
  return (
    <AdminGuardClient>
      <AdminDashboardContent />
    </AdminGuardClient>
  )
}
