'use client'

import { AdminGuardClient } from '@/components/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { UserDetailClient } from '@/components/user'
import { ArrowLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Suspense } from 'react'

interface UserDetailPageProps {
  params: { id: string }
}

function UserDetailContent({ userId }: { userId: string }) {
  const t = useTranslations('admin.users.detail')

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('back')}
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{t('title')}</h1>
      </div>

      <Suspense fallback={<UserDetailSkeleton />}>
        <UserDetailClient userId={userId} />
      </Suspense>
    </div>
  )
}

function UserDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-24" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
  return (
    <AdminGuardClient>
      <UserDetailContent userId={params.id} />
    </AdminGuardClient>
  )
}
