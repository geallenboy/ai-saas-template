'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ADMIN_LEVEL_NAMES } from '@/constants/auth'
import { trpc } from '@/lib/trpc/client'
import { useTranslations } from 'next-intl'

interface UserProfileClientProps {
  showAdminBadge?: boolean
}

export function UserProfileClient({
  showAdminBadge = true,
}: UserProfileClientProps) {
  const t = useTranslations('auth.userProfile')
  const {
    data: user,
    isLoading,
    error,
  } = trpc.auth.getCurrentUser.useQuery(undefined, {
    staleTime: 3 * 60 * 1000, // 3 minutes cache
    gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
  })

  if (isLoading) {
    return <UserProfileSkeleton />
  }

  if (error || !user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">
            {error ? t('loadError') : t('userNotFound')}
          </p>
        </CardContent>
      </Card>
    )
  }

  const initials =
    user.fullName
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() ||
    user.email?.[0]?.toUpperCase() ||
    'U'

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={user.avatarUrl || undefined}
              alt={user.fullName || user.email}
            />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>

          <div className="space-y-1">
            <h3 className="text-lg font-semibold">
              {user.fullName || t('nameNotSet')}
            </h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>

            {showAdminBadge && user.isAdmin && (
              <Badge variant="secondary">
                {ADMIN_LEVEL_NAMES[
                  user.adminLevel as keyof typeof ADMIN_LEVEL_NAMES
                ] || ADMIN_LEVEL_NAMES[0]}
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <div>
            <p className="text-sm font-medium">{t('joinDate')}</p>
            <p className="text-sm text-muted-foreground">
              {user.createdAt?.toLocaleDateString('de-DE')}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium">{t('lastLogin')}</p>
            <p className="text-sm text-muted-foreground">
              {user.lastLoginAt?.toLocaleDateString('de-DE') ||
                t('neverLoggedIn')}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium">{t('accountStatus')}</p>
            <Badge variant={user.isActive ? 'default' : 'destructive'}>
              {user.isActive ? t('active') : t('disabled')}
            </Badge>
          </div>

          <div>
            <p className="text-sm font-medium">{t('languagePreference')}</p>
            <p className="text-sm text-muted-foreground">
              {user.preferences?.language === 'de' ? t('german') : t('english')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function UserProfileSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-7 w-24" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>

        <div className="pt-4 border-t">
          <Skeleton className="h-4 w-16 mb-2" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
