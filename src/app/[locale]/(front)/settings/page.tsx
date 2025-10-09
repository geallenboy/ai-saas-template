'use client'

import { Suspense } from 'react'
import {
  AuthGuardClient,
  ProfileForm,
  UserProfileClient,
} from '@/components/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

function SettingsContent() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">账户设置</h1>
        <p className="text-muted-foreground mt-2">管理您的账户信息和偏好设置</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<SettingsComponentSkeleton />}>
          <UserProfileClient />
        </Suspense>

        <Suspense fallback={<SettingsComponentSkeleton />}>
          <ProfileForm />
        </Suspense>
      </div>
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
            <div key={`skeleton-${i}`} className="space-y-2">
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
    <AuthGuardClient>
      <SettingsContent />
    </AuthGuardClient>
  )
}
