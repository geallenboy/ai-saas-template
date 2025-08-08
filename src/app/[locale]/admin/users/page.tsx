'use client'

import { AdminGuardClient } from '@/components/auth'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { UserListClient, UserStatsClient } from '@/components/user'
import { useTranslations } from 'next-intl'
import { Suspense } from 'react'

function AdminUsersContent() {
  const t = useTranslations('admin.users')

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <Suspense fallback={<UserStatsSkeleton />}>
        <UserStatsClient />
      </Suspense>

      <Suspense fallback={<UserListSkeleton />}>
        <UserListClient />
      </Suspense>
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

function UserListSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminUsersPage() {
  return (
    <AdminGuardClient>
      <AdminUsersContent />
    </AdminGuardClient>
  )
}
