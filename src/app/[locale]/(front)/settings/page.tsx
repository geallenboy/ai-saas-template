'use client'

import {
  AuthGuardClient,
  ProfileForm,
  UserProfileClient,
} from '@/components/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Shield } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Suspense } from 'react'

function SettingsContent() {
  const t = useTranslations('admin.front.settings')

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">{t('description')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<SettingsComponentSkeleton />}>
          <UserProfileClient />
        </Suspense>

        <Suspense fallback={<SettingsComponentSkeleton />}>
          <ProfileForm />
        </Suspense>
      </div>

      {/* Account security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('security.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{t('security.loginMethod')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('security.loginMethodDescription')}
                </p>
              </div>
              <div className="text-sm text-green-600">
                {t('security.enabled')}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{t('security.twoFactor')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('security.twoFactorDescription')}
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                {t('security.twoFactorConfig')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SettingsComponentSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )
}

export default function SettingsPage() {
  return (
    <AuthGuardClient requireAuth>
      <SettingsContent />
    </AuthGuardClient>
  )
}
