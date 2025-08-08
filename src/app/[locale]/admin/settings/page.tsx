'use client'

import { AdminGuardClient } from '@/components/auth'
import { SystemConfigManager } from '@/components/system'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslations } from 'next-intl'
import { Suspense } from 'react'

function AdminSettingsContent() {
  const t = useTranslations('admin.settings')

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">{t('tabs.general')}</TabsTrigger>
          <TabsTrigger value="payment">{t('tabs.payment')}</TabsTrigger>
          <TabsTrigger value="ai">{t('tabs.ai')}</TabsTrigger>
          <TabsTrigger value="notification">
            {t('tabs.notification')}
          </TabsTrigger>
          <TabsTrigger value="security">{t('tabs.security')}</TabsTrigger>
          <TabsTrigger value="feature">{t('tabs.feature')}</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('general.title')}</CardTitle>
              <CardDescription>{t('general.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<ConfigSkeleton />}>
                <SystemConfigManager category="general" />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('payment.title')}</CardTitle>
              <CardDescription>{t('payment.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<ConfigSkeleton />}>
                <SystemConfigManager category="payment" />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('ai.title')}</CardTitle>
              <CardDescription>{t('ai.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<ConfigSkeleton />}>
                <SystemConfigManager category="ai" />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notification" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('notification.title')}</CardTitle>
              <CardDescription>{t('notification.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<ConfigSkeleton />}>
                <SystemConfigManager category="notification" />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('security.title')}</CardTitle>
              <CardDescription>{t('security.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<ConfigSkeleton />}>
                <SystemConfigManager category="security" />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feature" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('feature.title')}</CardTitle>
              <CardDescription>{t('feature.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<ConfigSkeleton />}>
                <SystemConfigManager category="feature" />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ConfigSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="border-t pt-3">
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AdminSettingsPage() {
  return (
    <AdminGuardClient>
      <AdminSettingsContent />
    </AdminGuardClient>
  )
}
